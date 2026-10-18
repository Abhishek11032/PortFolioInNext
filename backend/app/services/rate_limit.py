from redis.asyncio import Redis


_INCREMENT_SCRIPT = """
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
"""


class RateLimitUnavailable(Exception):
    pass


async def enforce_rate_limit(redis: Redis, bucket: str, identity: str, limit: int, window_seconds: int = 60) -> None:
    try:
        count = int(await redis.eval(_INCREMENT_SCRIPT, 1, f"rate:{bucket}:{identity}", window_seconds))
    except Exception as error:
        raise RateLimitUnavailable from error
    if count > limit:
        from fastapi import HTTPException

        raise HTTPException(status_code=429, detail="Request limit reached. Please try again shortly.", headers={"Retry-After": str(window_seconds)})
