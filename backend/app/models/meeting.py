from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.database.base import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    agenda = Column(String)

    meeting_date = Column(DateTime)

    client_id = Column(
        Integer,
        ForeignKey("clients.id")
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )