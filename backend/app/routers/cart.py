from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services import cart_service
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User


router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("/", response_model=CartResponse)
def read_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.get_cart(db, current_user.id)


@router.post("/items", response_model=CartResponse)
def add_to_cart(payload: CartItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.add_item(db, current_user.id, payload.product_id, payload.quantity)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_item(item_id: int, payload: CartItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.update_item(db, current_user.id, item_id, payload.quantity)


@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.delete_item(db, current_user.id, item_id)
