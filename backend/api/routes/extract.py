import logging
import asyncio

from fastapi import APIRouter, HTTPException, Depends
from api.services.reducto import get_reducto_client, ReductoClient
from api.services.supabase import get_supabase_client, SupabaseClient
from api.types.extraction import ExtractRequestParams, ExtractionResponse


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Extract"])

@router.post("/extract", response_model=ExtractionResponse)
async def extract_data_from_resume_and_jd(
    params: ExtractRequestParams = Depends(),
    supabase: SupabaseClient = Depends(get_supabase_client),
):
    """
    Extracts resume and JD data from Reducto and stores in Supabase.
    
    Authentication:
        Requires valid Supabase JWT token in Authorization header.
        User ID is automatically extracted and validated from the token.
    
    Process flow:
    1. Validate user authentication via JWT token
    2. Extract structured data from resume and JD using Reducto
    3. Store extracted data in Supabase database
    4. Return structured data with database IDs for tracking
    
    Args:
        params: Extract request parameters containing upload responses and authenticated user_id
        supabase: Supabase client for database operations
    
    Returns:
        ExtractionResponse: {
            "success": True,
            "resume_structured_data": ResumeStructuredData,
            "jd_structured_data": JDStructuredData,
            "resume_db_id": UUID,
            "jd_db_id": UUID,
        }
    
    Raises:
        HTTPException: If authentication fails or extraction fails
    """
    reducto: ReductoClient = get_reducto_client()
    
    try:
        logger.info(f"Extract request from user: {params.user_id}")
        
        resume_upload = params.resume_upload
        jd_upload = params.jd_upload
        
        extraction_tasks = [
            reducto.parse_and_extract_from_resume(resume_upload),
            reducto.parse_and_extract_from_jd(jd_upload),
        ]
        
        results = await asyncio.gather(*extraction_tasks, return_exceptions=True)
        reducto_resume_data, reducto_jd_data = results
        
        extraction_errors = []
        if isinstance(reducto_resume_data, Exception):
            extraction_errors.append(f"Reducto resume extraction failed: {str(reducto_resume_data)}")
        if isinstance(reducto_jd_data, Exception):
            extraction_errors.append(f"Reducto JD extraction failed: {str(reducto_jd_data)}")

        if extraction_errors:
            error_msg = "; ".join(extraction_errors)
            logger.error(f"Extraction failures for user {params.user_id}: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Extraction failed: {error_msg}")
        
        extracted_resume_data = reducto_resume_data.result.extract.result[0]
        extracted_jd_data = reducto_jd_data.result.extract.result[0]
        
        # Store extracted data in Supabase database
        resume_db_id = None
        jd_db_id = None
        
        try:
            logger.info(f"Storing extracted data in Supabase for user: {params.user_id}")
            
            # Store resume data with Supabase storage path
            resume_record = await supabase.insert(
                table="resumes",
                data={
                    "user_id": params.user_id,
                    "reducto_file_id": params.resume_upload.file_id,
                    "supabase_storage_path": params.resume_storage_path,
                    "extracted_data": extracted_resume_data,
                }
            )
            resume_db_id = resume_record.get("id")
            
            # Store JD data with Supabase storage path
            jd_record = await supabase.insert(
                table="job_descriptions",
                data={
                    "user_id": params.user_id,
                    "reducto_file_id": params.jd_upload.file_id,
                    "supabase_storage_path": params.jd_storage_path,
                    "extracted_data": extracted_jd_data,
                }
            )
            jd_db_id = jd_record.get("id")
            
            logger.info(
                f"Successfully stored extracted data for user {params.user_id}: "
                f"resume_db_id={resume_db_id}, jd_db_id={jd_db_id}, "
                f"resume_path={params.resume_storage_path}, jd_path={params.jd_storage_path}"
            )
            
        except Exception as db_error:
            logger.error(
                f"Database storage failed for user {params.user_id}: {str(db_error)}. "
                "Extraction still succeeded - returning without DB IDs."
            )
            # Don't fail extraction if DB storage fails - data is extracted
        
        return ExtractionResponse(
            success=True,
            resume_structured_data=extracted_resume_data,
            jd_structured_data=extracted_jd_data,
            resume_db_id=resume_db_id,
            jd_db_id=jd_db_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")