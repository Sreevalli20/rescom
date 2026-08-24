"""
Validation utilities for phone numbers and other inputs.
"""
import re
from typing import Optional


def validate_phone_number(phone: str) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Validate and normalize a phone number.
    
    Args:
        phone: Phone number string
        
    Returns:
        Tuple of (is_valid, normalized_number, error_message)
    """
    if not phone:
        return False, None, "Phone number is required"
    
    # Remove all non-digit characters
    digits_only = re.sub(r'[^\d]', '', phone)
    
    # Check if it's a valid length (10-15 digits)
    if len(digits_only) < 10 or len(digits_only) > 15:
        return False, None, f"Invalid phone number length: {len(digits_only)} digits (must be 10-15)"
    
    # Normalize to E.164 format for India (assuming Indian numbers by default)
    # If it starts with 91, it's already in international format
    # If it's 10 digits, add +91 prefix
    if digits_only.startswith('91') and len(digits_only) == 12:
        normalized = f"+{digits_only}"
    elif len(digits_only) == 10:
        normalized = f"+91{digits_only}"
    else:
        # Assume it's already in international format
        normalized = f"+{digits_only}"
    
    return True, normalized, None


def validate_whatsapp_number(phone: str) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Validate and normalize a phone number for WhatsApp.
    
    Args:
        phone: Phone number string
        
    Returns:
        Tuple of (is_valid, normalized_number, error_message)
    """
    is_valid, normalized, error = validate_phone_number(phone)
    if not is_valid:
        return is_valid, None, error
    
    # For WhatsApp, ensure it has the whatsapp: prefix
    if not normalized.startswith('whatsapp:'):
        normalized = f"whatsapp:{normalized}"
    
    return True, normalized, None


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent injection attacks.
    
    Args:
        text: Input text
        max_length: Maximum allowed length
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
    
    # Truncate to max length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()
