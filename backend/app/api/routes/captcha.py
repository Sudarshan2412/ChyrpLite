from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.captcha import new_challenge, verify_challenge

router = APIRouter(prefix='/captcha', tags=['captcha'])

class CaptchaVerify(BaseModel):
    id: str
    answer: int

@router.get('/new')
def captcha_new():
    return new_challenge()

@router.post('/verify')
def captcha_verify(payload: CaptchaVerify):
    if verify_challenge(payload.id, payload.answer):
        return {"ok": True}
    raise HTTPException(status_code=400, detail='Invalid captcha')