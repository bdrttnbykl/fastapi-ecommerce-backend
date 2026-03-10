from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.discount import Discount


def create_discount(db: Session, name: str, discount_percent: float):
    exists = db.query(Discount).filter(Discount.name == name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Discount already exists")

    discount = Discount(name=name, discount_percent=discount_percent)
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount


def get_discounts(db: Session):
    return db.query(Discount).all()


def update_discount(db: Session, discount_id: int, name: str, discount_percent: float):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")

    discount.name = name
    discount.discount_percent = discount_percent
    db.commit()
    db.refresh(discount)
    return discount


def delete_discount(db: Session, discount_id: int):
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    if not discount:
        raise HTTPException(status_code=404, detail="Discount not found")

    db.delete(discount)
    db.commit()
    return {"message": "Discount deleted"}
