from __future__ import annotations
from pydantic import BaseModel

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True
