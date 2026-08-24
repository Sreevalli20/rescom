"""
Tests for callback parsing service.
"""
import pytest
from app.services.callback import callback_parser
from datetime import datetime


class TestCallbackParser:
    """Test callback time parsing logic."""
    
    def test_parse_tomorrow(self):
        """Test parsing 'tomorrow'."""
        result = callback_parser.parse_callback_request("call me tomorrow", "en")
        assert result["success"] is True
        assert result["parsed_datetime"] is not None
    
    def test_parse_today(self):
        """Test parsing 'today'."""
        result = callback_parser.parse_callback_request("call today", "en")
        assert result["success"] is True
    
    def test_parse_tomorrow_morning(self):
        """Test parsing 'tomorrow morning'."""
        result = callback_parser.parse_callback_request("call me tomorrow morning", "en")
        assert result["success"] is True
        assert result["parsed_datetime"] is not None
    
    def test_parse_specific_time(self):
        """Test parsing specific time."""
        result = callback_parser.parse_callback_request("call me at 2 pm", "en")
        assert result["success"] is True
    
    def test_parse_hindi_time(self):
        """Test parsing Hindi time expression."""
        result = callback_parser.parse_callback_request("कल दोपहर 2 बजे फोन करो", "hi")
        assert result["success"] is True
    
    def test_parse_telugu_time(self):
        """Test parsing Telugu time expression."""
        result = callback_parser.parse_callback_request("రేపు సాయంత్రం 5 గంటలకు ఫోన్ చేయండి", "te")
        assert result["success"] is True
    
    def test_parse_next_monday(self):
        """Test parsing 'next monday'."""
        result = callback_parser.parse_callback_request("call next monday", "en")
        assert result["success"] is True
    
    def test_parse_invalid_input(self):
        """Test parsing invalid input."""
        result = callback_parser.parse_callback_request("xyz123", "en")
        # Should still return a result, even if parsing fails
        assert "original_text" in result
