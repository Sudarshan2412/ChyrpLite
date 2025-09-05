from __future__ import annotations
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.post import Post
from app.core.config import get_settings
from datetime import datetime
from html import escape

router = APIRouter(tags=['rss'])
settings = get_settings()

@router.get('/rss.xml', response_class=Response)
def rss_feed(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(50).all()
    items = []
    for p in posts:
        title = escape(p.title or p.type.value)
        link = f"{settings.base_url}/post/{p.id}"
        pub = p.created_at.strftime('%a, %d %b %Y %H:%M:%S +0000')
        desc = escape((p.body or '')[:500])
        items.append(f"<item><title>{title}</title><link>{link}</link><pubDate>{pub}</pubDate><description>{desc}</description></item>")
    xml = f"<?xml version='1.0' encoding='UTF-8'?><rss version='2.0'><channel><title>{escape(settings.project_name)}</title><link>{settings.base_url}</link><description>{escape(settings.project_name)} feed</description>{''.join(items)}</channel></rss>"
    return Response(content=xml, media_type='application/rss+xml')