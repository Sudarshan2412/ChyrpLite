from __future__ import annotations
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import get_settings

class Base(DeclarativeBase):
    pass

_settings = get_settings()
_engine = create_engine(_settings.database_url, echo=False, future=True)
SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False, expire_on_commit=False)

def get_engine():
    return _engine

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
