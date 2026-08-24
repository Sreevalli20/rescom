"""
Tests for WhatsApp service.
"""
import pytest
from app.services.whatsapp import whatsapp_service


class TestWhatsAppService:
    """Test WhatsApp service functionality."""
    
    @pytest.mark.asyncio
    async def test_send_mock_message(self):
        """Test sending a mock WhatsApp message."""
        result = await whatsapp_service.send_message(
            to_phone="whatsapp:+919876543210",
            message="Test message"
        )
        assert result["success"] is True
        assert "message_id" in result
        assert result["provider"] == "mock"
    
    @pytest.mark.asyncio
    async def test_send_contextual_hot_lead_message_english(self):
        """Test sending HOT lead message in English."""
        qual = {
            "budget": "₹35,000",
            "products": "clothing",
            "product_count": "120 SKUs",
            "timeline": "10 days",
            "features": ["payment", "tracking"],
            "barrier": ""
        }
        result = await whatsapp_service.send_contextual_hot_lead_message(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="en"
        )
        assert result["success"] is True
        assert "message_id" in result
    
    @pytest.mark.asyncio
    async def test_send_contextual_hot_lead_message_hindi(self):
        """Test sending HOT lead message in Hindi."""
        qual = {
            "budget": "₹35,000",
            "products": "clothing",
            "product_count": "120 SKUs",
            "timeline": "10 days",
            "features": ["payment"],
            "barrier": ""
        }
        result = await whatsapp_service.send_contextual_hot_lead_message(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="hi"
        )
        assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_send_contextual_hot_lead_message_telugu(self):
        """Test sending HOT lead message in Telugu."""
        qual = {
            "budget": "₹35,000",
            "products": "clothing",
            "product_count": "120 SKUs",
            "timeline": "10 days",
            "features": ["payment"],
            "barrier": ""
        }
        result = await whatsapp_service.send_contextual_hot_lead_message(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="te"
        )
        assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_send_contextual_warm_lead_message(self):
        """Test sending WARM lead message."""
        qual = {
            "budget": "",
            "products": "clothing",
            "product_count": "",
            "timeline": "",
            "features": [],
            "barrier": "too expensive"
        }
        result = await whatsapp_service.send_contextual_warm_lead_message(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="en"
        )
        assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_send_contextual_cold_lead_message(self):
        """Test sending COLD lead message."""
        qual = {
            "budget": "",
            "products": "clothing",
            "product_count": "",
            "timeline": "",
            "features": [],
            "barrier": ""
        }
        result = await whatsapp_service.send_contextual_cold_lead_message(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="en"
        )
        assert result["success"] is True
    
    @pytest.mark.asyncio
    async def test_send_follow_up_with_resume(self):
        """Test sending follow-up with resume."""
        qual = {
            "budget": "₹35,000",
            "products": "clothing",
            "product_count": "120 SKUs",
            "timeline": "10 days",
            "features": ["payment"],
            "barrier": ""
        }
        result = await whatsapp_service.send_follow_up_with_resume(
            to_phone="whatsapp:+919876543210",
            qualification=qual,
            language="en"
        )
        assert result["success"] is True
