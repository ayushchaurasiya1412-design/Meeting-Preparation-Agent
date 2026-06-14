from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.client import Client
from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.action_item import ActionItem

router = APIRouter()

@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    total_clients = db.query(Client).count()

    total_meetings = db.query(Meeting).count()

    total_notes = db.query(MeetingNote).count()

    total_actions = db.query(ActionItem).count()

    return {
        "clients": total_clients,
        "meetings": total_meetings,
        "notes": total_notes,
        "actions": total_actions
    }