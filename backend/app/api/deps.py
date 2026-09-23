from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import User


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.session.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    return user