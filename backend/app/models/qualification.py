"""
Qualification model for storing lead qualification data.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class Qualification(Base):
    """Lead qualification model."""
    __tablename__ = "qualifications"
    
    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False, unique=True)
    lead_status = Column(String, default="UNASSIGNED")  # HOT, WARM, COLD, UNASSIGNED
    budget = Column(String, nullable=True)
    products = Column(Text, nullable=True)
    product_count = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    features = Column(Text, nullable=True)  # JSON array string
    buying_intent = Column(String, default="Unknown")  # Low, Medium, High, Unknown
    barrier = Column(Text, nullable=True)
    decision_maker = Column(String, default="Unknown")  # Known, Unknown
    lead_score = Column(Integer, default=0)
    confidence_score = Column(Integer, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    call = relationship("Call", back_populates="qualification")
