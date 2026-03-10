from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.utils.database import Base


class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    discount_percent = Column(Float, nullable=False)

    products = relationship("Product", back_populates="discount")
