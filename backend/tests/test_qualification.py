"""
Tests for lead qualification service.
"""
import pytest
from app.services.qualification import qualification_service


class TestQualificationService:
    """Test lead qualification logic."""
    
    def test_extract_budget(self):
        """Test budget extraction from text."""
        text = "My budget is around 35,000 rupees"
        budget = qualification_service._extract_budget(text)
        assert "35000" in budget or "₹" in budget
    
    def test_extract_budget_with_rupee_symbol(self):
        """Test budget extraction with rupee symbol."""
        text = "I can spend ₹30,000 to ₹35,000"
        budget = qualification_service._extract_budget(text)
        assert "₹" in budget
    
    def test_extract_product_count(self):
        """Test product count extraction."""
        text = "We have about 120 to 150 products"
        count = qualification_service._extract_product_count(text)
        assert "120" in count or "150" in count
    
    def test_extract_timeline(self):
        """Test timeline extraction."""
        text = "I need it within 10 days"
        timeline = qualification_service._extract_timeline(text)
        assert "10" in timeline or "days" in timeline.lower()
    
    def test_calculate_lead_score_high(self):
        """Test lead score calculation for high intent."""
        score = qualification_service._calculate_lead_score(
            budget="₹35,000",
            timeline="10 days",
            product_count="120 SKUs",
            features=["payment", "tracking"],
            barrier="",
            text="I want to proceed immediately, what is the price?"
        )
        assert score >= 70
    
    def test_calculate_lead_score_low(self):
        """Test lead score calculation for low intent."""
        score = qualification_service._calculate_lead_score(
            budget="",
            timeline="",
            product_count="",
            features=[],
            barrier="too expensive",
            text="just looking, not interested right now"
        )
        assert score < 40
    
    def test_classify_lead_hot(self):
        """Test lead classification as HOT."""
        status = qualification_service._classify_lead(85, "")
        assert status == "HOT"
    
    def test_classify_lead_warm(self):
        """Test lead classification as WARM."""
        status = qualification_service._classify_lead(55, "needs partner approval")
        assert status == "WARM"
    
    def test_classify_lead_cold(self):
        """Test lead classification as COLD."""
        status = qualification_service._classify_lead(25, "")
        assert status == "COLD"
    
    def test_extract_qualification_full(self):
        """Test full qualification extraction from transcript."""
        transcript = [
            {"speaker": "customer", "text": "I have 120 products and budget is 35,000 rupees. Need it in 10 days."}
        ]
        qual = qualification_service.extract_qualification(transcript, "en")
        
        assert qual["lead_status"] in ["HOT", "WARM", "COLD", "UNASSIGNED"]
        assert qual["lead_score"] >= 0
        assert qual["lead_score"] <= 100
