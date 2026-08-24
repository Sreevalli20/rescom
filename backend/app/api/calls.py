"""
Call management API endpoints.
"""
import json
import logging
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models import get_db

logger = logging.getLogger(__name__)
from app.models.call import Call
from app.models.transcript import Transcript
from app.models.qualification import Qualification
from app.models.action import CallAction as Action
from app.models.callback import Callback
from app.models.summary import CallSummary as Summary
from app.schemas.call import (
    StartCallPayload,
    StartCallResponse,
    CallRecord,
    QualificationData,
    TranscriptMessage,
    CallAction,
    CallbackData,
    CallSummary,
    CallbackRequest,
    EndCallResponse,
    HealthResponse
)
from app.services.exotel import exotel_service
from app.services.whatsapp import whatsapp_service
from app.services.qualification import qualification_service
from app.services.callback import callback_parser
from app.services.voice_agent import voice_agent_service
from app.config import settings
from app.utils.validation import validate_phone_number

router = APIRouter()


@router.post("/api/calls/start", response_model=StartCallResponse)
async def start_call(
    payload: StartCallPayload,
    db: Session = Depends(get_db)
):
    """
    Start a new outbound call.
    
    Accepts customer phone number and initiates call through Exotel.
    Returns call ID for tracking.
    """
    # Validate phone number
    is_valid, normalized_phone, error = validate_phone_number(payload.phoneNumber)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid phone number: {error}")
    
    # Generate call ID
    call_id = f"call_{uuid.uuid4().hex[:12]}"
    
    # Initiate call via Exotel
    exotel_result = await exotel_service.initiate_call(
        phone_number=normalized_phone,
        caller_id=None
    )
    
    # Create call record
    call = Call(
        id=call_id,
        phone_number=normalized_phone,
        customer_name=payload.customerName,
        status=exotel_result.get("status", "calling"),
        language=payload.preferredLanguage or "en",
        started_at=datetime.utcnow()
    )
    db.add(call)
    
    # Create qualification record
    qualification = Qualification(
        id=f"qual_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        lead_status="UNASSIGNED"
    )
    db.add(qualification)
    
    # Create callback record
    callback = Callback(
        id=f"cb_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        status="none"
    )
    db.add(callback)
    
    # Log action
    action = Action(
        id=f"act_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        action_type="outbound_initiated",
        status="completed",
        timestamp=datetime.utcnow(),
        title="Exotel Call Initiated",
        description=f"Call initiated to {payload.phoneNumber}",
        payload_snippet=json.dumps({"phone": payload.phoneNumber})
    )
    db.add(action)
    
    db.commit()
    db.refresh(call)
    
    return StartCallResponse(
        success=True,
        callId=call_id,
        status=call.status,
        message="Call initiated successfully"
    )


@router.get("/api/calls/{call_id}", response_model=CallRecord)
async def get_call(call_id: str, db: Session = Depends(get_db)):
    """Get full call status and details."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Get related records
    transcripts = db.query(Transcript).filter(Transcript.call_id == call_id).all()
    qualification = db.query(Qualification).filter(Qualification.call_id == call_id).first()
    actions = db.query(Action).filter(Action.call_id == call_id).order_by(Action.timestamp).all()
    callback = db.query(Callback).filter(Callback.call_id == call_id).first()
    summary = db.query(Summary).filter(Summary.call_id == call_id).first()
    
    # Convert to response format
    return CallRecord(
        id=call.id,
        phoneNumber=call.phone_number,
        customerName=call.customer_name,
        status=call.status,
        startedAt=call.started_at.isoformat() if call.started_at else "",
        endedAt=call.ended_at.isoformat() if call.ended_at else None,
        durationSeconds=call.duration_seconds,
        language=call.language,
        qualification=_convert_qualification(qualification),
        callback=_convert_callback(callback),
        actions=[_convert_action(a) for a in actions],
        summary=_convert_summary(summary),
        transcript=[_convert_transcript(t) for t in transcripts],
        currentAiGoal=call.current_ai_goal,
        failureReason=call.failure_reason
    )


@router.get("/api/calls/{call_id}/transcript", response_model=List[TranscriptMessage])
async def get_transcript(call_id: str, db: Session = Depends(get_db)):
    """Get live transcript for a call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    transcripts = db.query(Transcript).filter(Transcript.call_id == call_id).order_by(Transcript.timestamp).all()
    return [_convert_transcript(t) for t in transcripts]


@router.get("/api/calls/{call_id}/qualification", response_model=QualificationData)
async def get_qualification(call_id: str, db: Session = Depends(get_db)):
    """Get real-time lead qualification data."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    qualification = db.query(Qualification).filter(Qualification.call_id == call_id).first()
    if not qualification:
        return QualificationData()
    
    return _convert_qualification(qualification)


@router.post("/api/calls/{call_id}/qualification")
async def update_qualification(call_id: str, db: Session = Depends(get_db)):
    """
    Update qualification data during a call and trigger WhatsApp if HOT lead.
    This endpoint is called by the voice agent when qualification changes.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    qualification = db.query(Qualification).filter(Qualification.call_id == call_id).first()
    if not qualification:
        qualification = Qualification(
            id=f"qual_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            lead_status="UNASSIGNED"
        )
        db.add(qualification)
    
    # Get transcripts to extract qualification
    transcripts = db.query(Transcript).filter(Transcript.call_id == call_id).all()
    transcript_data = [{"speaker": t.speaker, "text": t.text} for t in transcripts]
    
    # Extract qualification using the service
    qual_result = qualification_service.extract_qualification(transcript_data, call.language)
    
    # Update qualification record
    qualification.lead_status = qual_result.get("lead_status", "UNASSIGNED")
    qualification.budget = qual_result.get("budget", "")
    qualification.products = qual_result.get("products", "")
    qualification.product_count = qual_result.get("product_count", "")
    qualification.timeline = qual_result.get("timeline", "")
    qualification.features = json.dumps(qual_result.get("features", []))
    qualification.buying_intent = qual_result.get("buying_intent", "Unknown")
    qualification.barrier = qual_result.get("barrier", "")
    qualification.decision_maker = qual_result.get("decision_maker", "Unknown")
    qualification.lead_score = qual_result.get("lead_score", 0)
    qualification.confidence_score = qual_result.get("confidence_score", 0)
    qualification.last_updated = datetime.utcnow()
    
    db.commit()
    
    # Trigger WhatsApp for HOT leads (async, non-blocking)
    if qualification.lead_status == "HOT":
        await _trigger_hot_lead_whatsapp(call_id, call, qualification, db)
    elif qualification.lead_status == "WARM":
        await _trigger_warm_lead_whatsapp(call_id, call, qualification, db)
    
    return _convert_qualification(qualification)


async def _trigger_hot_lead_whatsapp(call_id: str, call: Call, qualification: Qualification, db: Session):
    """
    Send WhatsApp message for HOT lead asynchronously.
    Does not block the voice conversation.
    """
    try:
        # Build qualification dict for WhatsApp service
        qual_dict = {
            "budget": qualification.budget,
            "products": qualification.products,
            "product_count": qualification.product_count,
            "timeline": qualification.timeline,
            "features": json.loads(qualification.features) if qualification.features else [],
            "barrier": qualification.barrier
        }
        
        # Send WhatsApp message asynchronously
        result = await whatsapp_service.send_contextual_hot_lead_message(
            to_phone=call.phone_number,
            qualification=qual_dict,
            language=call.language
        )
        
        # Log the action
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            action_type="whatsapp_sent",
            status="completed" if result.get("success") else "failed",
            timestamp=datetime.utcnow(),
            title="WhatsApp Message Sent (HOT Lead)",
            description=f"WhatsApp message sent to {call.phone_number}",
            payload_snippet=json.dumps({
                "message_id": result.get("message_id"),
                "provider": result.get("provider"),
                "success": result.get("success")
            })
        )
        db.add(action)
        db.commit()
        
        logger.info(f"HOT lead WhatsApp triggered for call {call_id}: {result}")
        
    except Exception as e:
        logger.error(f"Error sending HOT lead WhatsApp for call {call_id}: {e}")
        # Log failure but don't crash
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            action_type="whatsapp_failed",
            status="failed",
            timestamp=datetime.utcnow(),
            title="WhatsApp Message Failed",
            description=f"Failed to send WhatsApp: {str(e)}",
            payload_snippet=json.dumps({"error": str(e)})
        )
        db.add(action)
        db.commit()


async def _trigger_warm_lead_whatsapp(call_id: str, call: Call, qualification: Qualification, db: Session):
    """
    Send WhatsApp message for WARM lead asynchronously.
    """
    try:
        qual_dict = {
            "budget": qualification.budget,
            "products": qualification.products,
            "product_count": qualification.product_count,
            "timeline": qualification.timeline,
            "features": json.loads(qualification.features) if qualification.features else [],
            "barrier": qualification.barrier
        }
        
        result = await whatsapp_service.send_contextual_warm_lead_message(
            to_phone=call.phone_number,
            qualification=qual_dict,
            language=call.language
        )
        
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            action_type="whatsapp_sent",
            status="completed" if result.get("success") else "failed",
            timestamp=datetime.utcnow(),
            title="WhatsApp Message Sent (WARM Lead)",
            description=f"WhatsApp message sent to {call.phone_number}",
            payload_snippet=json.dumps({
                "message_id": result.get("message_id"),
                "provider": result.get("provider"),
                "success": result.get("success")
            })
        )
        db.add(action)
        db.commit()
        
        logger.info(f"WARM lead WhatsApp triggered for call {call_id}: {result}")
        
    except Exception as e:
        logger.error(f"Error sending WARM lead WhatsApp for call {call_id}: {e}")
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=call_id,
            action_type="whatsapp_failed",
            status="failed",
            timestamp=datetime.utcnow(),
            title="WhatsApp Message Failed",
            description=f"Failed to send WhatsApp: {str(e)}",
            payload_snippet=json.dumps({"error": str(e)})
        )
        db.add(action)
        db.commit()


@router.get("/api/calls/{call_id}/actions", response_model=List[CallAction])
async def get_actions(call_id: str, db: Session = Depends(get_db)):
    """Get backend actions executed during the call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    actions = db.query(Action).filter(Action.call_id == call_id).order_by(Action.timestamp).all()
    return [_convert_action(a) for a in actions]


@router.get("/api/calls/{call_id}/summary", response_model=CallSummary)
async def get_summary(call_id: str, db: Session = Depends(get_db)):
    """Get post-call AI synthesized summary."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    summary = db.query(Summary).filter(Summary.call_id == call_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not yet generated")
    
    return _convert_summary(summary)


@router.get("/api/calls", response_model=List[CallRecord])
async def get_calls(
    leadStatus: Optional[str] = Query(None, description="Filter by lead status"),
    search: Optional[str] = Query(None, description="Search by phone number or name"),
    db: Session = Depends(get_db)
):
    """Get call history list with optional filters."""
    query = db.query(Call)
    
    # Join with qualification for lead status filter
    if leadStatus and leadStatus != "ALL":
        query = query.join(Qualification).filter(Qualification.lead_status == leadStatus)
    
    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Call.phone_number.like(search_pattern)) |
            (Call.customer_name.like(search_pattern))
        )
    
    calls = query.order_by(Call.started_at.desc()).limit(50).all()
    
    results = []
    for call in calls:
        transcripts = db.query(Transcript).filter(Transcript.call_id == call.id).all()
        qualification = db.query(Qualification).filter(Qualification.call_id == call.id).first()
        actions = db.query(Action).filter(Action.call_id == call.id).all()
        callback = db.query(Callback).filter(Callback.call_id == call.id).first()
        summary = db.query(Summary).filter(Summary.call_id == call.id).first()
        
        results.append(CallRecord(
            id=call.id,
            phoneNumber=call.phone_number,
            customerName=call.customer_name,
            status=call.status,
            startedAt=call.started_at.isoformat() if call.started_at else "",
            endedAt=call.ended_at.isoformat() if call.ended_at else None,
            durationSeconds=call.duration_seconds,
            language=call.language,
            qualification=_convert_qualification(qualification),
            callback=_convert_callback(callback),
            actions=[_convert_action(a) for a in actions],
            summary=_convert_summary(summary),
            transcript=[_convert_transcript(t) for t in transcripts],
            currentAiGoal=call.current_ai_goal,
            failureReason=call.failure_reason
        ))
    
    return results


@router.post("/api/calls/{call_id}/callback", response_model=CallbackData)
async def schedule_callback(
    call_id: str,
    callback_request: CallbackRequest,
    db: Session = Depends(get_db)
):
    """Schedule or update a callback."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    callback = db.query(Callback).filter(Callback.call_id == call_id).first()
    if not callback:
        callback = Callback(
            id=f"cb_{uuid.uuid4().hex[:12]}",
            call_id=call_id
        )
        db.add(callback)
    
    # Parse natural language if provided
    if callback_request.requestedTime:
        parsed = callback_parser.parse_callback_request(
            callback_request.requestedTime,
            language=call.language
        )
        callback.original_text = callback_request.requestedTime
        callback.parsed_date_time = parsed.get("formatted_display")
        if parsed.get("parsed_datetime"):
            callback.scheduled_iso = datetime.fromisoformat(parsed["parsed_datetime"])
    
    # Update with explicit data if provided
    if callback_request.parsedDateTime:
        callback.parsed_date_time = callback_request.parsedDateTime
    if callback_request.notes:
        callback.notes = callback_request.notes
    
    callback.requested = "true"
    callback.status = "scheduled"
    
    # Log action
    action = Action(
        id=f"act_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        action_type="callback_scheduled",
        status="completed",
        timestamp=datetime.utcnow(),
        title="Callback Scheduled",
        description=f"Callback scheduled for {callback.parsed_date_time}",
        payload_snippet=json.dumps({"scheduled": callback.parsed_date_time})
    )
    db.add(action)
    
    db.commit()
    db.refresh(callback)
    
    return _convert_callback(callback)


@router.post("/api/calls/{call_id}/end", response_model=EndCallResponse)
async def end_call(call_id: str, db: Session = Depends(get_db)):
    """End an active call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Update call status
    call.status = "completed"
    call.ended_at = datetime.utcnow()
    if call.started_at:
        call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())
    
    # Generate summary
    await _generate_call_summary(call_id, db)
    
    # Log action
    action = Action(
        id=f"act_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        action_type="followup_prepared",
        status="completed",
        timestamp=datetime.utcnow(),
        title="Post-Call Summary Generated",
        description="AI summary and CRM data generated"
    )
    db.add(action)
    
    db.commit()
    
    return EndCallResponse(success=True, message="Call ended successfully")


@router.get("/api/callbacks/due")
async def get_due_callbacks(db: Session = Depends(get_db)):
    """
    Get all callbacks that are due for execution.
    This endpoint is intended for use by a scheduler/cron worker.
    """
    from datetime import datetime
    
    now = datetime.utcnow()
    
    # Find callbacks that are scheduled and due
    callbacks = db.query(Callback).filter(
        Callback.status == "scheduled",
        Callback.scheduled_iso <= now
    ).all()
    
    results = []
    for callback in callbacks:
        call = db.query(Call).filter(Call.id == callback.call_id).first()
        if call:
            results.append({
                "callback_id": callback.id,
                "call_id": callback.call_id,
                "phone_number": call.phone_number,
                "customer_name": call.customer_name,
                "scheduled_time": callback.scheduled_iso.isoformat() if callback.scheduled_iso else None,
                "original_text": callback.original_text,
                "notes": callback.notes
            })
    
    return {"due_callbacks": results, "count": len(results)}


@router.post("/api/callbacks/{callback_id}/execute")
async def execute_callback(callback_id: str, db: Session = Depends(get_db)):
    """
    Execute a scheduled callback by initiating a new call.
    This endpoint is intended for use by a scheduler/cron worker.
    """
    callback = db.query(Callback).filter(Callback.id == callback_id).first()
    if not callback:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    if callback.status != "scheduled":
        raise HTTPException(status_code=400, detail=f"Callback is not scheduled (current status: {callback.status})")
    
    # Get the original call
    call = db.query(Call).filter(Call.id == callback.call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Original call not found")
    
    try:
        # Initiate new call via Exotel
        exotel_result = await exotel_service.initiate_call(
            phone_number=call.phone_number,
            caller_id=None
        )
        
        # Create new call record for the callback
        new_call_id = f"call_{uuid.uuid4().hex[:12]}"
        new_call = Call(
            id=new_call_id,
            phone_number=call.phone_number,
            customer_name=call.customer_name,
            status=exotel_result.get("status", "calling"),
            language=call.language,
            started_at=datetime.utcnow(),
            current_ai_goal="follow_up_callback"
        )
        db.add(new_call)
        
        # Update callback status
        callback.status = "completed"
        callback.completed_at = datetime.utcnow()
        
        # Create qualification record for new call
        qualification = Qualification(
            id=f"qual_{uuid.uuid4().hex[:12]}",
            call_id=new_call_id,
            lead_status="UNASSIGNED"
        )
        db.add(qualification)
        
        # Create new callback record for the new call
        new_callback = Callback(
            id=f"cb_{uuid.uuid4().hex[:12]}",
            call_id=new_call_id,
            status="none"
        )
        db.add(new_callback)
        
        # Log action on original call
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=callback.call_id,
            action_type="callback_executed",
            status="completed",
            timestamp=datetime.utcnow(),
            title="Callback Executed",
            description=f"Callback executed, new call initiated: {new_call_id}",
            payload_snippet=json.dumps({"new_call_id": new_call_id})
        )
        db.add(action)
        
        # Log action on new call
        new_action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            call_id=new_call_id,
            action_type="callback_initiated",
            status="completed",
            timestamp=datetime.utcnow(),
            title="Callback Call Initiated",
            description=f"This call was initiated as a callback for {callback.call_id}",
            payload_snippet=json.dumps({"original_call_id": callback.call_id})
        )
        db.add(new_action)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Callback executed successfully",
            "new_call_id": new_call_id,
            "original_call_id": callback.call_id
        }
        
    except Exception as e:
        logger.error(f"Error executing callback {callback_id}: {e}")
        callback.status = "failed"
        callback.notes = f"Execution failed: {str(e)}"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to execute callback: {str(e)}")


# Helper functions for model conversion
def _convert_qualification(q: Qualification) -> QualificationData:
    """Convert qualification model to schema."""
    if not q:
        return QualificationData()
    
    return QualificationData(
        leadStatus=q.lead_status,
        budget=q.budget or "",
        products=q.products or "",
        productCount=q.product_count or "",
        timeline=q.timeline or "",
        features=json.loads(q.features) if q.features else [],
        buyingIntent=q.buying_intent,
        barrier=q.barrier or "",
        decisionMaker=q.decision_maker,
        leadScore=q.lead_score,
        confidenceScore=q.confidence_score,
        lastUpdated=q.last_updated.isoformat() if q.last_updated else None
    )


def _convert_callback(cb: Callback) -> CallbackData:
    """Convert callback model to schema."""
    if not cb:
        return CallbackData()
    
    return CallbackData(
        requested=cb.requested == "true",
        originalText=cb.original_text,
        requestedTime=cb.requested_time,
        parsedDateTime=cb.parsed_date_time,
        status=cb.status,
        scheduledIso=cb.scheduled_iso.isoformat() if cb.scheduled_iso else None,
        assignedAgent=cb.assigned_agent,
        notes=cb.notes
    )


def _convert_action(a: Action) -> CallAction:
    """Convert action model to schema."""
    return CallAction(
        id=a.id,
        type=a.action_type,
        status=a.status,
        timestamp=a.timestamp.isoformat() if a.timestamp else "",
        title=a.title,
        description=a.description or "",
        payloadSnippet=a.payload_snippet,
        metadata=json.loads(a.metadata_json) if a.metadata_json else None
    )


def _convert_transcript(t: Transcript) -> TranscriptMessage:
    """Convert transcript model to schema."""
    return TranscriptMessage(
        id=t.id,
        speaker=t.speaker,
        text=t.text,
        timestamp=t.timestamp.isoformat() if t.timestamp else "",
        language=t.language,
        translation=t.translation,
        audioDurationMs=t.audio_duration_ms,
        highlightedKeywords=json.loads(t.highlighted_keywords) if t.highlighted_keywords else None
    )


def _convert_summary(s: Summary) -> Optional[CallSummary]:
    """Convert summary model to schema."""
    if not s:
        return None
    
    return CallSummary(
        id=s.id,
        callId=s.call_id,
        customerName=s.customer_name,
        phoneNumber=s.phone_number,
        language=s.language,
        leadStatus=s.lead_status,
        whatTheyWant=s.what_they_want or "",
        budget=s.budget or "",
        products=s.products or "",
        productCount=s.product_count or "",
        timeline=s.timeline or "",
        features=json.loads(s.features) if s.features else [],
        customerConcerns=s.customer_concerns or "",
        nextAction=s.next_action or "",
        importantStatements=json.loads(s.important_statements) if s.important_statements else [],
        generatedAt=s.generated_at.isoformat() if s.generated_at else "",
        recommendedPackage=s.recommended_package,
        estimatedDealValue=s.estimated_deal_value
    )


async def _generate_call_summary(call_id: str, db: Session):
    """Generate AI summary for completed call."""
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        return
    
    transcripts = db.query(Transcript).filter(Transcript.call_id == call_id).all()
    qualification = db.query(Qualification).filter(Qualification.call_id == call_id).first()
    callback = db.query(Callback).filter(Callback.call_id == call_id).first()
    
    # Extract customer messages
    customer_messages = [t.text for t in transcripts if t.speaker == "customer"]
    customer_text = " ".join(customer_messages)
    
    # Generate summary based on qualification
    features_list = json.loads(qualification.features) if qualification and qualification.features else []
    summary = Summary(
        id=f"sum_{uuid.uuid4().hex[:12]}",
        call_id=call_id,
        customer_name=call.customer_name,
        phone_number=call.phone_number,
        language=call.language,
        lead_status=qualification.lead_status if qualification else "UNASSIGNED",
        what_they_want=_extract_what_they_want(customer_text),
        budget=qualification.budget if qualification else "",
        products=qualification.products if qualification else "",
        product_count=qualification.product_count if qualification else "",
        timeline=qualification.timeline if qualification else "",
        features=json.dumps(features_list),  # Serialize list to JSON string for storage
        customer_concerns=qualification.barrier if qualification else "",
        important_statements=json.dumps(_extract_important_statements(customer_messages)),
        next_action=_determine_next_action(qualification, callback),
        recommended_package=_recommend_package(qualification),
        estimated_deal_value=qualification.budget if qualification else "",
        generated_at=datetime.utcnow()
    )
    
    db.add(summary)
    db.commit()


def _extract_what_they_want(text: str) -> str:
    """Extract what the customer wants from their messages."""
    if "website" in text.lower():
        return "E-commerce website for online sales"
    elif "app" in text.lower():
        return "Mobile application"
    else:
        return "Digital solution for business"


def _extract_important_statements(messages: List[str]) -> List[str]:
    """Extract important statements from customer messages."""
    # Return key quotes from the conversation
    return messages[:3] if messages else []


def _determine_next_action(qualification: Qualification, callback: Callback) -> str:
    """Determine the recommended next action."""
    if callback and callback.status == "scheduled":
        return f"Follow-up call scheduled for {callback.parsed_date_time}"
    elif qualification and qualification.lead_status == "HOT":
        return "Immediate follow-up with quotation and demo"
    elif qualification and qualification.lead_status == "WARM":
        return "Send information and schedule follow-up"
    else:
        return "Add to nurture campaign"


def _recommend_package(qualification: Qualification) -> Optional[str]:
    """Recommend a package based on qualification."""
    if not qualification:
        return None
    
    budget = qualification.budget or ""
    if "35000" in budget or "30000" in budget:
        return "Premium E-commerce Package"
    elif "20000" in budget or "18000" in budget:
        return "Standard E-commerce Package"
    else:
        return "Basic Starter Package"
