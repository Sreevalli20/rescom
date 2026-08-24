"""
WhatsApp service module with provider abstraction.
Supports Twilio Sandbox, MessageBird, Gupshup, and mock mode.
Twilio Sandbox limitation: Only sends to recipients who have joined the Sandbox.
"""
import logging
import httpx
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class WhatsAppService:
    """Service for sending WhatsApp messages with provider abstraction."""
    
    def __init__(self):
        self.provider = settings.WHATSAPP_PROVIDER.lower()
        
        # Twilio-specific credentials
        self.twilio_account_sid = settings.TWILIO_ACCOUNT_SID
        self.twilio_auth_token = settings.TWILIO_AUTH_TOKEN
        self.twilio_whatsapp_from = settings.TWILIO_WHATSAPP_FROM
        self.twilio_whatsapp_to = settings.TWILIO_WHATSAPP_TO
        
        # Legacy credentials (for other providers)
        self.api_key = settings.WHATSAPP_API_KEY
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.business_account_id = settings.WHATSAPP_BUSINESS_ACCOUNT_ID
        
        # Contact information
        self.contact_mobile = settings.CONTACT_MOBILE
        self.resume_url = settings.RESUME_URL
        self.architecture_image_url = settings.ARCHITECTURE_IMAGE_URL
        
        if self.provider == "mock":
            logger.info("WhatsApp service running in MOCK mode")
        elif self.provider == "twilio":
            logger.info("WhatsApp service using Twilio Sandbox provider")
            logger.warning("Twilio Sandbox limitation: Only sends to recipients who have joined the Sandbox")
        else:
            logger.info(f"WhatsApp service using provider: {self.provider}")
    
    async def send_message(
        self,
        to_phone: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a WhatsApp message to a customer.
        
        Args:
            to_phone: Customer phone number (with country code, no + or spaces)
            message: Message content
            template_name: Optional template name for template messages
            template_params: Optional parameters for template variables
            
        Returns:
            Dictionary with send result and message ID
        """
        if self.provider == "mock":
            return await self._send_mock_message(to_phone, message, template_name)
        
        # Provider-specific implementations
        if self.provider == "twilio":
            return await self._send_twilio_message(to_phone, message, template_name, template_params)
        elif self.provider == "messagebird":
            return await self._send_messagebird_message(to_phone, message, template_name, template_params)
        elif self.provider == "gupshup":
            return await self._send_gupshup_message(to_phone, message, template_name, template_params)
        else:
            logger.warning(f"Unknown WhatsApp provider: {self.provider}, falling back to mock")
            return await self._send_mock_message(to_phone, message, template_name)
    
    async def _send_mock_message(
        self,
        to_phone: str,
        message: str,
        template_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send a mock WhatsApp message for development."""
        logger.info(f"[MOCK WhatsApp] To: {to_phone}, Template: {template_name or 'none'}, Message: {message[:100]}...")
        
        return {
            "success": True,
            "message_id": f"MOCK-WA-{self._generate_mock_id()}",
            "status": "sent",
            "provider": "mock",
            "to_phone": to_phone,
            "message": message,
            "note": "This is a mock message. Configure WHATSAPP_PROVIDER and credentials for real delivery."
        }
    
    async def _send_twilio_message(
        self,
        to_phone: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send message via Twilio WhatsApp Sandbox API."""
        
        if not self.twilio_account_sid or not self.twilio_auth_token or not self.twilio_whatsapp_from:
            logger.warning("Twilio credentials not configured, falling back to mock")
            return await self._send_mock_message(to_phone, message, template_name)
        
        # Use default TO number if not provided (for Sandbox testing)
        if not to_phone and self.twilio_whatsapp_to:
            to_phone = self.twilio_whatsapp_to
        
        try:
            # Twilio API endpoint
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_account_sid}/Messages.json"
            
            # Format phone numbers for WhatsApp
            from_number = self.twilio_whatsapp_from if self.twilio_whatsapp_from.startswith("whatsapp:") else f"whatsapp:{self.twilio_whatsapp_from}"
            to_number = to_phone if to_phone.startswith("whatsapp:") else f"whatsapp:{to_phone}"
            
            if template_name:
                # Template message (for production WhatsApp Business API)
                data = {
                    "From": from_number,
                    "To": to_number,
                    "ContentSid": template_name,
                }
                if template_params:
                    data["ContentVariables"] = template_params
            else:
                # Session message (works in Sandbox)
                data = {
                    "From": from_number,
                    "To": to_number,
                    "Body": message,
                }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    auth=(self.twilio_account_sid, self.twilio_auth_token),
                    data=data
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Twilio WhatsApp message sent: SID={result.get('sid')}, Status={result.get('status')}")
                
                return {
                    "success": True,
                    "message_id": result.get("sid"),
                    "status": result.get("status"),
                    "provider": "twilio",
                    "to_phone": to_phone,
                    "sandbox_warning": "Recipient must have joined Twilio Sandbox to receive messages"
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Twilio WhatsApp HTTP error: {e.response.status_code} - {e.response.text}")
            # Check for specific Sandbox error
            if "Unreachable" in str(e.response) or "not opted in" in str(e.response).lower():
                logger.warning("Recipient has not joined Twilio Sandbox. Message not delivered.")
            return {
                "success": False,
                "error": f"HTTP {e.response.status_code}: {e.response.text}",
                "provider": "twilio",
                "sandbox_error": "Recipient may not have joined Twilio Sandbox"
            }
        except Exception as e:
            logger.error(f"Twilio WhatsApp error: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": "twilio"
            }
    
    async def _send_messagebird_message(
        self,
        to_phone: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send message via MessageBird WhatsApp API."""
        # TODO: Implement MessageBird integration
        logger.warning("MessageBird provider not fully implemented, falling back to mock")
        return await self._send_mock_message(to_phone, message, template_name)
    
    async def _send_gupshup_message(
        self,
        to_phone: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send message via Gupshup WhatsApp API."""
        # TODO: Implement Gupshup integration
        logger.warning("Gupshup provider not fully implemented, falling back to mock")
        return await self._send_mock_message(to_phone, message, template_name)
    
    async def send_catalog_link(
        self,
        to_phone: str,
        catalog_url: str,
        business_name: str
    ) -> Dict[str, Any]:
        """
        Send a WhatsApp catalog/product link.
        
        Args:
            to_phone: Customer phone number
            catalog_url: URL to the catalog/demo store
            business_name: Name of the business
            
        Returns:
            Dictionary with send result
        """
        message = f"Hello! Here is your personalized demo catalog from {business_name}: {catalog_url}. Feel free to browse and let us know if you have any questions!"
        return await self.send_message(to_phone, message, template_name="catalog_link")
    
    async def send_quote(
        self,
        to_phone: str,
        quote_amount: str,
        package_name: str,
        features: list
    ) -> Dict[str, Any]:
        """
        Send a quotation via WhatsApp.
        
        Args:
            to_phone: Customer phone number
            quote_amount: Quoted amount
            package_name: Package/service name
            features: List of features included
            
        Returns:
            Dictionary with send result
        """
        features_text = "\n".join([f"• {f}" for f in features])
        message = f"Thank you for your interest! Here's your quotation:\n\nPackage: {package_name}\nAmount: {quote_amount}\n\nFeatures:\n{features_text}\n\nLet us know if you'd like to proceed!"
        return await self.send_message(to_phone, message, template_name="quotation")
    
    async def send_contextual_hot_lead_message(
        self,
        to_phone: str,
        qualification: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Send a contextual WhatsApp message for HOT leads with actual conversation details.
        
        Args:
            to_phone: Customer phone number
            qualification: Qualification data with budget, products, timeline, features
            language: Customer's language
            
        Returns:
            Dictionary with send result
        """
        budget = qualification.get("budget", "")
        products = qualification.get("products", "")
        product_count = qualification.get("product_count", "")
        timeline = qualification.get("timeline", "")
        features = qualification.get("features", [])
        
        # Build contextual message based on language
        if language == "hi":
            message = self._build_hot_message_hindi(budget, products, product_count, timeline, features)
        elif language == "te":
            message = self._build_hot_message_telugu(budget, products, product_count, timeline, features)
        else:
            message = self._build_hot_message_english(budget, products, product_count, timeline, features)
        
        # Add contact information if available
        if self.contact_mobile:
            message += f"\n\nContact: {self.contact_mobile}"
        
        logger.info(f"Sending HOT lead WhatsApp message to {to_phone}")
        return await self.send_message(to_phone, message)
    
    async def send_contextual_warm_lead_message(
        self,
        to_phone: str,
        qualification: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Send a contextual WhatsApp message for WARM leads addressing their barrier.
        
        Args:
            to_phone: Customer phone number
            qualification: Qualification data including barrier
            language: Customer's language
            
        Returns:
            Dictionary with send result
        """
        barrier = qualification.get("barrier", "")
        products = qualification.get("products", "")
        
        if language == "hi":
            message = self._build_warm_message_hindi(barrier, products)
        elif language == "te":
            message = self._build_warm_message_telugu(barrier, products)
        else:
            message = self._build_warm_message_english(barrier, products)
        
        if self.contact_mobile:
            message += f"\n\nContact: {self.contact_mobile}"
        
        logger.info(f"Sending WARM lead WhatsApp message to {to_phone}")
        return await self.send_message(to_phone, message)
    
    async def send_contextual_cold_lead_message(
        self,
        to_phone: str,
        qualification: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Send a contextual WhatsApp follow-up for COLD leads.
        
        Args:
            to_phone: Customer phone number
            qualification: Qualification data
            language: Customer's language
            
        Returns:
            Dictionary with send result
        """
        products = qualification.get("products", "your products")
        
        if language == "hi":
            message = f"नमस्ते! हमने आपके बारे में सुना है कि आप {products} बेचते हैं। जब भी आप ऑनलाइन बिक्री शुरू करने के बारे में सोचें, हमसे संपर्क करें।"
        elif language == "te":
            message = f"నమస్కారం! మీరు {products} అమ్ముతున్నారని విన్నాము. మీరు ఆన్‌లైన్ అమ్మకాలు ప్రారంభించాలనుకున్నప్పుడు దయచేసి మమ్మల్ని సంప్రదించండి।"
        else:
            message = f"Hello! We heard you sell {products}. Whenever you're ready to explore online sales, feel free to reach out."
        
        if self.contact_mobile:
            message += f"\n\nContact: {self.contact_mobile}"
        
        logger.info(f"Sending COLD lead WhatsApp message to {to_phone}")
        return await self.send_message(to_phone, message)
    
    async def send_follow_up_with_resume(
        self,
        to_phone: str,
        qualification: Dict[str, Any],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Send a follow-up message with resume and architecture image.
        
        Args:
            to_phone: Customer phone number
            qualification: Qualification data
            language: Customer's language
            
        Returns:
            Dictionary with send result
        """
        budget = qualification.get("budget", "")
        products = qualification.get("products", "")
        product_count = qualification.get("product_count", "")
        timeline = qualification.get("timeline", "")
        features = qualification.get("features", [])
        
        # Build contextual message
        if language == "hi":
            message = self._build_follow_up_hindi(budget, products, product_count, timeline, features)
        elif language == "te":
            message = self._build_follow_up_telugu(budget, products, product_count, timeline, features)
        else:
            message = self._build_follow_up_english(budget, products, product_count, timeline, features)
        
        # Add contact information
        if self.contact_mobile:
            message += f"\n\n📱 Contact: {self.contact_mobile}"
        
        # Add resume URL if available
        if self.resume_url:
            message += f"\n📄 Resume: {self.resume_url}"
        
        # Add architecture image URL if available
        if self.architecture_image_url:
            message += f"\n🏗️ Architecture: {self.architecture_image_url}"
        
        logger.info(f"Sending follow-up with resume to {to_phone}")
        return await self.send_message(to_phone, message)
    
    def _build_hot_message_english(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build HOT lead message in English."""
        message = f"Great speaking with you! Based on our conversation:\n\n"
        if products:
            message += f"• Products: {products}\n"
        if product_count:
            message += f"• Product Count: {product_count}\n"
        if budget:
            message += f"• Budget: {budget}\n"
        if timeline:
            message += f"• Timeline: {timeline}\n"
        if features:
            message += f"• Features: {', '.join(features)}\n"
        message += "\nI'll send you a detailed quotation shortly. Let's move forward!"
        return message
    
    def _build_hot_message_hindi(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build HOT lead message in Hindi."""
        message = f"आपसे बात करके अच्छा लगा! हमारी बातचीत के आधार पर:\n\n"
        if products:
            message += f"• उत्पाद: {products}\n"
        if product_count:
            message += f"• उत्पाद संख्या: {product_count}\n"
        if budget:
            message += f"• बजट: {budget}\n"
        if timeline:
            message += f"• समयरेखा: {timeline}\n"
        if features:
            message += f"• विशेषताएं: {', '.join(features)}\n"
        message += "\nमैं आपको विस्तृत कोटेशन भेजूंगा। आगे बढ़ें!"
        return message
    
    def _build_hot_message_telugu(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build HOT lead message in Telugu."""
        message = f"మీతో మాట్లాడటం చాలా బాగుంది! మా సంభాషణ ఆధారంగా:\n\n"
        if products:
            message += f"• ఉత్పత్తులు: {products}\n"
        if product_count:
            message += f"• ఉత్పత్తి సంఖ్య: {product_count}\n"
        if budget:
            message += f"• బడ్జెట్: {budget}\n"
        if timeline:
            message += f"• టైమ్‌లైన్: {timeline}\n"
        if features:
            message += f"• ఫీచర్‌లు: {', '.join(features)}\n"
        message += "\nనేను మీకు వివరణాత్మక కోటేషన్ పంపుతాను. ముందుకు వెళ్దాం!"
        return message
    
    def _build_warm_message_english(self, barrier: str, products: str) -> str:
        """Build WARM lead message in English."""
        message = f"Thanks for your time! I understand you have some concerns about {barrier}.\n\n"
        if products:
            message += f"For your {products} business, we can definitely work within your constraints.\n\n"
        message += "Let's schedule a follow-up call to discuss options. When would be a good time?"
        return message
    
    def _build_warm_message_hindi(self, barrier: str, products: str) -> str:
        """Build WARM lead message in Hindi."""
        message = f"आपका समय देने के लिए धन्यवाद! मैं समझता हूं कि आपको {barrier} को लेकर कुछ चिंताएं हैं।\n\n"
        if products:
            message += f"आपके {products} व्यवसाय के लिए, हम आपकी बाधाओं के भीतर काम कर सकते हैं।\n\n"
        message += "विकल्पों पर चर्चा करने के लिए एक फॉलो-अप कॉल शेड्यूल करें। कब अच्छा रहेगा?"
        return message
    
    def _build_warm_message_telugu(self, barrier: str, products: str) -> str:
        """Build WARM lead message in Telugu."""
        message = f"మీ సమయం ఇచ్చినందుకు ధన్యవాదాలు! మీకు {barrier} గురించి కొన్ని ఆందోళనలు ఉన్నాయని నేను అర్థం చేసుకున్నాను।\n\n"
        if products:
            message += f"మీ {products} వ్యాపారం కోసం, మేము మీ అడ్డంకుల లోపల పని చేయగలము।\n\n"
        message += "ఎంపికల గురించి చర్చించడానికి ఫాలో-అప్ కాల్ షెడ్యూల్ చేద్దాం। ఎప్పుడు సరైన సమయం?"
        return message
    
    def _build_follow_up_english(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build follow-up message in English."""
        message = f"Hi! Following up on our conversation about your e-commerce website:\n\n"
        if products:
            message += f"• Products: {products}\n"
        if product_count:
            message += f"• Product Count: {product_count}\n"
        if budget:
            message += f"• Budget: {budget}\n"
        if timeline:
            message += f"• Timeline: {timeline}\n"
        if features:
            message += f"• Features: {', '.join(features)}\n"
        message += "\nHere are my credentials for your reference:"
        return message
    
    def _build_follow_up_hindi(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build follow-up message in Hindi."""
        message = f"नमस्ते! आपकी ई-कॉमर्स वेबसाइट के बारे में हमारी बातचीत पर फॉलो-अप:\n\n"
        if products:
            message += f"• उत्पाद: {products}\n"
        if product_count:
            message += f"• उत्पाद संख्या: {product_count}\n"
        if budget:
            message += f"• बजट: {budget}\n"
        if timeline:
            message += f"• समयरेखा: {timeline}\n"
        if features:
            message += f"• विशेषताएं: {', '.join(features)}\n"
        message += "\nआपकी सुविधा के लिए यहाँ मेरी जानकारी है:"
        return message
    
    def _build_follow_up_telugu(self, budget: str, products: str, product_count: str, timeline: str, features: list) -> str:
        """Build follow-up message in Telugu."""
        message = f"హాయ్! మీ ఈ-కామర్స్ వెబ్‌సైట్ గురించి మా సంభాషణపై ఫాలో-అప్:\n\n"
        if products:
            message += f"• ఉత్పత్తులు: {products}\n"
        if product_count:
            message += f"• ఉత్పత్తి సంఖ్య: {product_count}\n"
        if budget:
            message += f"• బడ్జెట్: {budget}\n"
        if timeline:
            message += f"• టైమ్‌లైన్: {timeline}\n"
        if features:
            message += f"• ఫీచర్‌లు: {', '.join(features)}\n"
        message += "\nమీ సూచన కోసం ఇక్కడ నా వివరాలు ఉన్నాయి:"
        return message
    
    def _generate_mock_id(self) -> str:
        """Generate a mock message ID."""
        import uuid
        return str(uuid.uuid4())[:16].upper()


# Global WhatsApp service instance
whatsapp_service = WhatsAppService()
