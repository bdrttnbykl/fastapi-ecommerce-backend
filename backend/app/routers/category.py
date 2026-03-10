from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.category import CategoryCreate, CategoryResponse
from app.services import category as category_service
from app.utils.database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db, category.name)


@router.get("/", response_model=List[CategoryResponse])
def read_categories(db: Session = Depends(get_db)):
    return category_service.get_categories(db)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.update_category(db, category_id, category.name)


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    return category_service.delete_category(db, category_id)