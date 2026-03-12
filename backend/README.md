# E-Commerce Backend

## Stack
- Python + FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Alembic

## Run (PowerShell)
```powershell
cd backend
.\run.ps1
```

`run.ps1` steps:
1. Creates `backend/venv` if missing
2. Installs `requirements.txt` if needed
3. Runs `alembic upgrade head`
4. Starts API with `uvicorn app.main:app --reload`

## Manual Run
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Environment
Create/update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Main Modules
- `auth`
- `users`
- `categories`
- `products`
- `cart`
- `orders`
- `admin`

## Added Business Rules
- Cart quantity cannot exceed stock
- Order creation checks stock for each item
- Discount price applied in cart/order totals
- Order creation + stock decrement + cart cleanup executed in one transaction path
- Admin can list all orders and update order status
- Admin can list low-stock products

## Migrations
Initial migration file:
- `alembic/versions/34679caf8c3f_initial_schema.py`

Create a new migration:
```powershell
alembic revision --autogenerate -m "message"
```

Apply migrations:
```powershell
alembic upgrade head
```
