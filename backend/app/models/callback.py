"""
Callback model for storing callback requests.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class Callback(Base):
    """Callback model."""
    __tablename__ = "callbacks"
    
    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False, unique=True)
    requested = Column(String, default="false")
    original_text = Column(Text, nullable=True)
    requested_time = Column(String, nullable=True)
    parsed_date_time = Column(String, nullable=True)
    scheduled_iso = Column(DateTime, nullable=True)
    status = Column(String, default="none")  # none, pending, scheduled, completed, failed
    assigned_agent = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    timezone = Column(String, default="Asia/Kolkata")
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    call = relationship("Call", back_populates="callback")
