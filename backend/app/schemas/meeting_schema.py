from pydantic import BaseModel
from datetime import datetime


class MeetingCreate(BaseModel):
    title: str
    agenda: str
    meeting_date: datetime
    client_id: int


class MeetingResponse(BaseModel):
    id: int
    title: str
    agenda: str
    meeting_date: datetime
    client_id: int

    class Config:
        from_attributes = True