from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.meeting_note import MeetingNote
from app.schemas.meeting_note_schema import MeetingNoteCreate

router = APIRouter()


# TEST ROUTE
@router.get("/test")
def test_meeting_note():

    return {
        "message": "Meeting Note Route Working"
    }


# CREATE NOTE
@router.post("/")
def create_meeting_note(
    note: MeetingNoteCreate,
    db: Session = Depends(get_db)
):

    new_note = MeetingNote(
        meeting_id=note.meeting_id,
        notes=note.notes
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return {
        "message": "Meeting Note Created Successfully",
        "note_id": new_note.id
    }


# GET ALL NOTES
@router.get("/")
def get_all_notes(
    db: Session = Depends(get_db)
):

    notes = db.query(MeetingNote).all()

    return notes


# GET SINGLE NOTE
@router.get("/{note_id}")
def get_single_note(
    note_id: int,
    db: Session = Depends(get_db)
):

    note = db.query(MeetingNote).filter(
        MeetingNote.id == note_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return note


# DELETE NOTE
@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db)
):

    note = db.query(MeetingNote).filter(
        MeetingNote.id == note_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    return {
        "message": "Meeting Note Deleted Successfully"
    }