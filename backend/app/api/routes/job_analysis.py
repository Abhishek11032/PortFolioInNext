import asyncio

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from redis.asyncio import Redis

from app.api.routes.dependencies import client_identity, get_redis
from app.core.config import get_settings
from app.schemas.job_analysis import JobFitReport
from app.services.ai import (
    AIConfigurationError,
    AIInvalidResponseError,
    AIProviderPermanentError,
    AIProviderRateLimitError,
    AIProviderTemporaryError,
    analyze_job_fit_sync,
)
from app.services.document_parser import DocumentValidationError, extract_job_text
from app.services.rate_limit import RateLimitUnavailable, enforce_rate_limit

router = APIRouter()


@router.post("/job-analysis", response_model=JobFitReport)
async def analyze_job_description(
    request: Request,
    job_description: str | None = Form(default=None, max_length=30_000),
    file: UploadFile | None = File(default=None),
    redis: Redis = Depends(get_redis),
) -> JobFitReport:
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

    # Each configured provider gets at most one bounded request before fallback.
    deadline_seconds = (settings.ai_timeout_seconds * 3) + 5
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(analyze_job_fit_sync, description),
            timeout=deadline_seconds,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="The analysis took too long. Please try again later.",
        ) from None
    except AIProviderRateLimitError as error:
        raise HTTPException(status_code=429, detail=error.public_message, headers={"Retry-After": "60"}) from error
    except AIConfigurationError as error:
        raise HTTPException(
            status_code=503,
            detail="The analysis service is not configured. Please contact the site owner.",
        ) from error
    except AIProviderTemporaryError as error:
        raise HTTPException(
            status_code=503,
            detail="The analysis service is temporarily unavailable. Please try again shortly.",
        ) from error
    except (AIInvalidResponseError, AIProviderPermanentError) as error:
        raise HTTPException(
            status_code=502,
            detail="The analysis could not be completed. Please try again later.",
        ) from error
