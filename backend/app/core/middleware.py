from __future__ import annotations
"""Custom middleware: IP rate limiting, post view increment, basic access logging.

Response headers added:
  X-RateLimit-Limit
  X-RateLimit-Remaining
  X-Response-Time-ms
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from collections import defaultdict
import time
import logging
from app.core.database import SessionLocal
from app.models.post import Post
from app.services.cache import cache_status

_hits: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 100
WINDOW = 60  # seconds

logger = logging.getLogger("app.access")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)



class ViewsAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        ip = request.client.host if request.client else 'unknown'
        now = time.time()
        hits = _hits[ip]
        hits.append(now)
        cutoff = now - WINDOW
        while hits and hits[0] < cutoff:
            hits.pop(0)
        if len(hits) > RATE_LIMIT:
            resp = Response(status_code=429, content="Too Many Requests")
            resp.headers['X-RateLimit-Limit'] = str(RATE_LIMIT)
            resp.headers['X-RateLimit-Remaining'] = '0'
            resp.headers['X-Cache-Status'] = cache_status()
            return resp

        start = time.perf_counter()
        response: Response = await call_next(request)

        # Increment view count for GET /posts/{id}
        if request.method == 'GET' and response.status_code == 200 and request.url.path.startswith('/posts/'):
            parts = request.url.path.split('/')
            if len(parts) >= 3 and parts[2].isdigit():
                pid = int(parts[2])
                try:
                    with SessionLocal() as db:
                        post = db.get(Post, pid)
                        if post:
                            post.views += 1
                            db.commit()
                except Exception:
                    pass

        duration_ms = (time.perf_counter() - start) * 1000
        response.headers['X-RateLimit-Limit'] = str(RATE_LIMIT)
        response.headers['X-RateLimit-Remaining'] = str(max(0, RATE_LIMIT - len(hits)))
        response.headers['X-Response-Time-ms'] = f"{duration_ms:.2f}"
        response.headers['X-Cache-Status'] = cache_status()
        logger.info(f"{ip} {request.method} {request.url.path} {response.status_code} {duration_ms:.2f}ms")
        return response