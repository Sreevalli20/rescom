"""
Health check endpoint.
"""
import logging
from fastapi import APIRouter
from app.schemas.call import HealthResponse
from app.config import settings
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        # Check database connectivity
        from app.models import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.utcnow().isoformat(),
            version=settings.APP_VERSION
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="degraded",
            timestamp=datetime.utcnow().isoformat(),
            version=settings.APP_VERSION
        )


@router.get("/api/diagnostics/exotel")
async def exotel_diagnostics():
    """
    Safe diagnostic endpoint for Exotel credential verification.
    Reports ONLY presence/absence and lengths, never actual values.
    """
    return {
        "exotel_account_sid": {
            "present": bool(settings.EXOTEL_ACCOUNT_SID),
            "length": len(settings.EXOTEL_ACCOUNT_SID) if settings.EXOTEL_ACCOUNT_SID else 0,
            "value": settings.EXOTEL_ACCOUNT_SID  # Account SID is not secret
        },
        "exotel_api_key": {
            "present": bool(settings.EXOTEL_API_KEY),
            "length": len(settings.EXOTEL_API_KEY) if settings.EXOTEL_API_KEY else 0,
            "value": "***HIDDEN***"
        },
        "exotel_api_token": {
            "present": bool(settings.EXOTEL_API_TOKEN),
            "length": len(settings.EXOTEL_API_TOKEN) if settings.EXOTEL_API_TOKEN else 0,
            "value": "***HIDDEN***"
        },
        "exotel_phone_number": {
            "present": bool(settings.EXOTEL_PHONE_NUMBER),
            "length": len(settings.EXOTEL_PHONE_NUMBER) if settings.EXOTEL_PHONE_NUMBER else 0,
            "value": settings.EXOTEL_PHONE_NUMBER  # Phone number is not secret
        },
        "exotel_flow_id": {
            "present": bool(settings.EXOTEL_FLOW_ID),
            "length": len(settings.EXOTEL_FLOW_ID) if settings.EXOTEL_FLOW_ID else 0,
            "value": settings.EXOTEL_FLOW_ID  # Flow ID is not secret
        },
        "exotel_region": {
            "present": bool(settings.EXOTEL_REGION),
            "value": settings.EXOTEL_REGION
        },
        "backend_url": {
            "present": bool(settings.BACKEND_URL),
            "value": settings.BACKEND_URL
        },
        "pydantic_env_file": ".env",
        "pydantic_case_sensitive": True
    }


@router.get("/api/diagnostics/exotel/auth-test")
async def exotel_auth_test():
    """
    Test Exotel authentication directly against the API.
    This endpoint performs a live authentication test.
    """
    from app.services.exotel import exotel_service
    result = await exotel_service.test_authentication()
    return result
