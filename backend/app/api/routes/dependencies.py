from fastapi import Request
from redis.asyncio import Redis


def get_redis(request: Request) -> Redis:
    return request.app.state.redis


def client_identity(request: Request) -> str:
    # Only the direct connection peer is trusted. Configure a trusted proxy at the edge.
    return request.client.host if request.client else "unknown"
