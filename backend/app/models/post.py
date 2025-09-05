from __future__ import annotations
from sqlalchemy import String, ForeignKey, DateTime, Enum, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.core.database import Base
import enum

class PostType(str, enum.Enum):
    text = "text"
    photo = "photo"
    quote = "quote"
    link = "link"
    video = "video"
    audio = "audio"
    uploader = "uploader"

class Post(Base):
    __tablename__ = 'posts'
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    type: Mapped[PostType] = mapped_column(Enum(PostType), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string for per-type data
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    views: Mapped[int] = mapped_column(Integer, default=0)

    author = relationship('User')
