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
    
    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra='ignore')
    
    # Application
    APP_NAME: str = "AI Voice Sales Agent Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Backend URL (for webhook generation)
    BACKEND_URL: str = "http://localhost:8000"
    
    # Database (PostgreSQL on Render)
    DATABASE_URL: str = "sqlite:///./sales_agent.db"
    
    # Exotel Configuration
    EXOTEL_ACCOUNT_SID: str = ""
    EXOTEL_API_KEY: str = ""
    EXOTEL_API_TOKEN: str = ""
    EXOTEL_SUBDOMAIN: str = "api.exotel.com"
    EXOTEL_REGION: str = "Singapore"
    EXOTEL_PHONE_NUMBER: str = ""
    
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
