"""
Supabase Authentication Utilities

This module provides authentication using Supabase's official get_claims() method.
It handles JWT token verification through Supabase's optimized infrastructure.
"""

import logging
from typing import Optional
from functools import lru_cache

from fastapi import Header, HTTPException, status
from supabase import create_client, Client
from api.config import settings

logger = logging.getLogger(__name__)


class SupabaseAuthError(Exception):
    """Custom exception for Supabase authentication errors."""
    pass


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Get cached Supabase client for authentication operations.

    Returns:
        Cached Supabase client instance
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
    )


def extract_bearer_token(authorization: Optional[str]) -> str:
    """
    Extract Bearer token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        Extracted JWT token

    Raises:
        HTTPException: If header is missing or malformed
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return authorization.split(" ", 1)[1]


def get_current_user_id_via_supabase(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency to get authenticated user_id using Supabase's get_claims().

    This method provides:
    - Official Supabase JWT verification
    - Optimized performance with cached JWKS
    - Automatic security updates from Supabase

    Usage:
        @router.post("/endpoint")
        async def my_endpoint(user_id: str = Depends(get_current_user_id_via_supabase)):
            # user_id is validated and trusted
            pass

    Args:
        authorization: Authorization header (automatically injected by FastAPI)

    Returns:
        Validated user_id from token's 'sub' claim

    Raises:
        HTTPException: If authentication fails
    """
    token = extract_bearer_token(authorization)

    try:
        supabase = get_supabase_client()
        response = supabase.auth.get_claims(jwt=token)
        # logger.info(f"Supabase get_claims response: {response}")

        user_id = response.get("claims").get("sub")
        if not user_id:
            raise SupabaseAuthError("Token missing 'sub' claim")

        logger.debug(f"User authenticated via Supabase get_claims: {user_id}")
        return user_id

    except Exception as e:
        logger.error(f"Supabase get_claims failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

get_current_user_id = get_current_user_id_via_supabase

