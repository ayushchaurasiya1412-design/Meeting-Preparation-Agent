from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MeetingCreate(BaseModel):
    title: str
    agenda: str
    meeting_date: datetime
    client_id: int


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    agenda: Optional[str] = None
    meeting_date: Optional[datetime] = None
    client_id: Optional[int] = None


class MeetingResponse(BaseModel):
    id: int
    title: str
    agenda: str
    meeting_date: datetime
    client_id: int

    class Config:
        from_attributes = True