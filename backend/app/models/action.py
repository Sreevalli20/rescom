"""
Call action model for tracking backend actions.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class CallAction(Base):
    """Call action model."""
    __tablename__ = "call_actions"
    
    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    action_type = Column(String, nullable=False)  # outbound_initiated, language_detected, lead_classified, etc.
    status = Column(String, default="pending")  # completed, in_progress, pending, failed
    timestamp = Column(DateTime, default=datetime.utcnow)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    payload_snippet = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string (renamed from 'metadata' to avoid SQLAlchemy reserved name)
    
    # Relationship
    call = relationship("Call", back_populates="actions")
