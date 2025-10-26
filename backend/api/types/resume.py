"""
Data models for resume parsing.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime


class ResumeUploadResponse(BaseModel):
    """Response from resume upload and parsing."""

    file_id: str
    resume_id: str
    version: int
    filename: str
    markdown: str
    word_count: int
    page_count: Optional[int] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any]


class ResumeParseRequest(BaseModel):
    """Request to parse an existing resume file."""

    file_path: str = Field(..., description="Path to the PDF file")

    @field_validator("file_path")
    @classmethod
    def validate_pdf(cls, v: str) -> str:
        if not v.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are supported")
        return v
