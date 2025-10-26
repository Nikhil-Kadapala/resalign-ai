"""
Pydantic models for Reducto extraction results.
These match the exact schemas returned by Reducto pipelines.
"""
from fastapi import Depends, Body
from pydantic import BaseModel, Field
from typing import Optional

from reducto.types.shared import Upload
from api._utils.auth import get_current_user_id
from api._types import JDStructuredData, ResumeStructuredData

class ExtractRequestParams:
    """
    Dependency class for extract request parameters.
    
    This class groups together all the parameters needed for the extract endpoint,
    including upload responses and authenticated user information.
    
    ### Usage:
    
    ```python
    @router.post("/extract")
    async def extract_endpoint(params: ExtractRequestParams = Depends()):
        resume_upload = params.resume_upload
        jd_upload = params.jd_upload
        user_id = params.user_id
    ```
    """
    
    def __init__(
        self,
        resume_upload: Upload = Body(..., description="Upload response for resume from Reducto"),
        jd_upload: Upload = Body(..., description="Upload response for JD from Reducto"),
        resume_storage_path: str = Body(..., description="Supabase Storage path for resume"),
        jd_storage_path: str = Body(..., description="Supabase Storage path for JD"),
        user_id: str = Depends(get_current_user_id),
    ):
        """
        Initialize extract request parameters.
        
        Args:
            resume_upload: Upload response for resume from Reducto
            jd_upload: Upload response for JD from Reducto
            resume_storage_path: Supabase Storage path for resume file
            jd_storage_path: Supabase Storage path for JD file
            user_id: Authenticated user ID (extracted from JWT token)
        """
        self.resume_upload = resume_upload
        self.jd_upload = jd_upload
        self.resume_storage_path = resume_storage_path
        self.jd_storage_path = jd_storage_path
        self.user_id = user_id

class ExtractionResponse(BaseModel):
    """
    Response model for successful extraction operations.
    
    Contains extraction confirmation and structured data extracted from resume and JD.
    Also includes database IDs for tracking if data was persisted to Supabase.
    """
    success: bool = Field(..., description="Success status of the extraction")
    resume_structured_data: ResumeStructuredData = Field(..., description="Structured data extracted from resume")
    jd_structured_data: JDStructuredData = Field(..., description="Structured data extracted from JD")
    resume_db_id: Optional[str] = Field(None, description="UUID of stored resume record in Supabase")
    jd_db_id: Optional[str] = Field(None, description="UUID of stored JD record in Supabase")
