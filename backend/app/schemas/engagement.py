from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    post_id: int
    body: str

class CommentOut(CommentCreate):
    id: int
    author_id: int | None
    created_at: datetime
    class Config:
        from_attributes = True

class LikeOut(BaseModel):
    post_id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
