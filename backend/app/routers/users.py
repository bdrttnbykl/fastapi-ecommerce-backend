from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserResponse
from app.services import auth_service
from app.utils.database import get_db
from app.utils.security import get_current_user, require_admin
from app.models.user import User


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserResponse], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    return auth_service.list_users(db)
