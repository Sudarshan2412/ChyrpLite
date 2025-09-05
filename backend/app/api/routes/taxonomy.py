from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.taxonomy import Tag, Category
from app.schemas.taxonomy import TagCreate, TagOut, CategoryCreate, CategoryOut
from typing import List

router = APIRouter(prefix='/taxonomy', tags=['taxonomy'])

@router.post('/tags', response_model=TagOut)
def create_tag(payload: TagCreate, db: Session = Depends(get_db)):
    existing = db.query(Tag).filter(Tag.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail='Tag exists')
    tag = Tag(name=payload.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@router.get('/tags', response_model=List[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()

@router.post('/categories', response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail='Category exists')
    category = Category(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get('/categories', response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()
