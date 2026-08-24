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
