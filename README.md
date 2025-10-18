# align-ai
Align your resume and skills to land the job. Turn job descriptions into career action plans. Accelerate your career.

## Project Structure

This project consists of two main components:

- **Backend**: FastAPI application (Python)
- **Frontend**: Vite + React + TypeScript application

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The backend API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Documentation

Once the backend is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- Create and manage resume items
- Track skills and descriptions
- Real-time API integration
- Modern React UI with TypeScript
- FastAPI backend with automatic API documentation
