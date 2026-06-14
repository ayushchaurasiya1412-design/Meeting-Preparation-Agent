from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.database.base import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id")
    )

    task = Column(String, nullable=False)

    assigned_to = Column(String)

    status = Column(String, default="Pending")

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )