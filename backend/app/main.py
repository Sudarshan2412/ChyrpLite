from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.whapi.routes import auth, posts, taxonomy, engagement, uploads, sitemap, captcha, rss, admin
from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import get_settings
from fastapi.staticfiles import StaticFiles
from app.core.middleware import ViewsAndRateLimitMiddleware
import os

settings = get_settings()
app = FastAPI(title=settings.project_name)
app.add_middleware(ViewsAndRateLimitMiddleware)


# Add your Vercel frontend domain here:
frontend_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
    "https://chyrplite-49c413eaf-sudarshan-s-ns-projects.vercel.app",  # Vercel domain, no trailing slash
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(frontend_origins)),  # de-duplicate
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(taxonomy.router)
app.include_router(engagement.router)
app.include_router(uploads.router)
app.include_router(sitemap.router)
app.include_router(captcha.router)
app.include_router(rss.router)
app.include_router(admin.router)

@app.get('/healthz')
def healthz():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

settings = get_settings()
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=settings.upload_dir), name='uploads')

@app.get('/')
def root():
    return {"message": f"Welcome to {settings.project_name}"}
