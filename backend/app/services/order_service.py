from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.cart import Cart
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem
from app.services import cart_service


def create_order_from_cart(db: Session, user_id: int, address: str):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart or len(cart.items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        order = Order(user_id=user_id, address=address, status="created", total_price=0)
        db.add(order)
        db.flush()

        total = 0.0
        for item in cart.items:
            product = item.product
            if item.quantity > product.stock:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")

            unit_price = product.price
            if product.discount:
                unit_price = round(unit_price * (1 - product.discount.discount_percent / 100), 2)

            line_total = round(unit_price * item.quantity, 2)
            total += line_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                price=unit_price,
                quantity=item.quantity,
            )
            db.add(order_item)
            product.stock -= item.quantity

        order.total_price = round(total, 2)
        cart_service.clear_cart(db, user_id, commit=False)
        db.commit()
        db.refresh(order)
        return serialize_order(order)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Order creation failed")


def list_orders(db: Session, user_id: int):
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return [serialize_order(order) for order in orders]


def get_order_for_user(db: Session, user_id: int, order_id: int):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)


def list_all_orders(db: Session):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [serialize_order(order) for order in orders]


def update_order_status(db: Session, order_id: int, status: str):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    db.refresh(order)
    return serialize_order(order)


def list_low_stock_products(db: Session, threshold: int):
    products = db.execute(
        select(Product).where(Product.stock <= threshold).order_by(Product.stock.asc())
    ).scalars().all()
    return [
        {
            "id": product.id,
            "name": product.name,
            "stock": product.stock,
            "category_id": product.category_id,
        }
        for product in products
    ]


def serialize_order(order: Order):
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_price": order.total_price,
        "status": order.status,
        "address": order.address,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in order.items
        ],
    }
