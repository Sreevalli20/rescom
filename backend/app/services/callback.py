"""
Callback parsing service for natural language time expressions.
Supports English, Hindi, and Telugu time expressions.
"""
import re
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dateutil import parser, relativedelta
from app.config import settings

logger = logging.getLogger(__name__)


class CallbackParser:
    """Parse natural language callback requests into concrete dates/times."""
    
    # Timezone for parsing
    TIMEZONE = settings.TIMEZONE
    
    # English patterns
    ENGLISH_PATTERNS = {
        'today': r'\btoday\b',
        'tomorrow': r'\btomorrow\b',
        'next_monday': r'\bnext\s+monday\b',
        'next_tuesday': r'\bnext\s+tuesday\b',
        'next_wednesday': r'\bnext\s+wednesday\b',
        'next_thursday': r'\bnext\s+thursday\b',
        'next_friday': r'\bnext\s+friday\b',
        'next_saturday': r'\bnext\s+saturday\b',
        'next_sunday': r'\bnext\s+sunday\b',
        'morning': r'\bmorning\b',
        'afternoon': r'\bafternoon\b',
        'evening': r'\bevening\b',
        'night': r'\bnight\b',
        'at_time': r'\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b',
    }
    
    # Hindi patterns
    HINDI_PATTERNS = {
        'today': r'\bआज\b',
        'tomorrow': r'\bकल\b',
        'morning': r'\bसुबह\b',
        'afternoon': r'\bदोपहर\b',
        'evening': r'\bशाम\b',
        'night': r'\bरात\b',
        'at_time': r'\b(\d{1,2})\s*(बजे)\b',
    }
    
    # Telugu patterns
    TELUGU_PATTERNS = {
        'today': r'\bనేటి\b|\bఈరోజు\b',
        'tomorrow': r'\bరేపు\b',
        'morning': r'\bఉదయం\b|\bసకాలం\b',
        'afternoon': r'\bమధ్యాహ్నం\b',
        'evening': r'\bసాయంత్రం\b',
        'night': r'\bరాత్రి\b',
        'at_time': r'\b(\d{1,2})\s*(గంటలకు)\b',
    }
    
    def __init__(self):
        self.current_time = datetime.now()
    
    def parse_callback_request(
        self,
        natural_text: str,
        language: str = "en",
        reference_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Parse a natural language callback request.
        
        Args:
            natural_text: Natural language time expression
            language: Language code (en, hi, te)
            reference_time: Reference time for parsing (default: now)
            
        Returns:
            Dictionary with parsed datetime and metadata
        """
        if reference_time is None:
            reference_time = self.current_time
        
        text_lower = natural_text.lower()
        
        # Select patterns based on language
        if language == "hi":
            patterns = self.HINDI_PATTERNS
        elif language == "te":
            patterns = self.TELUGU_PATTERNS
        else:
            patterns = self.ENGLISH_PATTERNS
        
        # Parse the request
        parsed_datetime = self._parse_with_patterns(text_lower, patterns, reference_time)
        
        if not parsed_datetime:
            # Try English as fallback
            parsed_datetime = self._parse_with_patterns(text_lower, self.ENGLISH_PATTERNS, reference_time)
        
        if not parsed_datetime:
            # Try dateutil parser as last resort
            try:
                parsed_datetime = parser.parse(natural_text, fuzzy=True)
            except:
                parsed_datetime = None
        
        return {
            "original_text": natural_text,
            "language": language,
            "parsed_datetime": parsed_datetime.isoformat() if parsed_datetime else None,
            "formatted_display": self._format_display(parsed_datetime) if parsed_datetime else None,
            "success": parsed_datetime is not None
        }
    
    def _parse_with_patterns(
        self,
        text: str,
        patterns: Dict[str, str],
        reference_time: datetime
    ) -> Optional[datetime]:
        """Parse text using regex patterns."""
        result_time = reference_time
        
        # Check for day patterns
        if re.search(patterns.get('today', ''), text):
            result_time = reference_time
        elif re.search(patterns.get('tomorrow', ''), text):
            result_time = reference_time + timedelta(days=1)
        elif re.search(patterns.get('next_monday', ''), text):
            result_time = self._get_next_weekday(reference_time, 0)
        elif re.search(patterns.get('next_tuesday', ''), text):
            result_time = self._get_next_weekday(reference_time, 1)
        elif re.search(patterns.get('next_wednesday', ''), text):
            result_time = self._get_next_weekday(reference_time, 2)
        elif re.search(patterns.get('next_thursday', ''), text):
            result_time = self._get_next_weekday(reference_time, 3)
        elif re.search(patterns.get('next_friday', ''), text):
            result_time = self._get_next_weekday(reference_time, 4)
        elif re.search(patterns.get('next_saturday', ''), text):
            result_time = self._get_next_weekday(reference_time, 5)
        elif re.search(patterns.get('next_sunday', ''), text):
            result_time = self._get_next_weekday(reference_time, 6)
        
        # Check for time of day patterns
        if re.search(patterns.get('morning', ''), text):
            result_time = result_time.replace(hour=9, minute=0, second=0, microsecond=0)
        elif re.search(patterns.get('afternoon', ''), text):
            result_time = result_time.replace(hour=14, minute=0, second=0, microsecond=0)
        elif re.search(patterns.get('evening', ''), text):
            result_time = result_time.replace(hour=17, minute=0, second=0, microsecond=0)
        elif re.search(patterns.get('night', ''), text):
            result_time = result_time.replace(hour=20, minute=0, second=0, microsecond=0)
        
        # Check for specific time patterns
        time_match = re.search(patterns.get('at_time', ''), text)
        if time_match:
            if len(time_match.groups()) >= 1:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                
                # Handle AM/PM
                if len(time_match.groups()) >= 3 and time_match.group(3):
                    period = time_match.group(3).lower()
                    if period == 'pm' and hour < 12:
                        hour += 12
                    elif period == 'am' and hour == 12:
                        hour = 0
                
                result_time = result_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        return result_time
    
    def _get_next_weekday(self, reference_time: datetime, weekday: int) -> datetime:
        """Get the next occurrence of a specific weekday (0=Monday, 6=Sunday)."""
        current_weekday = reference_time.weekday()
        days_ahead = weekday - current_weekday
        if days_ahead <= 0:
            days_ahead += 7
        return reference_time + timedelta(days=days_ahead)
    
    def _format_display(self, dt: datetime) -> str:
        """Format datetime for display."""
        return dt.strftime("%A, %I:%M %p IST")


# Global callback parser instance
callback_parser = CallbackParser()
