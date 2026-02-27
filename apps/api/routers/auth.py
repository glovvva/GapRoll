"""
Auth dependency - pobieranie user_id z JWT (Supabase).
"""

import logging
from typing import Optional

import jwt

logger = logging.getLogger(__name__)
from fastapi import Header, HTTPException


async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Pobierz user_id z JWT tokenu.
    Authorization header format: "Bearer <token>"
    """
    if not authorization:
        return "00000000-0000-0000-0000-000000000000"

    try:
        parts = authorization.split(" ", 1)
        if len(parts) != 2:
            raise HTTPException(
                status_code=401, detail="Invalid authorization header"
            )
        scheme, token = parts
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401, detail="Invalid authentication scheme"
            )

        # TEMPORARY: Supabase używa ES256 - bez weryfikacji podpisu (development)
        # W produkcji użyj proper public key verification
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                audience="authenticated",
            )
        except Exception as e:
            logger.error("JWT decode error: %s", e)
            raise HTTPException(
                status_code=401, detail=f"Invalid token: {str(e)}"
            ) from e

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token: no user_id"
            )

        return user_id

    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_current_user: %s", e)
        return "00000000-0000-0000-0000-000000000000"
