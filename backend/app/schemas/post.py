from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from app.models.post import PostType


class PostBase(BaseModel):
    type: PostType
    title: str  # compulsory
    body: str | None = None
    extra: str | None = None

class PostCreate(PostBase):
    captcha_id: str
    captcha_answer: int

class PostUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    extra: str | None = None

class PostOut(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    views: int

    class Config:
        from_attributes = True
