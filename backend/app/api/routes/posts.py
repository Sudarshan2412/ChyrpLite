from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.post import Post, PostType
from app.models.user import User
from jose import JWTError, jwt
from app.core.config import get_settings
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.services.mentions import extract_mentions
from app.services.cache import cache_get, cache_set
from app.schemas.post import PostCreate, PostOut, PostUpdate
from typing import List, Optional

router = APIRouter(prefix='/posts', tags=['posts'])
settings = get_settings()
bearer = HTTPBearer(auto_error=False)

def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db)
):
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = creds.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        sub = payload.get('sub')
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(sub))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

from app.services.captcha import verify_challenge

@router.post('/', response_model=PostOut)
@router.post('', response_model=PostOut)
def create_post(payload: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not payload.captcha_id or payload.captcha_answer is None or not verify_challenge(payload.captcha_id, payload.captcha_answer):
        raise HTTPException(status_code=400, detail='Invalid captcha')
    post_data = payload.model_dump(exclude={"captcha_id", "captcha_answer"})
    post = Post(author_id=current_user.id, **post_data)
    db.add(post)
    db.commit()
    db.refresh(post)
    _ = extract_mentions(post.body)
    return post

@router.get('/')
@router.get('')
def list_posts(db: Session = Depends(get_db), page: int = 1, page_size: int = 10, type: Optional[PostType] = None, cache: bool = True):
    if page < 1:
        page = 1
    key = None
    if cache and page == 1 and type is None:
        key = 'posts:first_page_v2'
        cached = cache_get(key)
        if cached:
            import json
            return cached
    q = db.query(Post)
    if type:
        q = q.filter(Post.type == type)
    total = q.count()
    offset = (page - 1) * page_size
    items = q.order_by(Post.created_at.desc()).offset(offset).limit(page_size).all()
    next_page = page + 1 if offset + page_size < total else None
    payload = {
        "items": [PostOut.model_validate(p).model_dump() for p in items],
        "next_page": next_page
    }
    if key:
        try:
            import json
            cache_set(key, json.dumps(payload), ex=60)
        except Exception:
            pass
    return payload

@router.get('/{post_id}', response_model=PostOut)
def get_post(post_id: int, request: Request, db: Session = Depends(get_db)):
    post = db.query(Post).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Unique user key: user_id if logged in, else IP
    user_id = None
    try:
        token = request.headers.get("authorization")
        if token and token.lower().startswith("bearer "):
            from jose import jwt
            settings = get_settings()
            payload = jwt.decode(token[7:], settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            user_id = payload.get("sub")
    except Exception:
        user_id = None
    if user_id:
        unique_key = f"viewed:post:{post_id}:user:{user_id}"
    else:
        ip = request.client.host if request.client else "anon"
        unique_key = f"viewed:post:{post_id}:ip:{ip}"
    from app.services.cache import cache_get, cache_set
    cache_value = cache_get(unique_key)
    import logging
    logging.warning(f"[VIEW-DEBUG] post_id={post_id} unique_key={unique_key} cache_value={cache_value}")
    if not cache_value:
        post.views += 1
        db.commit()
        db.refresh(post)
        cache_set(unique_key, "1", ex=60*60*12)  # 12 hours
        logging.warning(f"[VIEW-DEBUG] INCREMENTED post_id={post_id} unique_key={unique_key} new_views={post.views}")
    else:
        logging.warning(f"[VIEW-DEBUG] SKIPPED INCREMENT post_id={post_id} unique_key={unique_key} views={post.views}")
    return post

@router.patch('/{post_id}', response_model=PostOut)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Post).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return post

@router.delete('/{post_id}')
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Only author or admin can delete
    if post.author_id != current_user.id and not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not allowed to delete this post")
    db.delete(post)
    db.commit()
    return {"ok": True}
