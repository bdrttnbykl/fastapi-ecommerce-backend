from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int
    image_url: str | None = None
    category_id: int
    discount_id: int | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    discounted_price: float
    stock: int
    image_url: str | None = None
    category_id: int
    discount_id: int | None = None

    class Config:
        from_attributes = True
