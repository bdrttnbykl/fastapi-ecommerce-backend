from pydantic import BaseModel, Field


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=2, max_length=30)


class LowStockProductResponse(BaseModel):
    id: int
    name: str
    stock: int
    category_id: int
