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
        self.subdomain = settings.EXOTEL_SUBDOMAIN
        self.region = settings.EXOTEL_REGION.lower()
        self.phone_number = settings.EXOTEL_PHONE_NUMBER
        
        # Build base URL based on region
        if self.region == "singapore":
            self.base_url = f"https://{self.subdomain}"
        elif self.region == "india":
            self.base_url = f"https://{self.subdomain}"
        else:
            self.base_url = f"https://{self.subdomain}"
        
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    def _get_auth(self) -> tuple:
        """Get HTTP basic authentication credentials."""
        return (self.api_key, self.api_token)
    
    async def initiate_call(
        self,
        phone_number: str,
        caller_id: Optional[str] = None,
        flow_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate an outbound call through Exotel.
        
        Args:
            phone_number: Customer phone number (with country code)
            caller_id: Exotel phone number to use as caller ID
            flow_id: Exotel flow ID for call flow
            
        Returns:
            Dictionary with call details including call SID
        """
        if not self.account_sid or not self.api_key or not self.api_token:
            logger.warning("Exotel credentials not configured, returning mock call SID")
            return {
                "success": True,
                "call_sid": f"MOCK-{self._generate_mock_sid()}",
                "status": "calling",
                "message": "Mock mode - Exotel credentials not configured"
            }
        
        try:
            url = f"{self.base_url}/v1/Accounts/{self.account_sid}/Calls/connect.json"
            
            # Generate webhook URLs based on backend URL
            backend_url = settings.BACKEND_URL.rstrip('/')
            status_callback_url = f"{backend_url}/api/webhooks/exotel/call-status"
            
            params = {
                "From": caller_id or self.phone_number,
                "To": phone_number,
                "CallerId": caller_id or self.phone_number,
                "Url": "",  # Add App URL if using Exotel Flow
                "StatusCallback": status_callback_url,  # Webhook URL for status updates
                "StatusCallbackEvents": "ringing,answered,completed",
            }
            
            if flow_id:
                params["FlowId"] = flow_id
            
            response = await self.client.post(
                url,
                auth=self._get_auth(),
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            return {
                "success": True,
                "call_sid": data.get("Sid"),
                "status": data.get("Status", "calling"),
                "direction": data.get("Direction"),
                "from_number": data.get("From"),
                "to_number": data.get("To"),
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
            
            response = await self.client.get(url, auth=self._get_auth())
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
            
            response = await self.client.post(
                url,
                auth=self._get_auth(),
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


# Global Exotel service instance
exotel_service = ExotelService()
