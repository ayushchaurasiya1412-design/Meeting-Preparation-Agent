from pydantic import BaseModel


class MeetingNoteCreate(BaseModel):
    meeting_id: int
    notes: str


class MeetingNoteResponse(BaseModel):
    id: int
    meeting_id: int
    notes: str

    class Config:
        from_attributes = True