from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse)
def create_order(payload: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return order_service.create_order_from_cart(db, current_user.id, payload.address)


@router.get("/", response_model=list[OrderResponse])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return order_service.list_orders(db, current_user.id)
