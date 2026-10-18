from fastapi import APIRouter, Depends, HTTPException, Request
from redis.asyncio import Redis

from app.api.routes.dependencies import client_identity, get_redis
from app.core.config import get_settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai import (
    AIConfigurationError,
    AIInvalidResponseError,
    AIProviderPermanentError,
    AIProviderRateLimitError,
    AIProviderTemporaryError,
    generate_chat_answer,
)
from app.services.rate_limit import RateLimitUnavailable, enforce_rate_limit

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, request: Request, redis: Redis = Depends(get_redis)) -> ChatResponse:
    settings = get_settings()
    try:
        await enforce_rate_limit(redis, "chat", client_identity(request), settings.chat_limit_per_minute)
        answer = await generate_chat_answer(body.messages)
        return ChatResponse(answer=answer)
    except RateLimitUnavailable as error:
        raise HTTPException(status_code=503, detail="The assistant is temporarily unavailable. Please try again shortly.") from error
    except AIProviderRateLimitError as error:
        raise HTTPException(status_code=429, detail="The assistant is busy. Please try again shortly.", headers={"Retry-After": "30"}) from error
    except AIProviderTemporaryError as error:
        raise HTTPException(status_code=503, detail="The assistant is temporarily unavailable. Please try again.") from error
    except AIConfigurationError as error:
        raise HTTPException(status_code=503, detail="The assistant is not configured yet. Please contact the site owner.") from error
    except (AIProviderPermanentError, AIInvalidResponseError) as error:
        raise HTTPException(status_code=502, detail="The assistant could not complete that response. Please try again.") from error
