from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.discount import Discount
from app.models.product import Product


def _apply_discount(price: float, discount_percent: float | None) -> float:
    if discount_percent is None:
        return price
    return round(price * (1 - discount_percent / 100), 2)


def serialize_product(product: Product) -> dict:
    discount_percent = product.discount.discount_percent if product.discount else None
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "discounted_price": _apply_discount(product.price, discount_percent),
        "stock": product.stock,
        "image_url": product.image_url,
        "category_id": product.category_id,
        "discount_id": product.discount_id,
    }


def create_product(db: Session, product_data):
    category = db.query(Category).filter(Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if product_data.discount_id is not None:
        discount = db.query(Discount).filter(Discount.id == product_data.discount_id).first()
        if not discount:
            raise HTTPException(status_code=404, detail="Discount not found")

    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return serialize_product(product)


def get_products(db: Session, category_id: int | None = None, in_stock_only: bool = False):
    query = db.query(Product)
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    if in_stock_only:
        query = query.filter(Product.stock > 0)
    return [serialize_product(product) for product in query.all()]


def get_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)


def update_product(db: Session, product_id: int, product_data):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    category = db.query(Category).filter(Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if product_data.discount_id is not None:
        discount = db.query(Discount).filter(Discount.id == product_data.discount_id).first()
        if not discount:
            raise HTTPException(status_code=404, detail="Discount not found")

    for key, value in product_data.dict().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return serialize_product(product)


def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
