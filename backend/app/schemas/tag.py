from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
