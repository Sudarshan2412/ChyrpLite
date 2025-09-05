from __future__ import annotations
from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.post import Post
from app.core.config import get_settings
from datetime import datetime

router = APIRouter(tags=['sitemap'])
settings = get_settings()

@router.get('/sitemap.xml', response_class=Response)
def sitemap(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(500).all()
    items = []
    for p in posts:
        loc = f"{settings.base_url}/post/{p.id}"
        lastmod = p.updated_at.strftime('%Y-%m-%d')
        items.append(f"<url><loc>{loc}</loc><lastmod>{lastmod}</lastmod></url>")
    xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + ''.join(items) + "</urlset>"
    return Response(content=xml, media_type='application/xml')
