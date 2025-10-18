# Backend - FastAPI

A simple FastAPI backend for the Align AI application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- GET `/` - Welcome message
- GET `/health` - Health check
- GET `/api/resume` - Get all resume items
- POST `/api/resume` - Create a new resume item
- DELETE `/api/resume/{item_id}` - Delete a resume item
