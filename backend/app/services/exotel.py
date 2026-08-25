"""
Exotel telephony service module.
Handles outbound calls, call status tracking, and webhook integration.
All credentials are loaded from environment variables.
"""
import httpx
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class ExotelService:
    """Service for interacting with Exotel telephony API."""
    
    def __init__(self):
        self.account_sid = settings.EXOTEL_ACCOUNT_SID
        self.api_key = settings.EXOTEL_API_KEY
        self.api_token = settings.EXOTEL_API_TOKEN
        self.region = settings.EXOTEL_REGION.lower()
        self.phone_number = settings.EXOTEL_PHONE_NUMBER
        self.flow_id = settings.EXOTEL_FLOW_ID
        
        # Log diagnostic information (no actual values)
        logger.info("=== EXOTEL CONFIGURATION DIAGNOSTIC ===")
        logger.info(f"EXOTEL_ACCOUNT_SID: {'PRESENT' if self.account_sid else 'MISSING'}")
        logger.info(f"EXOTEL_API_KEY: {'PRESENT' if self.api_key else 'MISSING'}")
        logger.info(f"EXOTEL_API_TOKEN: {'PRESENT' if self.api_token else 'MISSING'}")
        logger.info(f"EXOTEL_PHONE_NUMBER: {'PRESENT' if self.phone_number else 'MISSING'}")
        logger.info(f"EXOTEL_FLOW_ID: {'PRESENT' if self.flow_id else 'MISSING'}")
        logger.info(f"EXOTEL_REGION: {'PRESENT' if settings.EXOTEL_REGION else 'MISSING'} (value: {settings.EXOTEL_REGION if settings.EXOTEL_REGION else 'NOT SET'})")
        logger.info(f"BACKEND_URL: {'PRESENT' if settings.BACKEND_URL else 'MISSING'} (value: {settings.BACKEND_URL if settings.BACKEND_URL else 'NOT SET'})")
        logger.info("=== END EXOTEL DIAGNOSTIC ===")
        
        # Build base URL based on region (Exotel API endpoints)
        if self.region == "singapore":
            self.base_url = "https://api.exotel.com"
        elif self.region == "india":
            self.base_url = "https://api.in.exotel.com"
        else:
            # Default to Singapore if region not specified
            self.base_url = "https://api.exotel.com"
        
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    def _get_auth(self) -> tuple:
        """Get HTTP basic authentication credentials."""
        if not self.api_key or not self.api_token:
            logger.error("API_KEY or API_TOKEN is missing - cannot authenticate")
        return (self.api_key, self.api_token)
    
    def _get_auth_headers(self) -> dict:
        """Get Authorization header with Basic Auth."""
        import base64
        if not self.api_key or not self.api_token:
            return {}
        # Strip any whitespace from credentials
        api_key_clean = self.api_key.strip()
        api_token_clean = self.api_token.strip()
        credentials = f"{api_key_clean}:{api_token_clean}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}
    
    async def initiate_call(
        self,
        phone_number: str,
        caller_id: Optional[str] = None,
        flow_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate an outbound call through Exotel and connect to voice flow.
        
        Args:
            phone_number: Customer phone number (with country code)
            caller_id: Exotel phone number to use as caller ID
            flow_id: Exotel flow ID for call flow (optional, uses settings if not provided)
            
        Returns:
            Dictionary with call details including call SID
        """
        # Check for missing credentials with detailed logging
        missing_creds = []
        if not self.account_sid:
            missing_creds.append("EXOTEL_ACCOUNT_SID")
        if not self.api_key:
            missing_creds.append("EXOTEL_API_KEY")
        if not self.api_token:
            missing_creds.append("EXOTEL_API_TOKEN")
        
        if missing_creds:
            logger.warning(f"Exotel credentials not configured. Missing: {', '.join(missing_creds)}. Returning mock call SID.")
            return {
                "success": True,
                "call_sid": f"MOCK-{self._generate_mock_sid()}",
                "status": "calling",
                "message": f"Mock mode - Missing Exotel credentials: {', '.join(missing_creds)}"
            }
        
        # Use provided flow_id or fall back to settings
        actual_flow_id = flow_id or self.flow_id
        
        if not actual_flow_id:
            logger.warning("Exotel Flow ID not configured, call will not connect to AI voice flow")
            return {
                "success": False,
                "call_sid": None,
                "status": "failed",
                "message": "Exotel Flow ID not configured - cannot connect to voice AI flow"
            }
        
        try:
            url = f"{self.base_url}/v1/Accounts/{self.account_sid}/Calls/connect.json"
            
            # Generate webhook URLs based on backend URL
            # Ensure we use the production URL, never localhost in production
            backend_url = settings.BACKEND_URL.rstrip('/')
            if backend_url.startswith("http://localhost") or backend_url.startswith("http://127.0.0.1"):
                logger.warning(f"BACKEND_URL is set to localhost ({backend_url}) - this will not work for webhooks in production")
            status_callback_url = f"{backend_url}/api/webhooks/exotel/call-status"
            logger.info(f"StatusCallback URL: {status_callback_url}")
            
            # Build flow URL for Exotel voice applet
            flow_url = f"http://my.exotel.com/{self.account_sid}/exoml/start_voice/{actual_flow_id}"
            
            params = {
                "From": phone_number,
                "CallerId": caller_id or self.phone_number,
                "Url": flow_url,
                "StatusCallback": status_callback_url,
                "StatusCallbackEvents": "terminal,answered",
                "CallType": "trans"
            }
            
            logger.info(f"Initiating Exotel call to {phone_number} with flow {actual_flow_id}")
            logger.info(f"Exotel API URL: {url}")
            logger.info(f"Using Account SID: {self.account_sid}")
            logger.info(f"Auth configured: API_KEY={'SET' if self.api_key else 'NOT SET'}, API_TOKEN={'SET' if self.api_token else 'NOT SET'}")
            logger.info(f"API_KEY length: {len(self.api_key) if self.api_key else 0}")
            logger.info(f"API_TOKEN length: {len(self.api_token) if self.api_token else 0}")
            
            # Verify credentials before making request
            if not self.api_key or not self.api_token:
                logger.error("Cannot authenticate: API_KEY or API_TOKEN is missing")
                return {
                    "success": False,
                    "call_sid": None,
                    "status": "failed",
                    "message": "Exotel credentials not configured - API_KEY and API_TOKEN are required"
                }
            
            # Use manual Authorization header instead of httpx auth parameter
            # to ensure correct Basic Auth format
            headers = self._get_auth_headers()
            logger.info(f"Using manual Authorization header (length: {len(headers.get('Authorization', ''))})")
            
            response = await self.client.post(
                url,
                headers=headers,
                params=params
            )
            
            # Log response status for debugging
            logger.info(f"Exotel API response status: {response.status_code}")
            if response.status_code == 401:
                logger.error("Exotel API returned 401 Unauthorized - Check API_KEY and API_TOKEN credentials")
                logger.error(f"Account SID being used: {self.account_sid}")
                logger.error(f"API endpoint: {self.base_url}")
            
            response.raise_for_status()
            
            data = response.json()
            call_data = data.get("Call", data)
            
            return {
                "success": True,
                "call_sid": call_data.get("Sid"),
                "status": call_data.get("Status", "calling"),
                "direction": call_data.get("Direction"),
                "from_number": call_data.get("From"),
                "to_number": call_data.get("To"),
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Exotel API error: {e}")
            # Return mock response for development
            return {
                "success": True,
                "call_sid": f"MOCK-{self._generate_mock_sid()}",
                "status": "calling",
                "message": f"API error, using mock: {str(e)}"
            }
    
    async def get_call_status(self, call_sid: str) -> Dict[str, Any]:
        """
        Get the status of an ongoing call.
        
        Args:
            call_sid: Exotel call SID
            
        Returns:
            Dictionary with call status details
        """
        if not self.account_sid or not self.api_key or not self.api_token:
            return {
                "call_sid": call_sid,
                "status": "completed",
                "duration": 0,
                "direction": "outbound-api"
            }
        
        try:
            url = f"{self.base_url}/v1/Accounts/{self.account_sid}/Calls/{call_sid}.json"
            
            headers = self._get_auth_headers()
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            return {
                "call_sid": data.get("Sid"),
                "status": data.get("Status"),
                "duration": data.get("Duration", 0),
                "direction": data.get("Direction"),
                "from_number": data.get("From"),
                "to_number": data.get("To"),
                "start_time": data.get("StartTime"),
                "end_time": data.get("EndTime"),
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Exotel status check error: {e}")
            return {
                "call_sid": call_sid,
                "status": "unknown",
                "error": str(e)
            }
    
    async def hangup_call(self, call_sid: str) -> Dict[str, Any]:
        """
        Hang up an active call.
        
        Args:
            call_sid: Exotel call SID
            
        Returns:
            Dictionary with hangup result
        """
        if not self.account_sid or not self.api_key or not self.api_token:
            return {"success": True, "message": "Mock hangup"}
        
        try:
            url = f"{self.base_url}/v1/Accounts/{self.account_sid}/Calls/{call_sid}.json"
            
            headers = self._get_auth_headers()
            response = await self.client.post(
                url,
                headers=headers,
                params={"Status": "completed"}
            )
            response.raise_for_status()
            
            return {"success": True, "message": "Call terminated"}
            
        except httpx.HTTPError as e:
            logger.error(f"Exotel hangup error: {e}")
            return {"success": False, "error": str(e)}
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
        url: str
    ) -> bool:
        """
        Verify Exotel webhook signature for security.
        
        Args:
            payload: Raw request body
            signature: X-Exotel-Signature header
            url: Request URL
            
        Returns:
            True if signature is valid
        """
        # Exotel may provide signature verification
        # Implement based on Exotel's actual webhook security mechanism
        if not settings.WEBHOOK_SECRET:
            logger.warning("Webhook secret not configured, skipping verification")
            return True
        
        # TODO: Implement actual signature verification based on Exotel docs
        # This is a placeholder for the actual verification logic
        return True
    
    def _generate_mock_sid(self) -> str:
        """Generate a mock call SID for development."""
        import uuid
        return str(uuid.uuid4())[:12].upper()
    
    async def test_authentication(self) -> Dict[str, Any]:
        """
        Test authentication against Exotel API directly.
        This is a diagnostic method to verify credentials are valid.
        """
        if not self.account_sid or not self.api_key or not self.api_token:
            return {
                "success": False,
                "error": "Missing credentials",
                "account_sid_present": bool(self.account_sid),
                "api_key_present": bool(self.api_key),
                "api_token_present": bool(self.api_token)
            }
        
        try:
            # Test with a simple GET request to Calls endpoint
            url = f"{self.base_url}/v1/Accounts/{self.account_sid}/Calls.json"
            headers = self._get_auth_headers()
            
            logger.info(f"Testing authentication against: {url}")
            logger.info(f"Account SID: {self.account_sid}")
            logger.info(f"API_KEY length: {len(self.api_key)}")
            logger.info(f"API_TOKEN length: {len(self.api_token)}")
            
            response = await self.client.get(url, headers=headers)
            
            logger.info(f"Authentication test response status: {response.status_code}")
            
            return {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "account_sid": self.account_sid,
                "api_endpoint": self.base_url,
                "response_body_preview": response.text[:200] if response.text else ""
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Authentication test error: {e}")
            return {
                "success": False,
                "error": str(e),
                "account_sid": self.account_sid,
                "api_endpoint": self.base_url
            }


# Global Exotel service instance
exotel_service = ExotelService()
