"""
Lead qualification service for extracting and classifying lead information.
Analyzes conversation to determine HOT/WARM/COLD classification.
"""
import logging
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class QualificationService:
    """Service for lead qualification and classification."""
    
    # Budget patterns (Indian currency)
    BUDGET_PATTERNS = [
        r'₹\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)',
        r'budget\s*(?:is|:)?\s*(\d+(?:,\d+)*)',
    ]
    
    # Timeline patterns
    TIMELINE_PATTERNS = [
        r'(\d+)\s*(?:days?|day)',
        r'(\d+)\s*(?:weeks?|week)',
        r'(\d+)\s*(?:months?|month)',
        r'(?:urgent|immediately|asap|right away)',
        r'(?:next\s+week|next\s+month)',
        r'(?:this\s+week|this\s+month)',
    ]
    
    # Product count patterns
    PRODUCT_COUNT_PATTERNS = [
        r'(\d+)\s*(?:products?|items?|skus?|designs?|varieties?)',
        r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:products?|items?|skus?)',
    ]
    
    # High intent indicators
    HIGH_INTENT_INDICATORS = [
        'price', 'cost', 'how much', 'budget', 'quote', 'quotation',
        'timeline', 'when', 'how soon', 'delivery', 'start',
        'proceed', 'advance', 'payment', 'buy', 'purchase',
        'send details', 'send quote', 'urgent', 'immediately'
    ]
    
    # Barrier indicators
    BARRIER_INDICATORS = [
        'expensive', 'costly', 'too much', 'over budget',
        'partner', 'discuss with', 'talk to', 'check with',
        'later', 'not now', 'busy', 'no time',
        'already have', 'using another', 'happy with current'
    ]
    
    def __init__(self):
        pass
    
    def extract_qualification(
        self,
        transcript: List[Dict[str, Any]],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Extract qualification data from conversation transcript.
        
        Args:
            transcript: List of transcript messages
            language: Language code
            
        Returns:
            Dictionary with qualification data
        """
        # Combine all customer messages
        customer_text = " ".join([
            msg.get('text', '') for msg in transcript 
            if msg.get('speaker') == 'customer'
        ])
        
        # Extract information
        budget = self._extract_budget(customer_text)
        products = self._extract_products(customer_text)
        product_count = self._extract_product_count(customer_text)
        timeline = self._extract_timeline(customer_text)
        features = self._extract_features(customer_text)
        barriers = self._extract_barriers(customer_text)
        
        # Calculate lead score and classify
        lead_score = self._calculate_lead_score(
            budget, timeline, product_count, features, barriers, customer_text
        )
        
        lead_status = self._classify_lead(lead_score, barriers)
        buying_intent = self._determine_buying_intent(lead_score, customer_text)
        decision_maker = self._determine_decision_maker(customer_text)
        
        return {
            "lead_status": lead_status,
            "budget": budget,
            "products": products,
            "product_count": product_count,
            "timeline": timeline,
            "features": features,
            "buying_intent": buying_intent,
            "barrier": barriers,
            "decision_maker": decision_maker,
            "lead_score": lead_score,
            "confidence_score": self._calculate_confidence(budget, timeline, product_count)
        }
    
    def _extract_budget(self, text: str) -> str:
        """Extract budget information from text."""
        for pattern in self.BUDGET_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if len(matches) == 1:
                    return f"₹{matches[0]}"
                else:
                    return f"₹{matches[0]} - ₹{matches[-1]}"
        return ""
    
    def _extract_products(self, text: str) -> str:
        """Extract product information from text."""
        # Common e-commerce product keywords
        product_keywords = [
            'saree', 'dress', 'kurti', 'clothes', 'fashion',
            'spices', 'food', 'grocery', 'dry fruits',
            'electronics', 'gadgets', 'mobile', 'accessories',
            'gift', 'handicraft', 'jewelry', 'toys'
        ]
        
        found_products = []
        for keyword in product_keywords:
            if keyword.lower() in text.lower():
                found_products.append(keyword.capitalize())
        
        return ", ".join(found_products) if found_products else ""
    
    def _extract_product_count(self, text: str) -> str:
        """Extract product count from text."""
        for pattern in self.PRODUCT_COUNT_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if match.groups() and len(match.groups()) >= 2 and match.group(2):
                    return f"{match.group(1)}-{match.group(2)} SKUs"
                elif match.group(1):
                    return f"{match.group(1)} SKUs"
        return ""
    
    def _extract_timeline(self, text: str) -> str:
        """Extract timeline information from text."""
        for pattern in self.TIMELINE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if 'urgent' in match.group(0).lower() or 'immediately' in match.group(0).lower():
                    return "Urgent / Immediate"
                elif match.group(1):
                    return match.group(0)
        return ""
    
    def _extract_features(self, text: str) -> List[str]:
        """Extract required features from text."""
        feature_keywords = {
            'payment': ['payment', 'upi', 'gateway', 'razorpay', 'paytm', 'card'],
            'tracking': ['tracking', 'courier', 'shipping', 'delivery status'],
            'whatsapp': ['whatsapp', 'wa', 'chat'],
            'mobile': ['mobile', 'app', 'responsive'],
            'gst': ['gst', 'invoice', 'tax'],
            'catalog': ['catalog', 'gallery', 'portfolio']
        }
        
        features = []
        for feature, keywords in feature_keywords.items():
            if any(keyword in text.lower() for keyword in keywords):
                features.append(feature.replace('_', ' ').title())
        
        return features
    
    def _extract_barriers(self, text: str) -> str:
        """Extract barriers/concerns from text."""
        for indicator in self.BARRIER_INDICATORS:
            if indicator in text.lower():
                # Find context around the barrier
                return self._get_barrier_context(text, indicator)
        return ""
    
    def _get_barrier_context(self, text: str, indicator: str) -> str:
        """Get context around a barrier indicator."""
        words = text.split()
        for i, word in enumerate(words):
            if indicator in word.lower():
                # Get surrounding words for context
                start = max(0, i - 3)
                end = min(len(words), i + 4)
                return " ".join(words[start:end])
        return indicator
    
    def _calculate_lead_score(
        self,
        budget: str,
        timeline: str,
        product_count: str,
        features: List[str],
        barrier: str,
        text: str
    ) -> int:
        """Calculate lead score (0-100)."""
        score = 0
        
        # Budget mentioned (+20)
        if budget:
            score += 20
        
        # Timeline specified (+20)
        if timeline:
            score += 20
            if 'urgent' in timeline.lower() or 'immediate' in timeline.lower():
                score += 10
        
        # Product count specified (+15)
        if product_count:
            score += 15
        
        # Features mentioned (+15)
        score += min(len(features) * 5, 15)
        
        # High intent indicators (+20)
        high_intent_count = sum(1 for indicator in self.HIGH_INTENT_INDICATORS if indicator in text.lower())
        score += min(high_intent_count * 5, 20)
        
        # Barrier reduces score
        if barrier:
            score -= 20
        
        return max(0, min(100, score))
    
    def _classify_lead(self, lead_score: int, barrier: str) -> str:
        """Classify lead as HOT, WARM, or COLD."""
        if lead_score >= 70:
            return "HOT"
        elif lead_score >= 40:
            return "WARM"
        else:
            return "COLD"
    
    def _determine_buying_intent(self, lead_score: int, text: str) -> str:
        """Determine buying intent level."""
        if lead_score >= 70:
            return "High"
        elif lead_score >= 40:
            return "Medium"
        else:
            return "Low"
    
    def _determine_decision_maker(self, text: str) -> str:
        """Determine if customer is a decision maker."""
        decision_maker_indicators = ['owner', 'i decide', 'my decision', 'i will', 'i am the']
        non_decision_indicators = ['partner', 'boss', 'manager', 'discuss with', 'check with']
        
        if any(indicator in text.lower() for indicator in decision_maker_indicators):
            return "Known"
        elif any(indicator in text.lower() for indicator in non_decision_indicators):
            return "Unknown"
        else:
            return "Unknown"
    
    def _calculate_confidence(self, budget: str, timeline: str, product_count: str) -> int:
        """Calculate confidence score for qualification."""
        factors = [budget, timeline, product_count]
        present_factors = sum(1 for f in factors if f)
        return int((present_factors / len(factors)) * 100)


# Global qualification service instance
qualification_service = QualificationService()
