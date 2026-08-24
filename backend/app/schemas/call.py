"""
Call-related Pydantic schemas matching frontend types.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class TranscriptMessage(BaseModel):
    """Transcript message schema."""
    id: str
    speaker: str  # 'ai' or 'customer'
    text: str
    timestamp: str
    language: Optional[str] = None
    translation: Optional[str] = None
    audioDurationMs: Optional[int] = None
    highlightedKeywords: Optional[List[str]] = None


class QualificationData(BaseModel):
    """Qualification data schema."""
    leadStatus: Literal['HOT', 'WARM', 'COLD', 'UNASSIGNED'] = 'UNASSIGNED'
    budget: str = ""
    products: str = ""
    productCount: str = ""
    timeline: str = ""
    features: List[str] = []
    buyingIntent: Literal['Low', 'Medium', 'High', 'Unknown'] = 'Unknown'
    barrier: str = ""
    decisionMaker: Literal['Known', 'Unknown'] = 'Unknown'
    leadScore: Optional[int] = 0
    confidenceScore: Optional[int] = None
    lastUpdated: Optional[str] = None


class CallAction(BaseModel):
    """Call action schema."""
    id: str
    type: str  # outbound_initiated, language_detected, lead_classified, whatsapp_sent, etc.
    status: str  # completed, in_progress, pending, failed
    timestamp: str
    title: str
    description: str
    payloadSnippet: Optional[str] = None
    metadata: Optional[dict] = None


class CallbackData(BaseModel):
    """Callback data schema."""
    requested: bool = False
    originalText: Optional[str] = None
    requestedTime: Optional[str] = None
    parsedDateTime: Optional[str] = None
    status: Literal['none', 'pending', 'scheduled', 'completed'] = 'none'
    scheduledIso: Optional[str] = None
    assignedAgent: Optional[str] = None
    notes: Optional[str] = None


class CallSummary(BaseModel):
    """Call summary schema."""
    id: str
    callId: str
    customerName: Optional[str] = None
    phoneNumber: str
    language: str
    leadStatus: Literal['HOT', 'WARM', 'COLD', 'UNASSIGNED']
    whatTheyWant: str
    budget: str
    products: str
    productCount: str
    timeline: str
    features: List[str]
    customerConcerns: str
    nextAction: str
    importantStatements: List[str]
    generatedAt: str
    recommendedPackage: Optional[str] = None
    estimatedDealValue: Optional[str] = None


class CallRecord(BaseModel):
    """Call record schema."""
    id: str
    phoneNumber: str
    customerName: Optional[str] = None
    status: str
    startedAt: str
    endedAt: Optional[str] = None
    durationSeconds: int
    language: str
    qualification: QualificationData
    callback: CallbackData
    actions: List[CallAction]
    summary: Optional[CallSummary] = None
    transcript: List[TranscriptMessage]
    currentAiGoal: Optional[str] = None
    failureReason: Optional[str] = None


class StartCallPayload(BaseModel):
    """Start call payload schema."""
    phoneNumber: str = Field(..., description="Customer phone number")
    customerName: Optional[str] = Field(None, description="Customer name")
    preferredLanguage: Optional[Literal['te', 'hi', 'en', 'auto']] = Field(None, description="Preferred language")
    scenarioPreset: Optional[str] = Field(None, description="Scenario preset for testing")


class StartCallResponse(BaseModel):
    """Start call response schema."""
    success: bool
    callId: str
    status: str
    message: Optional[str] = None


class CallbackRequest(BaseModel):
    """Callback request schema."""
    requestedTime: Optional[str] = None
    parsedDateTime: Optional[str] = None
    notes: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    timestamp: Optional[str] = None
    version: Optional[str] = None


class EndCallResponse(BaseModel):
    """End call response schema."""
    success: bool
    message: Optional[str] = None
