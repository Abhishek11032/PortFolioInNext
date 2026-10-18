import asyncio
import hashlib
import secrets
from uuid import UUID

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Request, UploadFile
from redis.asyncio import Redis

from app.api.routes.dependencies import client_identity, get_redis
from app.core.config import get_settings
from app.schemas.job_analysis import JobAnalysisAccepted, JobAnalysisStatus, JobFitReport
from app.services.ai import AIConfigurationError, AIProviderRateLimitError
from app.services.document_parser import DocumentValidationError, extract_job_text
from app.services.rate_limit import RateLimitUnavailable, enforce_rate_limit
from app.tasks.celery_app import celery_app
from app.tasks.job_analysis import analyze_job_fit

router = APIRouter()


@router.post("/job-analysis", response_model=JobAnalysisAccepted, status_code=202)
async def submit_job_analysis(
    request: Request,
    job_description: str | None = Form(default=None, max_length=30_000),
    file: UploadFile | None = File(default=None),
    redis: Redis = Depends(get_redis),
) -> JobAnalysisAccepted:
    settings = get_settings()
    if (job_description is None) == (file is None):
        raise HTTPException(status_code=400, detail="Provide either job-description text or one PDF/DOCX file.")
    try:
        await enforce_rate_limit(redis, "job-analysis", client_identity(request), settings.job_analysis_limit_per_minute)
        if file:
            try:
                data = await file.read(settings.max_job_upload_bytes + 1)
                if len(data) > settings.max_job_upload_bytes:
                    raise HTTPException(status_code=413, detail="The uploaded file exceeds the upload size limit.")
                description = extract_job_text(file.filename or "", file.content_type, data)
            finally:
                await file.close()
        else:
            description = (job_description or "").strip()
            if len(description) < 40:
                raise DocumentValidationError("Enter a job description with at least 40 characters.")
            if len(description) > settings.max_job_text_chars:
                raise DocumentValidationError("The job description is too long to analyze.")
    except RateLimitUnavailable as error:
        raise HTTPException(status_code=503, detail="Job analysis is temporarily unavailable. Please try again shortly.") from error
    except DocumentValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    task_id = str(UUID(bytes=secrets.token_bytes(16), version=4))
    access_token = secrets.token_urlsafe(32)
    try:
        await redis.set(f"analysis-access:{task_id}", hashlib.sha256(access_token.encode()).hexdigest(), ex=settings.analysis_access_ttl_seconds)
        analyze_job_fit.apply_async(args=[description], task_id=task_id)
    except Exception as error:
        try:
            await redis.delete(f"analysis-access:{task_id}")
        except Exception:
            pass
        raise HTTPException(status_code=503, detail="The analysis queue is unavailable. Please try again later.") from error
    return JobAnalysisAccepted(task_id=task_id, access_token=access_token)


@router.get("/job-analysis/{task_id}", response_model=JobAnalysisStatus)
async def get_job_analysis(
    task_id: str,
    x_analysis_token: str = Header(default="", alias="X-Analysis-Token"),
    redis: Redis = Depends(get_redis),
) -> JobAnalysisStatus:
    try:
        UUID(task_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail="Analysis not found or expired.") from error
    try:
        expected_hash = await redis.get(f"analysis-access:{task_id}")
    except Exception as error:
        raise HTTPException(status_code=503, detail="Analysis status is temporarily unavailable.") from error
    supplied_hash = hashlib.sha256(x_analysis_token.encode()).hexdigest() if x_analysis_token else ""
    if not expected_hash or not secrets.compare_digest(expected_hash, supplied_hash):
        raise HTTPException(status_code=404, detail="Analysis not found or expired.")

    try:
        task = await asyncio.to_thread(AsyncResult, task_id, app=celery_app)
        state = task.state
        if state in {"PENDING", "RECEIVED"}:
            return JobAnalysisStatus(task_id=task_id, status="queued", phase="Waiting for an available worker")
        if state in {"STARTED", "PROGRESS", "RETRY"}:
            info = task.info if isinstance(task.info, dict) else {}
            return JobAnalysisStatus(task_id=task_id, status="processing", phase=info.get("phase", "Comparing profile evidence"))
        if state == "SUCCESS":
            try:
                report = JobFitReport.model_validate(task.result)
            except Exception:
                return JobAnalysisStatus(task_id=task_id, status="failed", error="The analysis returned an invalid report. Please submit the job description again.")
            return JobAnalysisStatus(task_id=task_id, status="completed", report=report)
        if state in {"FAILURE", "REVOKED"}:
            if isinstance(task.result, AIProviderRateLimitError):
                return JobAnalysisStatus(task_id=task_id, status="failed", error=AIProviderRateLimitError.public_message)
            if isinstance(task.result, AIConfigurationError):
                return JobAnalysisStatus(task_id=task_id, status="failed", error="The analysis service is not configured. Please contact the site owner.")
            return JobAnalysisStatus(task_id=task_id, status="failed", error="The analysis could not be completed. Please submit the job description again.")
        return JobAnalysisStatus(task_id=task_id, status="queued", phase="Waiting for an available worker")
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=503, detail="Analysis status is temporarily unavailable.") from error
