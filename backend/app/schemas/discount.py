from pydantic import BaseModel, Field


class DiscountCreate(BaseModel):
    name: str
    discount_percent: float = Field(ge=0, le=100)


class DiscountResponse(BaseModel):
    id: int
    name: str
    discount_percent: float

    class Config:
        from_attributes = True
