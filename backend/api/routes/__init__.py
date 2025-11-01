"""
Init file for API routes package.
"""

from .health import router as health_router
from .analyze import router as analyze_router
from .upload import router as upload_router
from .extract import router as extract_router

__all__ = ["health_router", "analyze_router", "upload_router", "extract_router"]
