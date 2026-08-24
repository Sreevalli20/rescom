"""
Database models for the AI Voice Sales Agent.
Uses SQLAlchemy with PostgreSQL support for production.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Base class for models - must be created before importing models
Base = declarative_base()

# Import all models so they're registered with Base
from app.models.call import Call
from app.models.transcript import Transcript
from app.models.qualification import Qualification
from app.models.action import CallAction
from app.models.callback import Callback
from app.models.summary import CallSummary

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
