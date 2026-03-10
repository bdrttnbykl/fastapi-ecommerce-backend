from pydantic import BaseModel


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    discounted_unit_price: float
    line_total: float


class CartResponse(BaseModel):
    cart_id: int
    user_id: int
    items: list[CartItemResponse]
    total_price: float
