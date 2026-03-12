from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.schemas.admin import LowStockProductResponse, OrderStatusUpdate
from app.schemas.discount import DiscountCreate, DiscountResponse
from app.schemas.order import OrderResponse
from app.services import discount as discount_service
from app.services import order_service
from app.utils.database import get_db
from app.utils.security import require_admin


router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.post("/discounts", response_model=DiscountResponse)
def create_discount(payload: DiscountCreate, db: Session = Depends(get_db)):
    return discount_service.create_discount(db, payload.name, payload.discount_percent)


@router.get("/discounts", response_model=List[DiscountResponse])
def list_discounts(db: Session = Depends(get_db)):
    return discount_service.get_discounts(db)


@router.put("/discounts/{discount_id}", response_model=DiscountResponse)
def update_discount(discount_id: int, payload: DiscountCreate, db: Session = Depends(get_db)):
    return discount_service.update_discount(db, discount_id, payload.name, payload.discount_percent)


@router.delete("/discounts/{discount_id}")
def delete_discount(discount_id: int, db: Session = Depends(get_db)):
    return discount_service.delete_discount(db, discount_id)


@router.get("/orders", response_model=List[OrderResponse])
def list_all_orders(db: Session = Depends(get_db)):
    return order_service.list_all_orders(db)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    return order_service.update_order_status(db, order_id, payload.status)


@router.get("/products/low-stock", response_model=List[LowStockProductResponse])
def low_stock_products(threshold: int = Query(default=5, ge=0), db: Session = Depends(get_db)):
    return order_service.list_low_stock_products(db, threshold)
