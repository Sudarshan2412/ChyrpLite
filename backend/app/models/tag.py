from __future__ import annotations
from sqlalchemy import String, Integer, DateTime, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.core.database import Base

class Tag(Base):
    __tablename__ = 'tags'
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

# Association table for many-to-many Post <-> Tag
post_tags = Table(
    'post_tags', Base.metadata,
    mapped_column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    mapped_column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)
