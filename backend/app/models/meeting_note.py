from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from datetime import datetime

from app.database.base import Base

class MeetingNote(Base):
    __tablename__ = "meeting_notes"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(Integer, ForeignKey("meetings.id"))

    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)