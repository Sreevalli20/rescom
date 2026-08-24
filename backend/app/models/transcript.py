"""
Transcript model for storing conversation messages.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class Transcript(Base):
    """Transcript message model."""
    __tablename__ = "transcripts"
    
    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    speaker = Column(String, nullable=False)  # 'ai' or 'customer'
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    language = Column(String, nullable=True)
    translation = Column(Text, nullable=True)
    audio_duration_ms = Column(Integer, nullable=True)
    highlighted_keywords = Column(Text, nullable=True)  # JSON string
    
    # Relationship
    call = relationship("Call", back_populates="transcript")
