"""
Call summary model for storing post-call AI summaries.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base


class CallSummary(Base):
    """Call summary model."""
    __tablename__ = "call_summaries"
    
    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False, unique=True)
    customer_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    language = Column(String, nullable=True)
    lead_status = Column(String, nullable=True)
    what_they_want = Column(Text, nullable=True)
    budget = Column(String, nullable=True)
    products = Column(Text, nullable=True)
    product_count = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    features = Column(Text, nullable=True)  # JSON array string
    customer_concerns = Column(Text, nullable=True)
    next_action = Column(Text, nullable=True)
    important_statements = Column(Text, nullable=True)  # JSON array string
    recommended_package = Column(String, nullable=True)
    estimated_deal_value = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    call = relationship("Call", back_populates="summary")
