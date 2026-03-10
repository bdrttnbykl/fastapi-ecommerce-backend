from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.discount import DiscountCreate, DiscountResponse
from app.services import discount as discount_service
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
