"""
Upload endpoint for resume + JD with Supabase Storage and Reducto integration.
Handles file uploads, directory structure creation, and data extraction.
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from annotated_types import Timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse

from api.services.supabase import get_supabase_client, SupabaseClient
from api.services.reducto import get_reducto_client, ReductoClient
from api.types.upload import UploadRequestParams, UploadResponse


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_resume_and_jd(
    params: UploadRequestParams = Depends(),
):
    """
    Uploads Resume and JD PDFs, extract structured data via Reducto.
    
    Authentication:
        Requires valid Supabase JWT token in Authorization header.
        User ID is automatically extracted and validated from the token.
    
    Process flow:
    1. Validate user authentication via JWT token
    2. Upload files to Reducto for processing
    3. Return file IDs and presigned URLs
    
    Args:
        params: Upload request parameters containing files and authenticated user_id
    
    Returns:
        UploadResponse: {
            "success": True,
            "resume_upload": {
                "file_id": "uuid",
                "presigned_url": "https://..."
            },
            "jd_upload": {
                "file_id": "uuid",
                "presigned_url": "https://..."
            }
        }
    
    Raises:
        HTTPException: If authentication fails or upload fails
    """
    reducto: ReductoClient = get_reducto_client()
    supabase: SupabaseClient = get_supabase_client()
    
    try:
        logger.info(f"Upload request from user: {params.user_id}")

        # Buffer files to enable parallel uploads
        logger.info(f"Buffering files for parallel upload: {params.user_id}")
        resume_bytes = await params.resume_file.read()
        jd_bytes = await params.jd_file.read()

        # Reset file pointers for any additional processing
        await params.resume_file.seek(0)
        await params.jd_file.seek(0)

        # Run all uploads concurrently to minimize latency
        logger.info(f"Starting parallel uploads for user: {params.user_id}")

        # Prepare upload tasks
        upload_tasks = [
            reducto.upload(extension="pdf", file=resume_bytes),
            reducto.upload(extension="pdf", file=jd_bytes),
            
            supabase.upload_file(
                file=resume_bytes,
                path=f"{params.user_id}/resumes/{params.resume_file.filename}",
                content_type="application/pdf"
            ),
            supabase.upload_file(
                file=jd_bytes,
                path=f"{params.user_id}/jds/{params.jd_file.filename}",
                content_type="application/pdf"
            ),
        ]

        # Execute all uploads concurrently
        results = await asyncio.gather(*upload_tasks, return_exceptions=True)

        # Extract results (results order matches upload_tasks order)
        reducto_resume_upload, reducto_jd_upload, supabase_resume_upload, supabase_jd_upload = results

        # Check for upload failures and collect errors
        upload_errors = []
        if isinstance(reducto_resume_upload, Exception):
            upload_errors.append(f"Reducto resume upload failed: {str(reducto_resume_upload)}")
        if isinstance(reducto_jd_upload, Exception):
            upload_errors.append(f"Reducto JD upload failed: {str(reducto_jd_upload)}")
        if isinstance(supabase_resume_upload, Exception):
            upload_errors.append(f"Supabase resume upload failed: {str(supabase_resume_upload)}")
        if isinstance(supabase_jd_upload, Exception):
            upload_errors.append(f"Supabase JD upload failed: {str(supabase_jd_upload)}")

        # If any critical uploads failed, raise an error
        if upload_errors:
            error_msg = "; ".join(upload_errors)
            logger.error(f"Upload failures for user {params.user_id}: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {error_msg}")

        logger.info(
            f"\n\n*********************Reducto Upload Results*********************\n"
            f"\nSuccessfully uploaded files for user {params.user_id}: \n"
            f"\nResume file_id ===> {reducto_resume_upload.file_id}\n"
            f"\nJD file_id     ===> {reducto_jd_upload.file_id}\n"
            f"\n******************End of Reducto Upload Results*****************\n\n"
            
            f"\n\n*********************Supabase Upload Results*********************\n"
            f"\nSuccessfully uploaded files for user {params.user_id}: \n"
            f"\nResume path ===> {params.user_id}/resumes/{params.resume_file.filename}\n"
            f"\nJD path     ===> {params.user_id}/jds/{params.jd_file.filename}\n"
            f"\n******************End of Supabase Upload Results*****************\n\n"
        )

        # Use the known storage paths (files are uploaded with predictable paths)
        resume_storage_path = f"{params.user_id}/resumes/{params.resume_file.filename}"
        jd_storage_path = f"{params.user_id}/jds/{params.jd_file.filename}"

        # Return structured response
        return UploadResponse(
            success=True,
            resume_upload=reducto_resume_upload,
            jd_upload=reducto_jd_upload,
            resume_storage_path=resume_storage_path,
            jd_storage_path=jd_storage_path,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
