"""
Configuration management using environment variables.
All sensitive credentials are loaded from environment variables.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = ConfigDict(
        env_file=".env" if os.path.exists(".env") else None,
        env_file_encoding="utf-8",
        case_sensitive=True, 
        extra='ignore'
    )
    
    # Application
    APP_NAME: str = "AI Voice Sales Agent Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Backend URL (for webhook generation)
    # MUST be set to production URL in deployment (e.g., https://rescom.onrender.com)
    BACKEND_URL: str = ""
    
    # Database (PostgreSQL on Render)
    DATABASE_URL: str = "sqlite:///./sales_agent.db"
    
    # Exotel Configuration
    EXOTEL_ACCOUNT_SID: str = ""
    EXOTEL_API_KEY: str = ""
    EXOTEL_API_TOKEN: str = ""
    EXOTEL_SUBDOMAIN: str = ""  # e.g., "api.exotel.com" for Singapore, "api.in.exotel.com" for India
    EXOTEL_REGION: str = "singapore"  # Options: "singapore" or "india"
    EXOTEL_PHONE_NUMBER: str = ""
    EXOTEL_FLOW_ID: str = ""  # Exotel App/Flow ID for voice AI integration
    
    # WhatsApp Configuration
    WHATSAPP_PROVIDER: str = "mock"  # Options: mock, twilio, messagebird, gupshup
    WHATSAPP_API_KEY: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""
    
    # Twilio Configuration (for WhatsApp Sandbox)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""  # Twilio WhatsApp Sandbox number (e.g., whatsapp:+14155238886)
    TWILIO_WHATSAPP_TO: str = ""  # Default recipient number (for testing)
    
    # Contact and Resume Information
    CONTACT_MOBILE: str = ""
    RESUME_URL: str = ""
    ARCHITECTURE_IMAGE_URL: str = ""
    
    # AI/LLM Configuration (for conversation generation)
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"
    
    # Webhook Security
    WEBHOOK_SECRET: str = ""
    
    # Timezone
    TIMEZONE: str = "Asia/Kolkata"


settings = Settings()
