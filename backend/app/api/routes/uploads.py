from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, HTTPException
from uuid import uuid4
from app.services.storage import save_file
from app.core.config import get_settings

router = APIRouter(prefix='/upload', tags=['upload'])
settings = get_settings()

@router.post('/')
async def upload_file(file: UploadFile = File(...)):
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='File too large')
    ext = (file.filename or '').split('.')[-1]
    name = f"{uuid4().hex}.{ext}" if ext else uuid4().hex
    save_file(name, file.file)
    url = f"{settings.base_url}/uploads/{name}"
    return {"filename": name, "url": url}
