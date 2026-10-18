from celery.utils.log import get_task_logger

from app.services.ai import (
    AIConfigurationError,
    AIInvalidResponseError,
    AIProviderPermanentError,
    AIProviderRateLimitError,
    AIProviderTemporaryError,
    analyze_job_fit_sync,
)
from app.tasks.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, name="app.tasks.job_analysis.analyze_job_fit", max_retries=3)
def analyze_job_fit(self, job_description: str) -> dict:
    self.update_state(state="PROGRESS", meta={"phase": "Comparing profile evidence"})
    try:
        return analyze_job_fit_sync(job_description).model_dump(mode="json")
    except AIProviderRateLimitError as error:
        logger.warning("Job-fit task %s stopped after provider rate limits", self.request.id)
        raise error
    except AIProviderTemporaryError as error:
        raise self.retry(exc=error, countdown=min(60, 2 ** (self.request.retries + 1)))
    except (AIConfigurationError, AIInvalidResponseError, AIProviderPermanentError) as error:
        logger.warning("Job-fit task %s failed validation/configuration/provider policy", self.request.id)
        raise
    except Exception as error:
        logger.error("Job-fit task %s failed unexpectedly", self.request.id)
        raise self.retry(exc=error, countdown=min(60, 2 ** (self.request.retries + 1)))
