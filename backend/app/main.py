from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis

from app.api.routes import chat, job_analysis
from app.api.routes.dependencies import get_redis
from app.core.config import get_settings


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    application.state.redis = Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=2, socket_timeout=2)
    try:
        yield
    finally:
        await application.state.redis.aclose()


settings = get_settings()
app = FastAPI(title="Portfolio AI Backend", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def add_security_headers(_request: Request, call_next):
    response: Response = await call_next(_request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


app.include_router(chat.router, prefix="/api/v1")
app.include_router(job_analysis.router, prefix="/api/v1")


@app.get("/health")
async def health(redis: Redis = Depends(get_redis)):
    try:
        await redis.ping()
    except Exception as error:
        raise HTTPException(status_code=503, detail="Redis is unavailable.") from error
    return {"status": "ok", "redis": "ok"}
