from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Align AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResumeItem(BaseModel):
    id: Optional[int] = None
    skill: str
    description: str


# In-memory storage for demo purposes
resume_items: List[ResumeItem] = []
next_id = 1


@app.get("/")
async def root():
    return {"message": "Welcome to Align AI API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/resume", response_model=List[ResumeItem])
async def get_resume_items():
    """Get all resume items"""
    return resume_items


@app.post("/api/resume", response_model=ResumeItem)
async def create_resume_item(item: ResumeItem):
    """Create a new resume item"""
    global next_id
    item.id = next_id
    next_id += 1
    resume_items.append(item)
    return item


@app.delete("/api/resume/{item_id}")
async def delete_resume_item(item_id: int):
    """Delete a resume item"""
    global resume_items
    resume_items = [item for item in resume_items if item.id != item_id]
    return {"message": "Item deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
