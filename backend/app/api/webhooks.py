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
        call_sid = data.get("CallSid") or data.get("Sid")
        status = data.get("Status", "").lower()
        
        if not call_sid:
            raise HTTPException(status_code=400, detail="Missing CallSid")
        
        logger.info(f"Received call status webhook: CallSid={call_sid}, Status={status}")
        
        # Process status updates
        status_mapping = {
            "ringing": "ringing",
            "in-progress": "connected",
            "completed": "completed",
            "failed": "failed",
            "busy": "failed",
            "no-answer": "failed",
            "canceled": "failed"
        }
        
        new_status = status_mapping.get(status, status)
        
        # Find the call by searching action metadata for the call_sid
        from app.models.action import CallAction as Action
        action = db.query(Action).filter(
            Action.payload_snippet.like(f"%{call_sid}%")
        ).order_by(Action.timestamp.desc()).first()
        
        if action:
            call_id = action.call_id
            call = db.query(Call).filter(Call.id == call_id).first()
            
            if call:
                # Update call status
                old_status = call.status
                call.status = new_status
                
                # Update end time and duration if call is completed
                if new_status in ["completed", "failed"]:
                    call.ended_at = datetime.utcnow()
                    if call.started_at:
                        call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())
                
                db.commit()
                
                # Log the status update
                status_action = Action(
                    id=f"act_{uuid.uuid4().hex[:12]}",
                    call_id=call_id,
                    action_type="status_update",
                    status="completed",
                    timestamp=datetime.utcnow(),
                    title=f"Call Status: {status}",
                    description=f"Status changed from {old_status} to {new_status}",
                    payload_snippet=json.dumps({
                        "call_sid": call_sid,
                        "old_status": old_status,
                        "new_status": new_status,
                        "raw_status": status
                    })
                )
                db.add(status_action)
                db.commit()
                
                logger.info(f"Updated call {call_id} status to {new_status}")
            else:
                logger.warning(f"Call {call_id} not found for call_sid {call_sid}")
        else:
            logger.warning(f"No action found with call_sid {call_sid}")
        
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
