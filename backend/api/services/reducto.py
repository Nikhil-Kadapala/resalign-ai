"""
Reducto integration service with actual schema support.
Integrated with exact Reducto extraction schemas.
"""
import logging
import httpx
from typing import Tuple, Optional
from api.config import settings

from pathlib import Path
from reducto import Reducto
from reducto._types import Omit, FileTypes, omit
from reducto.types.shared import Upload, PipelineResponse

logger = logging.getLogger(__name__)

class ReductoUploadError(Exception):
    """Exception raised for errors in the Reducto upload process."""
    pass

class ReductoExtractError(Exception):
    """Exception raised for errors in the Reducto extract process."""
    pass

class ReductoClientError(Exception):
    """Exception raised for errors in the Reducto client process."""
    pass

class ReductoClient:
    """Service for interacting with Reducto API."""
    
    def __init__(
        self,
        api_key: str,
        resume_pipeline_id: str,
        jd_pipeline_id: str
    ):
        """
        Initialize Reducto service.
        
        Args:
            api_key: Reducto API key
            resume_pipeline_id: Pipeline ID for resume extraction
            jd_pipeline_id: Pipeline ID for JD extraction
        """
        self.client = Reducto(api_key=api_key)
        self.resume_pipeline_id = resume_pipeline_id
        self.jd_pipeline_id = jd_pipeline_id
        logger.info(f"ReductoService initialized with default parse and extract pipeline for Resumes and JDs.")
    
    async def upload(
        self,
        *,
        extension: Optional[str] | Omit = omit,
        file: Optional[FileTypes] | Omit = omit,
    ) -> Upload:
        """
        Upload a file to Reducto.

        Args:
            extension: Optional file extension
            file: File to upload
        """
        # The Reducto client upload method may be synchronous or async
        # Try synchronous first, wrap in asyncio.to_thread if needed
        try:
            return self.client.upload(extension=extension, file=file)
        except Exception as e:
            # If it's actually async, this will fail
            # For now, assume it's synchronous
            raise ReductoUploadError(f"Failed to upload file: {str(e)}")
    
    async def parse_and_extract_from_resume(
        self, 
        upload: Upload
    ) -> PipelineResponse:
        """
        Parse and extract structured data from resume.
        Runs inference directly on the deployed pipeline.
        
        Args:
            upload: Upload object
            
        Returns:
            PipelineResponse object
            
        """
        try:
            logger.info(f"Parsing and extracting datafrom resume: {upload.file_id}")
            
            pipeline_response = self.client.pipeline.run(
                input=upload,
                pipeline_id=self.resume_pipeline_id
            )
            
            logger.info(f"Resume data extracted successfully: {pipeline_response.result.extract.result[0]}")
            return pipeline_response
            
        except httpx.HTTPError as e:
            logger.error(f"Reducto HTTP error: {str(e)}")
            raise ReductoExtractError(f"Failed to extract resume: {str(e)}")
        except Exception as e:
            logger.error(f"Resume extraction failed: {str(e)}")
            raise ReductoExtractError(f"Failed to extract resume: {str(e)}")
    
    async def parse_and_extract_from_jd(
        self, 
        upload: Upload
    ) -> PipelineResponse:
        """
        Parse and extract structured data from job description.
        Runs inference directly on the deployed pipeline.
        
        Args:
            upload: Upload object
            
        Returns:
            PipelineResponse object
            
        """
        try:
            logger.info(f"Parsing and extracting datafrom JD: {upload.file_id}")
            
            pipeline_response = self.client.pipeline.run(
                input=upload,
                pipeline_id=self.jd_pipeline_id
            )
            
            logger.info(f"JD data extracted successfully: {pipeline_response.result.extract.result[0]}")
            return pipeline_response
            
        except httpx.HTTPError as e:
            logger.error(f"Reducto HTTP error: {str(e)}")
            raise ReductoExtractError(f"Failed to extract JD: {str(e)}")
        except Exception as e:
            logger.error(f"JD extraction failed: {str(e)}")
            raise ReductoExtractError(f"Failed to extract JD: {str(e)}")
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Singleton instance
_reducto_client: Optional[ReductoClient] = None


def get_reducto_client() -> ReductoClient:
    """Get or create Reducto client instance."""
    global _reducto_client
    
    if _reducto_client is None:
        try:
            _reducto_client = ReductoClient(
                api_key=settings.REDUCTO_API_KEY,
                resume_pipeline_id=settings.REDUCTO_RES_PIPELINE_ID,
                jd_pipeline_id=settings.REDUCTO_JD_PIPELINE_ID
            )
        except Exception as e:
            logger.error(f"Failed to create Reducto client: {str(e)}")
            raise ReductoClientError(f"Failed to create Reducto client: {str(e)}")
    
    return _reducto_client
