from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.deps.auth import require_admin

router = APIRouter(prefix='/admin', tags=['admin'])

@router.get('/stats')
def stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).count()
    return {"users": users}
