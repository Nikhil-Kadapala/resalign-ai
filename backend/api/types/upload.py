"""
Data models for upload requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import UploadFile, File, Depends
from api._utils.auth import get_current_user_id
from reducto.types.shared import Upload


class UploadRequestParams:
    """
    Dependency class for upload request parameters.
    
    This class groups together all the parameters needed for the upload endpoint,
    including file uploads and authenticated user information.
    
    Usage:
        @router.post("/upload")
        async def upload_endpoint(params: UploadRequestParams = Depends()):
            user_id = params.user_id
            resume = params.resume_file
            jd = params.jd_file
    """
    
    def __init__(
        self,
        resume_file: UploadFile = File(..., description="Resume PDF file to upload"),
        jd_file: UploadFile = File(..., description="Job Description PDF file to upload"),
        user_id: str = Depends(get_current_user_id),
    ):
        """
        Initialize upload request parameters.
        
        Args:
            resume_file: Uploaded resume PDF file
            jd_file: Uploaded job description PDF file
            user_id: Authenticated user ID (extracted from JWT token)
        """
        self.resume_file = resume_file
        self.jd_file = jd_file
        self.user_id = user_id


class SupabaseUploadInfo(BaseModel):
    """
    Information about a file uploaded to Supabase Storage.
    Used for file previews and linkage in the database.
    """
    storage_path: str = Field(..., description="Path to file in Supabase Storage (e.g., 'user_id/resumes/filename.pdf')")
    file_id: str = Field(..., description="Reducto file ID for extraction")


class UploadResponse(BaseModel):
    """
    Response model for successful upload operations.
    
    Contains upload confirmation and file metadata from both Reducto (for extraction)
    and Supabase Storage (for file preview and linkage).
    """
    
    success: bool = Field(..., description="Success status of the upload")
    resume_upload: Upload = Field(..., description="Upload response for resume from Reducto")
    jd_upload: Upload = Field(..., description="Upload response for JD from Reducto")
    resume_storage_path: str = Field(..., description="Supabase Storage path for resume PDF")
    jd_storage_path: str = Field(..., description="Supabase Storage path for JD PDF")