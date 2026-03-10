from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.auth import AuthLogin, AuthRegister, TokenResponse
from app.schemas.user import UserResponse
from app.services import auth_service
from app.utils.database import get_db


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(payload: AuthRegister, db: Session = Depends(get_db)):
    return auth_service.register(db, payload.username, payload.email, payload.password)


@router.post("/login", response_model=TokenResponse)
def login(payload: AuthLogin, db: Session = Depends(get_db)):
    return auth_service.login(db, payload.email, payload.password)


@router.post("/token", response_model=TokenResponse)
def token_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_service.login(db, form_data.username, form_data.password)
