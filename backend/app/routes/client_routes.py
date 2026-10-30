from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.dependencies import get_db
from app.models.client import Client
from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.action_item import ActionItem
from app.schemas.client_schema import ClientCreate, ClientUpdate

router = APIRouter()


# TEST ROUTE
@router.get("/test")
def test_client():

    return {
        "message": "Client Route Working"
    }


# CREATE CLIENT
@router.post("/")
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db)
):

    new_client = Client(
        company_name=client.company_name,
        contact_person=client.contact_person,
        email=client.email,
        industry=client.industry
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return {
        "message": "Client Created Successfully",
        "client_id": new_client.id
    }


# GET ALL CLIENTS
@router.get("/")
def get_all_clients(
    db: Session = Depends(get_db)
):

    clients = db.query(Client).all()

    return clients


# GET SINGLE CLIENT
@router.get("/{client_id}")
def get_single_client(
    client_id: int,
    db: Session = Depends(get_db)
):

    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client


# DELETE CLIENT
@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db)
):

    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    db.delete(client)
    db.commit()

    return {
        "message": "Client Deleted Successfully"
    }


# UPDATE CLIENT
@router.put("/{client_id}")
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    if client_update.company_name is not None:
        client.company_name = client_update.company_name
    if client_update.contact_person is not None:
        client.contact_person = client_update.contact_person
    if client_update.email is not None:
        client.email = client_update.email
    if client_update.industry is not None:
        client.industry = client_update.industry

    db.commit()
    db.refresh(client)

    return {
        "message": "Client Updated Successfully",
        "client": {
            "id": client.id,
            "company_name": client.company_name,
            "contact_person": client.contact_person,
            "email": client.email,
            "industry": client.industry
        }
    }


# ─── CLIENT DETAIL — meetings, notes, action items, stats ─────
@router.get("/{client_id}/detail")
def get_client_detail(
    client_id: int,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # all meetings for this client
    meetings = db.query(Meeting).filter(
        Meeting.client_id == client_id
    ).order_by(Meeting.meeting_date.desc()).all()

    meeting_ids = [m.id for m in meetings]

    # notes for these meetings
    notes = (
        db.query(MeetingNote)
        .filter(MeetingNote.meeting_id.in_(meeting_ids))
        .all()
        if meeting_ids else []
    )

    # action items for these meetings
    action_items = (
        db.query(ActionItem)
        .filter(ActionItem.meeting_id.in_(meeting_ids))
        .order_by(ActionItem.created_at.desc())
        .all()
        if meeting_ids else []
    )

    # stats
    completed = sum(1 for a in action_items if a.status == "Completed")
    in_prog   = sum(1 for a in action_items if a.status == "In Progress")
    pending   = sum(1 for a in action_items if a.status == "Pending")

    return {
        "client": {
            "id":             client.id,
            "company_name":   client.company_name,
            "contact_person": client.contact_person,
            "email":          client.email,
            "industry":       client.industry,
            "status":         getattr(client, "status", "active"),
            "deal_value":     getattr(client, "deal_value", None),
            "created_at":     client.created_at.isoformat() if getattr(client, "created_at", None) else None,
        },
        "meetings": [
            {
                "id":           m.id,
                "title":        m.title,
                "agenda":       m.agenda,
                "meeting_date": m.meeting_date.isoformat() if m.meeting_date else None,
                "created_at":   m.created_at.isoformat() if m.created_at else None,
            }
            for m in meetings
        ],
        "notes": [
            {
                "id":         n.id,
                "meeting_id": n.meeting_id,
                "notes":      n.notes,
            }
            for n in notes
        ],
        "action_items": [
            {
                "id":          a.id,
                "meeting_id":  a.meeting_id,
                "task":        a.task,
                "assigned_to": a.assigned_to,
                "status":      a.status,
                "created_at":  a.created_at.isoformat() if a.created_at else None,
            }
            for a in action_items
        ],
        "stats": {
            "total_meetings":    len(meetings),
            "total_notes":       len(notes),
            "total_actions":     len(action_items),
            "completed_actions": completed,
            "inprogress_actions": in_prog,
            "pending_actions":   pending,
            "completion_rate":   round(completed / len(action_items) * 100, 1) if action_items else 0,
        },
    }