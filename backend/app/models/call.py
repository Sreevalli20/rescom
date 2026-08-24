"""
Call model for storing call records.
"""
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class Call(Base):
    """Call record model."""
    __tablename__ = "calls"
    
    id = Column(String, primary_key=True, index=True)
    phone_number = Column(String, nullable=False, index=True)
    customer_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="idle")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    language = Column(String, default="en")
    current_ai_goal = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    # Relationships
    transcript = relationship("Transcript", back_populates="call", cascade="all, delete-orphan")
    qualification = relationship("Qualification", back_populates="call", uselist=False, cascade="all, delete-orphan")
    actions = relationship("CallAction", back_populates="call", cascade="all, delete-orphan")
    callback = relationship("Callback", back_populates="call", uselist=False, cascade="all, delete-orphan")
    summary = relationship("CallSummary", back_populates="call", uselist=False, cascade="all, delete-orphan")
