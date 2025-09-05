from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.models.engagement import Comment, Like
from app.models.post import Post
from app.models.user import User
from app.schemas.engagement import CommentCreate, CommentOut, LikeOut
from app.services.mentions import extract_mentions
from typing import List
from fastapi import status, HTTPException, Depends, Request
import logging
from app.api.routes.posts import get_current_user

router = APIRouter(prefix='/engagement', tags=['engagement'])

@router.post('/comments', response_model=CommentOut)
def create_comment(payload: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).get(payload.post_id)
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    comment = Comment(post_id=payload.post_id, author_id=current_user.id, body=payload.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    _ = extract_mentions(comment.body)
    return comment
    
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
bearer = HTTPBearer(auto_error=False)

@router.get('/likes/{post_id}/count')
def like_count(post_id: int, db: Session = Depends(get_db), creds: HTTPAuthorizationCredentials | None = Depends(bearer)):
    like_count = db.query(Like).filter(Like.post_id == post_id).count()
    user_liked = None
    if creds:
        from app.core.config import get_settings
        from jose import jwt, JWTError
        settings = get_settings()
        try:
            payload = jwt.decode(creds.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            sub = payload.get('sub')
            if sub:
                user_id = int(sub)
                user_liked = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).first() is not None
        except JWTError:
            pass
    resp = {"like_count": like_count}
    if user_liked is not None:
        resp["user_liked"] = user_liked
    return resp

@router.get('/comments/{post_id}', response_model=List[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()

@router.post('/likes/{post_id}', response_model=LikeOut)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        post = db.query(Post).get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail='Post not found')
        existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
        if existing:
            return existing
        like = Like(post_id=post_id, user_id=current_user.id)
        db.add(like)
        db.commit()
        db.refresh(like)
        return like
    except Exception as e:
        logging.exception(f"Error in like_post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/likes/{post_id}')
def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
        if like:
            db.delete(like)
            db.commit()
        return {"ok": True}
    except Exception as e:
        logging.exception(f"Error in unlike_post: {e}")
        raise HTTPException(status_code=500, detail=str(e))
