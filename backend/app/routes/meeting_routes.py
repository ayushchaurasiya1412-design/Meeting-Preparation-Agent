from app.models.client import Client
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.meeting import Meeting
from app.schemas.meeting_schema import MeetingCreate

router = APIRouter()


@router.get("/test")
def test_meeting():

    return {
        "message": "Meeting Route Working"
    }


# CREATE MEETING
@router.post("/")
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db)
):

    new_meeting = Meeting(
        title=meeting.title,
        agenda=meeting.agenda,
        meeting_date=meeting.meeting_date,
        client_id=meeting.client_id
    )

    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    return {
        "message": "Meeting Created Successfully",
        "meeting_id": new_meeting.id
    }


# GET ALL MEETINGS
@router.get("/")
def get_all_meetings(
    db: Session = Depends(get_db)
):

    meetings = db.query(Meeting).all()

    return meetings


# GET SINGLE MEETING
@router.get("/{meeting_id}")
def get_single_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return meeting


# DELETE MEETING
@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting Deleted Successfully"
    }