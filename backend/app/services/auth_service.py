from sqlalchemy.orm import Session

from app.models.user import User
from app.services.user import create_user, login_user


def register(db: Session, username: str, email: str, password: str):
    return create_user(db, username, email, password)


def login(db: Session, email: str, password: str):
    return login_user(db, email, password)


def list_users(db: Session):
    return db.query(User).all()
