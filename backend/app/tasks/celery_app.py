from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "portfolio_backend",
    broker=settings.broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.job_analysis"],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    result_expires=settings.analysis_access_ttl_seconds,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    worker_concurrency=settings.celery_worker_concurrency,
    task_soft_time_limit=settings.celery_soft_time_limit_seconds,
    task_time_limit=settings.celery_time_limit_seconds,
    broker_connection_retry_on_startup=True,
)
