"""
Main FastAPI application for AI Voice Sales Agent Backend.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import init_db
from app.api import health, calls, webhooks

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend for AI Voice Sales Agent with Exotel integration"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "*"],  # Allow all for development, configure FRONTEND_URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(calls.router)
app.include_router(webhooks.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    
    # Log configuration diagnostic on startup
    import logging
    logger = logging.getLogger(__name__)
    logger.info("=== BACKEND STARTUP CONFIGURATION DIAGNOSTIC ===")
    logger.info(f"DEBUG: {settings.DEBUG}")
    logger.info(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    logger.info(f"BACKEND_URL: {settings.BACKEND_URL}")
    logger.info(f"DATABASE_URL: {'PRESENT' if settings.DATABASE_URL else 'MISSING'}")
    logger.info(f"EXOTEL_ACCOUNT_SID: {'PRESENT' if settings.EXOTEL_ACCOUNT_SID else 'MISSING'} (length: {len(settings.EXOTEL_ACCOUNT_SID) if settings.EXOTEL_ACCOUNT_SID else 0})")
    logger.info(f"EXOTEL_API_KEY: {'PRESENT' if settings.EXOTEL_API_KEY else 'MISSING'} (length: {len(settings.EXOTEL_API_KEY) if settings.EXOTEL_API_KEY else 0})")
    logger.info(f"EXOTEL_API_TOKEN: {'PRESENT' if settings.EXOTEL_API_TOKEN else 'MISSING'} (length: {len(settings.EXOTEL_API_TOKEN) if settings.EXOTEL_API_TOKEN else 0})")
    logger.info(f"EXOTEL_PHONE_NUMBER: {'PRESENT' if settings.EXOTEL_PHONE_NUMBER else 'MISSING'} (length: {len(settings.EXOTEL_PHONE_NUMBER) if settings.EXOTEL_PHONE_NUMBER else 0})")
    logger.info(f"EXOTEL_FLOW_ID: {'PRESENT' if settings.EXOTEL_FLOW_ID else 'MISSING'} (value: {settings.EXOTEL_FLOW_ID})")
    logger.info(f"EXOTEL_REGION: {settings.EXOTEL_REGION}")
    logger.info(f"EXOTEL_SUBDOMAIN: {settings.EXOTEL_SUBDOMAIN}")
    logger.info("=== END STARTUP DIAGNOSTIC ===")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }
