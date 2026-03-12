import os
from uuid import uuid4
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.schemas.product import ProductCreate, ProductResponse
from app.services import product as product_service
from app.utils.database import get_db
from app.utils.security import require_admin


router = APIRouter(prefix="/products", tags=["Products"])
UPLOAD_DIR = "app/uploads/products"


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return product_service.create_product(db, product)


@router.get("/", response_model=List[ProductResponse])
def read_products(
    category_id: int | None = Query(default=None),
    in_stock_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return product_service.get_products(db, category_id=category_id, in_stock_only=in_stock_only)


@router.get("/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return product_service.update_product(db, product_id, product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return product_service.delete_product(db, product_id)


@router.post("/upload-image")
async def upload_product_image(file: UploadFile = File(...), _admin=Depends(require_admin)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename or "")[1] or ".jpg"
    filename = f"{uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return {"image_url": f"/uploads/products/{filename}"}
