"""
Webhook endpoints for Exotel integration.
Handles call status updates and events.
"""
import logging
from fastapi import APIRouter, Request, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from app.models import get_db
from app.models.call import Call
from app.models.transcript import Transcript
from app.models.action import CallAction as Action
from app.services.exotel import exotel_service
from app.config import settings
import json
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/api/webhooks/exotel/call-status")
async def exotel_call_status(
    request: Request,
    x_exotel_signature: str = Header(None, description="Exotel webhook signature"),
    db: Session = Depends(get_db)
):
    """
    Handle Exotel call status webhook.
    Updates call status based on events from Exotel.
    """
    # Verify webhook signature if configured
    body = await request.body()
    if settings.WEBHOOK_SECRET and x_exotel_signature:
        if not exotel_service.verify_webhook_signature(body, x_exotel_signature, str(request.url)):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = await request.json()
        call_sid = data.get("CallSid")
        status = data.get("Status", "").lower()
        
        if not call_sid:
            raise HTTPException(status_code=400, detail="Missing CallSid")
        
        # Find call by Exotel SID (stored in action metadata or notes)
        # For now, we'll need to map call_sid to our internal call_id
        # This is a simplified implementation
        
        logger.info(f"Received call status webhook: CallSid={call_sid}, Status={status}")
        
        # Process status updates
        status_mapping = {
            "ringing": "ringing",
            "in-progress": "connected",
            "completed": "completed",
            "failed": "failed",
            "busy": "failed",
            "no-answer": "failed"
        }
        
        new_status = status_mapping.get(status, status)
        
        # Log the webhook event
        # In production, you would update the actual call record here
        
        return {"status": "received", "call_sid": call_sid, "mapped_status": new_status}
        
    except Exception as e:
        logger.error(f"Error processing call status webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api/webhooks/exotel/transcript")
async def exotel_transcript(
    request: Request,
    x_exotel_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle Exotel transcript webhook.
    Receives transcribed speech from Exotel.
    """
    body = await request.body()
    if settings.WEBHOOK_SECRET and x_exotel_signature:
        if not exotel_service.verify_webhook_signature(body, x_exotel_signature, str(request.url)):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = await request.json()
        call_sid = data.get("CallSid")
        speaker = data.get("Speaker", "customer")  # 'caller' or 'agent'
        text = data.get("Text", "")
        timestamp = data.get("Timestamp")
        language = data.get("Language", "en")
        
        if not call_sid or not text:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        logger.info(f"Received transcript: CallSid={call_sid}, Speaker={speaker}, Text={text[:50]}...")
        
        # Store transcript
        # In production, you would map call_sid to internal call_id and store
        
        return {"status": "received", "call_sid": call_sid}
        
    except Exception as e:
        logger.error(f"Error processing transcript webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api/webhooks/exotel/events")
async def exotel_events(
    request: Request,
    x_exotel_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle generic Exotel event webhooks.
    """
    body = await request.body()
    if settings.WEBHOOK_SECRET and x_exotel_signature:
        if not exotel_service.verify_webhook_signature(body, x_exotel_signature, str(request.url)):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = await request.json()
        event_type = data.get("EventType")
        call_sid = data.get("CallSid")
        
        logger.info(f"Received Exotel event: {event_type} for call {call_sid}")
        
        return {"status": "received", "event_type": event_type}
        
    except Exception as e:
        logger.error(f"Error processing event webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/api/webhooks/twilio/whatsapp")
async def twilio_whatsapp_status(
    request: Request,
    x_twilio_signature: str = Header(None, description="Twilio webhook signature"),
    db: Session = Depends(get_db)
):
    """
    Handle Twilio WhatsApp status webhook.
    Receives delivery status updates for WhatsApp messages sent via Twilio.
    """
    # Verify webhook signature if configured
    body = await request.body()
    if settings.WEBHOOK_SECRET and x_twilio_signature:
        # Twilio signature verification would go here
        # For now, we'll log and proceed
        logger.info("Twilio webhook signature present (verification not implemented)")
    
    try:
        data = await request.json()
        message_sid = data.get("MessageSid")
        message_status = data.get("MessageStatus", "").lower()
        
        if not message_sid:
            logger.warning("Received Twilio webhook without MessageSid")
            return {"status": "received", "warning": "No MessageSid"}
        
        logger.info(f"Received Twilio WhatsApp status: SID={message_sid}, Status={message_status}")
        
        # Update action record with delivery status if we can find it
        # This would require mapping message_sid to our action records
        # For now, we'll just log the status
        
        status_mapping = {
            "queued": "queued",
            "sent": "sent",
            "delivered": "delivered",
            "undelivered": "failed",
            "failed": "failed",
            "read": "read"
        }
        
        mapped_status = status_mapping.get(message_status, message_status)
        
        return {
            "status": "received",
            "message_sid": message_sid,
            "mapped_status": mapped_status
        }
        
    except Exception as e:
        logger.error(f"Error processing Twilio WhatsApp webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
