"""
Tests for validation utilities.
"""
import pytest
from app.utils.validation import validate_phone_number, validate_whatsapp_number, sanitize_input


class TestValidation:
    """Test validation utilities."""
    
    def test_validate_phone_number_valid_10_digit(self):
        """Test validation of valid 10-digit Indian number."""
        is_valid, normalized, error = validate_phone_number("9876543210")
        assert is_valid is True
        assert normalized == "+919876543210"
        assert error is None
    
    def test_validate_phone_number_valid_with_country_code(self):
        """Test validation of number with country code."""
        is_valid, normalized, error = validate_phone_number("919876543210")
        assert is_valid is True
        assert normalized == "+919876543210"
        assert error is None
    
    def test_validate_phone_number_invalid_length(self):
        """Test validation of invalid length number."""
        is_valid, normalized, error = validate_phone_number("12345")
        assert is_valid is False
        assert normalized is None
        assert error is not None
    
    def test_validate_phone_number_empty(self):
        """Test validation of empty phone number."""
        is_valid, normalized, error = validate_phone_number("")
        assert is_valid is False
        assert normalized is None
        assert error is not None
    
    def test_validate_whatsapp_number(self):
        """Test WhatsApp number validation."""
        is_valid, normalized, error = validate_whatsapp_number("9876543210")
        assert is_valid is True
        assert normalized.startswith("whatsapp:+")
        assert error is None
    
    def test_sanitize_input(self):
        """Test input sanitization."""
        text = "Hello\x00World"
        sanitized = sanitize_input(text)
        assert "\x00" not in sanitized
        assert "HelloWorld" in sanitized
    
    def test_sanitize_input_truncation(self):
        """Test input truncation."""
        long_text = "a" * 2000
        sanitized = sanitize_input(long_text, max_length=100)
        assert len(sanitized) == 100
