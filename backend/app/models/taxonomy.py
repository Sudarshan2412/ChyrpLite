from __future__ import annotations
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Tag(Base):
    __tablename__ = 'tags'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, index=True)

class Category(Base):
    __tablename__ = 'categories'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, index=True)

class PostTag(Base):
    __tablename__ = 'post_tags'
    post_id: Mapped[int] = mapped_column(ForeignKey('posts.id', ondelete='CASCADE'), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)

class PostCategory(Base):
    __tablename__ = 'post_categories'
    post_id: Mapped[int] = mapped_column(ForeignKey('posts.id', ondelete='CASCADE'), primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id', ondelete='CASCADE'), primary_key=True)
