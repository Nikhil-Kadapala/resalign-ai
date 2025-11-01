import json
import os
import logging
from google import genai
from google.genai.types import Part, ThinkingConfig, GenerateContentConfig, CreateCachedContentConfig, Tool, GoogleSearch
from typing import List, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class Gemini:
    """
    This class is used to generate responses from the Gemini API with context caching support.
    """
    def __init__(self, model: str, api_key: Optional[str] = None, thinkingConfig: Optional[ThinkingConfig] = None):
        self.model = model
        self.cached_content = None  # Store cached content reference
        self.thinkingConfig = thinkingConfig
        try:
            self.api_key = api_key if not None else os.getenv("GEMINI_API_KEY")
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            logger.error(f"Gemini Client creation error: {str(e)}")
            raise
    
    @staticmethod
    def serialize_usage_metadata(usage_metadata: Optional[Any]) -> Optional[dict]:
        """
        Helper function to serialize GenerateContentResponseUsageMetadata to a JSON-serializable dict.
        
        Args:
            usage_metadata: The usage metadata object from the API response
            
        Returns:
            dict: JSON-serializable dictionary with usage metadata, or None if input is None
        """
        if usage_metadata is None:
            return None
        
        try:
            # Manual extraction of common usage metadata fields
            serialized = {}
            
            # Common fields in GenerateContentResponseUsageMetadata
            fields_to_extract = [
                "cached_content_token_count",
                "candidates_token_count",
                "prompt_token_count",
                "thoughts_token_count",
                "tool_use_prompt_token_count",
                "total_token_count"
            ]
            
            for field in fields_to_extract:
                if hasattr(usage_metadata, field):
                    value = getattr(usage_metadata, field)
                    serialized[field] = value
            
            return serialized if serialized else {"raw_type": str(type(usage_metadata))}
            
        except Exception as e:
            logger.warning(f"Failed to serialize usage metadata: {e}")
            return {"error": f"Serialization failed: {str(e)}", "raw_type": str(type(usage_metadata))}
    
    
    def create_cached_content(self, system_prompt: str, ttl_hours: int = 1) -> str:
        """
        Creates cached content for the system prompt to reduce API costs.
        
        Args:
            system_prompt (str): The system prompt to cache
            ttl_hours (int): Time to live in hours for the cached content
            
        Returns:
            str: The cache ID for the created cached content, or None if content is too small
        """
        try:
            # Rough token estimation (1 token ≈ 4 characters for English text)
            # This is approximate but helps us avoid API calls that will fail
            estimated_tokens = len(system_prompt) // 4
            
            # Google Gemini API requires minimum 2048 tokens for cached content
            MIN_CACHE_TOKENS = 2048
            
            if estimated_tokens < MIN_CACHE_TOKENS:
                logger.warning(
                    f"⚠️ System prompt too small for caching ({estimated_tokens} estimated tokens < {MIN_CACHE_TOKENS} required). "
                    f"Skipping cache creation. Will use regular generation instead."
                )
                self.cached_content = None
                return None
            
            # Convert hours to seconds as required by the API
            ttl_seconds = ttl_hours * 3600
            
            # Create the configuration for cached content
            config = CreateCachedContentConfig(
                system_instruction=system_prompt,
                ttl=f"{ttl_seconds}s",  # Must end with 's' for seconds
                display_name="distillation_system_prompt_cache",
                tools=[Tool(google_search=GoogleSearch())]
            )
            
            # Create cached content using the correct API
            self.cached_content = self.client.caches.create(
                model=self.model,
                config=config
            )
            
            logger.info(f"💾 Created cached content with ID: {self.cached_content.name}")
            logger.info(f"🕒 Cache TTL: {ttl_hours} hours ({ttl_seconds} seconds)")
            
            return self.cached_content.name
            
        except Exception as e:
            logger.error(f"❌ Error creating cached content: {e}")
            self.cached_content = None
            return None
    
    def generate_response_with_cache(
        self, 
        user_prompt: str, 
        response_schema: Optional[Any] = None, 
    ) -> tuple[str, Optional[Any]]:
        """
        Generate response using cached system prompt with Gemini API.
        
        Args:
            user_prompt (str): The user prompt
            response_schema: Response schema for structured output
            
        Returns:
            str | None: The generated response
        """
        if not self.cached_content:
            logger.warning("No cached content available. Falling back to regular generation.")
            # This should not happen in normal usage, but we'll handle it gracefully
            return None, None
        
        try:
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=[Part(text=user_prompt)],
                config=GenerateContentConfig(
                    #response_mime_type="application/json",
                    response_schema=response_schema if response_schema else None,
                    thinking_config=self.thinkingConfig if self.thinkingConfig else None,
                    cached_content=self.cached_content.name,  # Use cached content reference
                    tools=[Tool(google_search=GoogleSearch())]  # Enable Google Search for accurate data
                )
            )
            return response.text, self.serialize_usage_metadata(response.usage_metadata)
            
        except Exception as e:
            logger.error(f"❌ Gemini Model response error: {str(e)}")
            raise
    
    def generate_response(
        self, 
        sys_prompt: str, 
        user_prompt: str, 
        response_schema: Optional[Any] = None, 
    ) -> tuple[str, Optional[Any]]:
        """
        Generate response using the Gemini API.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=[Part(text=user_prompt)],
                config=GenerateContentConfig(
                    #response_mime_type="application/json",
                    response_schema=response_schema if response_schema else None,
                    system_instruction=sys_prompt,
                    thinking_config=self.thinkingConfig if self.thinkingConfig else None,
                    tools=[Tool(google_search=GoogleSearch())]
                )
            )
            return response.text, self.serialize_usage_metadata(response.usage_metadata)
        except Exception as e:
            logger.error(f"❌ Gemini Model response error: {str(e)}")
            raise
    
    def delete_cached_content(self, cache_id: str):
        """Delete the cached content to clean up resources."""
        if self.cached_content:
            try:
                self.client.caches.delete(name=cache_id)
                logger.info(f"🗑️ Deleted cached content: {cache_id}")
                self.cached_content = None
            except Exception as e:
                logger.error(f"❌ Error deleting cached content: {e}")
    