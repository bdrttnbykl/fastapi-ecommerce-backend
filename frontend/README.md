# FastAPI E-Commerce

Full-stack e-commerce application built with FastAPI and React.

## Tech Stack

Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication

Frontend

- React
- Vite
- Fetch API

## Features

- User authentication
- Category management
- Product management
- Admin product panel
- REST API

## Run Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload

## Run Frontend

cd frontend
npm install
npm run dev
