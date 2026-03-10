import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.discount import Discount
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.routers import admin, auth, cart, categories, orders, products, users
from app.utils.database import Base, engine


Base.metadata.create_all(bind=engine)
os.makedirs("app/uploads", exist_ok=True)

app = FastAPI(title="E-Commerce Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")


@app.get("/")
def root():
    return {"message": "E-Commerce backend is running"}
