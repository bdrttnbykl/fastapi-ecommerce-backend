from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product


def _discounted_price(product: Product) -> float:
    if not product.discount:
        return product.price
    return round(product.price * (1 - product.discount.discount_percent / 100), 2)


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _serialize_cart(cart: Cart) -> dict:
    items = []
    total_price = 0.0
    changed = False

    for item in list(cart.items):
        # Old carts may contain dangling items if a product was deleted.
        if not item.product:
            changed = True
            continue

        unit_price = item.product.price
        discounted_unit_price = _discounted_price(item.product)
        line_total = round(discounted_unit_price * item.quantity, 2)
        total_price += line_total

        items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "discounted_unit_price": discounted_unit_price,
                "line_total": line_total,
            }
        )

    if changed:
        cart.items = [ci for ci in cart.items if ci.product is not None]

    return {
        "cart_id": cart.id,
        "user_id": cart.user_id,
        "items": items,
        "total_price": round(total_price, 2),
    }


def get_cart(db: Session, user_id: int):
    cart = _get_or_create_cart(db, user_id)
    return _serialize_cart(cart)


def add_item(db: Session, user_id: int, product_id: int, quantity: int):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = _get_or_create_cart(db, user_id)
    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).first()

    new_quantity = quantity if not item else item.quantity + quantity
    if new_quantity > product.stock:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds stock")

    if item:
        item.quantity = new_quantity
    else:
        item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.add(item)

    db.commit()
    return _serialize_cart(cart)


def update_item(db: Session, user_id: int, item_id: int, quantity: int):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    cart = _get_or_create_cart(db, user_id)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds stock")

    item.quantity = quantity
    db.commit()
    return _serialize_cart(cart)


def delete_item(db: Session, user_id: int, item_id: int):
    cart = _get_or_create_cart(db, user_id)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return _serialize_cart(cart)


def clear_cart(db: Session, user_id: int, commit: bool = True):
    cart = _get_or_create_cart(db, user_id)
    for item in cart.items:
        db.delete(item)
    if commit:
        db.commit()
