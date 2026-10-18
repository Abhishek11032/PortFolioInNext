import pytest
from fastapi.testclient import TestClient

from app.api.routes.dependencies import get_redis
from app.main import app


class FakeRedis:
    def __init__(self):
        self.values = {}
        self.counts = {}

    async def eval(self, _script, _numkeys, key, _ttl):
        self.counts[key] = self.counts.get(key, 0) + 1
        return self.counts[key]

    async def set(self, key, value, ex=None):
        self.values[key] = value

    async def get(self, key):
        return self.values.get(key)

    async def delete(self, key):
        self.values.pop(key, None)

    async def ping(self):
        return True


@pytest.fixture
def fake_redis():
    return FakeRedis()


@pytest.fixture
def client(fake_redis):
    app.dependency_overrides[get_redis] = lambda: fake_redis
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
