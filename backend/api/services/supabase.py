"""
Supabase service for database operations with RLS and storage management.
"""

import asyncio
import logging
from typing import Dict, Optional, List, Any
from functools import lru_cache
from api.config import settings
from supabase import create_client, Client

class SupabaseUploadError(Exception):
    """Exception raised when file upload fails."""
    pass

class SupabaseClientError(Exception):
    """Exception raised when Supabase client creation fails."""
    pass

class SupabaseInsertError(Exception):
    """Exception raised when insert operation fails."""
    pass

class SupabaseSelectError(Exception):
    """Exception raised when fetch operation fails."""
    pass

class SupabaseUpdateError(Exception):
    """Exception raised when update operation fails."""
    pass

class SupabaseDeleteError(Exception):
    """Exception raised when delete operation fails."""
    pass

class SupabaseStorageError(Exception):
    """Exception raised when storage operation fails."""
    pass

class SupabaseError(Exception):
    """Exception raised when any operation fails."""
    pass

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Supabase client for managing files in buckets and database operations."""

    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
        supabase_bucket: str,
    ):
        """
        Initialize Supabase client.

        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase project API key
            supabase_bucket: Supabase bucket name for file management
        """
        self.client = create_client(supabase_url, supabase_key)
        self.supabase_bucket = supabase_bucket
        logger.info(f"SupabaseClient initialized with bucket: {self.supabase_bucket}")

    async def create_user_directory_structure(self, user_id: str) -> Dict[str, str]:
        """
        Create user directory structure (user_id/{resumes,jds,reports}).
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with directory paths created
            
        Note:
            Supabase Storage doesn't require explicit folder creation.
            Files implicitly create folder structure on upload.
        """
        try:
            logger.info(f"Creating directory structure for user: {user_id}")
            
            # Define folder structure paths
            folders = {
                'resumes': f"{user_id}/resumes/",
                'jds': f"{user_id}/jds/",
                'reports': f"{user_id}/reports/",
            }
            
            # Create placeholder files to ensure folders exist
            placeholder_content = b"."
            
            for folder_name, folder_path in folders.items():
                try:
                    self.storage.upload(
                        path=f"{folder_path}.placeholder",
                        file=placeholder_content,
                        file_options={"upsert": False}
                    )
                    logger.info(f"Folder ensured: {folder_path}")
                except Exception as e:
                    # Ignore errors if placeholder already exists
                    logger.debug(f"Placeholder already exists for {folder_path}: {str(e)}")
            
            return folders
            
        except Exception as e:
            logger.error(f"Failed to create directory structure for user {user_id}: {str(e)}")
            raise SupabaseStorageError(f"Failed to create directory structure for user {user_id}: {str(e)}")

    async def upload_file(
        self,
        file: bytes,
        path: str,
        content_type: str = "application/pdf",
        upsert: bool = False
    ) -> Dict[str, Any]:
        """
        Upload a file to Supabase Storage asynchronously.

        Args:
            file: File content as bytes
            path: Path in bucket (e.g., "user_id/resumes/file.pdf")
            content_type: MIME type of file
            upsert: Whether to overwrite existing file

        Returns:
            Upload result dictionary

        Raises:
            ValueError: If upload fails
        """
        try:
            logger.info(f"Uploading file to: {path}")

            # Run the blocking Supabase upload in a thread pool
            result = await asyncio.to_thread(
                lambda: self.client.storage
                    .from_(self.supabase_bucket)
                    .upload(
                        path=f"{path}",
                        file=file,
                        file_options={
                            "cache-control": "3600",
                            "content-type": content_type,
                            "upsert": str(upsert).lower()
                        }
                    )
            )
            
            return result

        except Exception as e:
            logger.error(f"Failed to upload file {path}: {str(e)}")
            raise SupabaseUploadError(f"Failed to upload file {path}: {str(e)}")

    async def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a record into a database table asynchronously.

        Args:
            table: Table name
            data: Record data as dictionary

        Returns:
            Insert result with created record

        Raises:
            SupabaseDatabaseError: If insert fails
        """
        try:
            logger.debug(f"Inserting record into table '{table}'")

            # Run blocking insert in thread pool
            result = await asyncio.to_thread(
                lambda: self.client.table(table).insert(data).execute()
            )

            if not result.data:
                raise SupabaseInsertError(f"Insert into {table} returned no data")

            logger.debug(f"Successfully inserted record into {table}: {result.data[0].get('id', 'N/A')}")
            return result.data[0]

        except Exception as e:
            logger.error(f"Failed to insert into {table}: {str(e)}")
            raise SupabaseInsertError(f"Failed to insert into {table}: {str(e)}")

    async def select(self, table: str, query_filter: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Select records from a database table asynchronously.

        Args:
            table: Table name
            query_filter: Filter conditions as dict {column: value}

        Returns:
            List of matching records

        Raises:
            SupabaseDatabaseError: If select fails
        """
        try:
            logger.debug(f"Selecting from table '{table}' with filter: {query_filter}")

            # Build query
            query = self.client.table(table).select("*")
            for key, value in query_filter.items():
                query = query.eq(key, value)

            # Run blocking select in thread pool
            result = await asyncio.to_thread(lambda: query.execute())

            logger.debug(f"Selected {len(result.data)} records from {table}")
            return result.data

        except Exception as e:
            logger.error(f"Failed to select from {table}: {str(e)}")
            raise SupabaseSelectError(f"Failed to select from {table}: {str(e)}")

    async def update(self, table: str, data: Dict[str, Any], query_filter: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a record in a database table asynchronously.

        Args:
            table: Table name
            data: Fields to update
            query_filter: Filter conditions as dict {column: value}

        Returns:
            Updated record

        Raises:
            SupabaseDatabaseError: If update fails
        """
        try:
            logger.debug(f"Updating table '{table}' with filter: {query_filter}")

            # Build query
            query = self.client.table(table).update(data)
            for key, value in query_filter.items():
                query = query.eq(key, value)

            # Run blocking update in thread pool
            result = await asyncio.to_thread(lambda: query.execute())

            if not result.data:
                raise SupabaseUpdateError(f"Update on {table} returned no data")

            logger.debug(f"Successfully updated record in {table}")
            return result.data[0]

        except Exception as e:
            logger.error(f"Failed to update {table}: {str(e)}")
            raise SupabaseUpdateError(f"Failed to update {table}: {str(e)}")


# Singleton instance
_supabase_client: Optional[SupabaseClient] = None

def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client instance."""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            _supabase_client = SupabaseClient(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
                supabase_bucket=settings.SUPABASE_BUCKET
            )
        except Exception as e:
            logger.error(f"Failed to create Supabase client: {str(e)}")
            raise SupabaseClientError(f"Failed to create Supabase client: {str(e)}")
        
    return _supabase_client