from pydantic import BaseModel


class ActionItemCreate(BaseModel):
    meeting_id: int
    task: str
    assigned_to: str