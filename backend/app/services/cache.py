from __future__ import annotations
from typing import Any, Optional
from app.core.config import get_settings


_settings = get_settings()
_redis = None
_cache_enabled = True
_cache_status = "miss"

try:
    if _settings.redis_url:
        import redis  # type: ignore
        _redis = redis.Redis.from_url(_settings.redis_url)
        # Health check
        try:
            _redis.ping()
            _cache_enabled = True
            _cache_status = "ok"
        except Exception:
            _redis = None
            _cache_enabled = False
            _cache_status = "down"
    else:
        _cache_enabled = False
        _cache_status = "disabled"
except Exception:
    _redis = None
    _cache_enabled = False
    _cache_status = "error"


def cache_get(key: str) -> Optional[str]:
    global _cache_status
    if not _cache_enabled or not _redis:
        _cache_status = "bypass"
        return None
    try:
        val = _redis.get(key)
        if val:
            _cache_status = "hit"
            return val.decode()
        else:
            _cache_status = "miss"
            return None
    except Exception:
        _cache_status = "error"
        return None

def cache_set(key: str, value: str, ex: int = 300) -> None:
    if not _cache_enabled or not _redis:
        return
    try:
        _redis.set(key, value, ex=ex)
    except Exception:
        pass

def cache_status() -> str:
    return _cache_status
