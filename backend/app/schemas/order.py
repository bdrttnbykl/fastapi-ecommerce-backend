from pydantic import BaseModel
from datetime import datetime


class OrderCreate(BaseModel):
    address: str


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    address: str
    created_at: datetime
    items: list[OrderItemResponse]
