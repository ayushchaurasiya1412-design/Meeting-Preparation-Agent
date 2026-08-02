from pydantic import BaseModel
from typing import Optional


class MeetingNoteCreate(BaseModel):
    meeting_id: int
    notes: str


class MeetingNoteUpdate(BaseModel):
    meeting_id: Optional[int] = None
    notes: Optional[str] = None


class MeetingNoteResponse(BaseModel):
    id: int
    meeting_id: int
    notes: str

    class Config:
        from_attributes = True