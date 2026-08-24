"""
Voice agent service for AI conversation management.
Handles natural conversation flow in English, Hindi, and Telugu.
"""
import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


class VoiceAgentService:
    """Service for managing AI voice conversations."""
    
    # Conversation states
    STATES = [
        'greeting',
        'business_understanding',
        'product_inquiry',
        'budget_inquiry',
        'timeline_inquiry',
        'feature_inquiry',
        'closing',
        'completed'
    ]
    
    # Greetings by language
    GREETINGS = {
        'en': "Hello! I'm calling from AI Web Solutions. We help businesses build beautiful e-commerce websites with online payments. Would you be interested in expanding your sales online?",
        'hi': "नमस्ते! मैं AI Web Solutions से बात कर रहा हूँ। हम व्यवसायों के लिए ऑनलाइन पेमेंट के साथ ई-कॉमर्स वेबसाइट बनाते हैं। क्या आप ऑनलाइन बिक्री बढ़ाने में रुचि रखेंगे?",
        'te': "నమస్కారం! నేను AI Web Solutions నుండి మాట్లాడుతున్నాను. మేము వ్యాపారాలకు ఆన్‌లైన్ చెల్లింపులతో ఈ-కామర్స్ వెబ్‌సైట్‌లను నిర్మిస్తాము. మీరు ఆన్‌లైన్ అమ్మకాలను పెంచడానికి ఆసక్తి ఉన్నారా?",
    }
    
    # Follow-up questions by state and language
    FOLLOW_UPS = {
        'business_understanding': {
            'en': "That's great! What type of products do you currently sell?",
            'hi': "बहुत बढ़िया! आप वर्तमान में किस प्रकार के उत्पाद बेचते हैं?",
            'te': "చాలా బాగుంది! మీరు ప్రస్తుతం ఏ రకమైన ఉత్పత్తులను అమ్ముతున్నారు?",
        },
        'product_inquiry': {
            'en': "How many different products or designs do you have?",
            'hi': "आपके पास कितने अलग-अलग उत्पाद या डिज़ाइन हैं?",
            'te': "మీ దగ్గర ఎన్ని విభిన్న ఉత్పత్తులు లేదా డిజైన్‌లు ఉన్నాయి?",
        },
        'budget_inquiry': {
            'en': "What's your approximate budget for the website?",
            'hi': "वेबसाइट के लिए आपका अनुमानित बजट क्या है?",
            'te': "వెబ్‌సైట్ కోసం మీ సరైన బడ్జెట్ ఎంత?",
        },
        'timeline_inquiry': {
            'en': "When would you like to launch the website?",
            'hi': "आप वेबसाइट कब लॉन्च करना चाहेंगे?",
            'te': "మీరు వెబ్‌సైట్‌ను ఎప్పుడు ప్రారంభించాలనుకుంటున్నారు?",
        },
        'feature_inquiry': {
            'en': "What features are important to you? For example, online payments, WhatsApp integration, or order tracking?",
            'hi': "आपके लिए कौन से फीचर्स महत्वपूर्ण हैं? उदाहरण के लिए, ऑनलाइन पेमेंट, व्हाट्सएप इंटीग्रेशन, या ऑर्डर ट्रैकिंग?",
            'te': 'మీకు ఏ ఫీచర్‌లు ముఖ్యమైనవి? ఉదాహరణకు, ఆన్‌లైన్ చెల్లింపులు, వాట్సాప్ ఇంటిగ్రేషన్, లేదా ఆర్డర్ ట్రాకింగ్?',
        },
        'closing': {
            'en': "Thank you for your time! I'll send you a detailed quotation and demo link. When would be a good time for a follow-up call?",
            'hi': "आपका समय देने के लिए धन्यवाद! मैं आपको विस्तृत कोटेशन और डेमो लिंक भेजूंगा। फॉलो-अप कॉल के लिए कब अच्छा रहेगा?",
            'te': "మీ సమయం ఇచ్చినందుకు ధన్యవాదాలు! నేను మీకు వివరణాత్మక కోటేషన్ మరియు డెమో లింక్ పంపుతాను. ఫాలో-అప్ కాల్ కోసం ఎప్పుడు సరైన సమయం?",
        },
    }
    
    def __init__(self):
        self.current_state = 'greeting'
        self.conversation_history = []
    
    def get_next_response(
        self,
        customer_input: str,
        language: str = "en",
        current_qualification: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate the next AI response based on customer input.
        
        Args:
            customer_input: Customer's latest message
            language: Language code
            current_qualification: Current qualification data
            
        Returns:
            Dictionary with AI response and metadata
        """
        # Add customer input to history
        self.conversation_history.append({
            'speaker': 'customer',
            'text': customer_input,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Determine next state
        next_state = self._determine_next_state(customer_input, current_qualification)
        self.current_state = next_state
        
        # Generate response
        response = self._generate_response(next_state, language, customer_input)
        
        # Add AI response to history
        self.conversation_history.append({
            'speaker': 'ai',
            'text': response,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return {
            'response': response,
            'state': next_state,
            'language': language,
            'should_trigger_action': self._should_trigger_action(next_state, current_qualification)
        }
    
    def _determine_next_state(
        self,
        customer_input: str,
        qualification: Optional[Dict[str, Any]]
    ) -> str:
        """Determine the next conversation state."""
        if self.current_state == 'greeting':
            return 'business_understanding'
        elif self.current_state == 'business_understanding':
            return 'product_inquiry'
        elif self.current_state == 'product_inquiry':
            return 'budget_inquiry'
        elif self.current_state == 'budget_inquiry':
            return 'timeline_inquiry'
        elif self.current_state == 'timeline_inquiry':
            return 'feature_inquiry'
        elif self.current_state == 'feature_inquiry':
            return 'closing'
        elif self.current_state == 'closing':
            return 'completed'
        else:
            return 'business_understanding'
    
    def _generate_response(
        self,
        state: str,
        language: str,
        customer_input: str
    ) -> str:
        """Generate AI response for the current state."""
        if state == 'greeting':
            return self.GREETINGS.get(language, self.GREETINGS['en'])
        else:
            follow_ups = self.FOLLOW_UPS.get(state, {})
            return follow_ups.get(language, follow_ups.get('en', "Could you tell me more?"))
    
    def _should_trigger_action(
        self,
        state: str,
        qualification: Optional[Dict[str, Any]]
    ) -> bool:
        """Determine if an action should be triggered (e.g., WhatsApp message)."""
        # Trigger WhatsApp for HOT leads when closing
        if state == 'closing' and qualification:
            lead_status = qualification.get('lead_status', 'UNASSIGNED')
            return lead_status == 'HOT'
        return False
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text.
        Simple heuristic-based detection.
        """
        # Telugu characters range
        telugu_chars = set('అఆఇఈఉఊఋఌఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరఱలళవశషసహ')
        
        # Hindi characters range (Devanagari)
        hindi_chars = set('अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')
        
        text_chars = set(text)
        
        if text_chars & telugu_chars:
            return 'te'
        elif text_chars & hindi_chars:
            return 'hi'
        else:
            return 'en'
    
    def reset_conversation(self):
        """Reset the conversation state."""
        self.current_state = 'greeting'
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get the full conversation history."""
        return self.conversation_history


# Global voice agent service instance
voice_agent_service = VoiceAgentService()
