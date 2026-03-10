from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category


def create_category(db: Session, name: str):
    existing_category = db.query(Category).filter(Category.name == name).first()

    if existing_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(name=name)

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


def get_categories(db: Session):
    return db.query(Category).all()


def update_category(db: Session, category_id: int, name: str):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.name = name

    db.commit()
    db.refresh(category)

    return category


def delete_category(db: Session, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(category)
    db.commit()

    return {"message": "Category deleted"}