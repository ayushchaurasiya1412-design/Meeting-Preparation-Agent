from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.dependencies import get_db
from app.models.action_item import ActionItem
from app.schemas.action_item_schema import ActionItemCreate

router = APIRouter()

VALID_STATUSES = ["Pending", "In Progress", "Completed"]

class StatusUpdate(BaseModel):
    status: str

class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None


# TEST
@router.get("/test")
def test_action_item():

    return {
        "message": "Action Item Route Working"
    }


# CREATE ACTION ITEM
@router.post("/")
def create_action_item(
    item: ActionItemCreate,
    db: Session = Depends(get_db)
):

    new_item = ActionItem(
        meeting_id=item.meeting_id,
        task=item.task,
        assigned_to=item.assigned_to
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "message": "Action Item Created Successfully",
        "action_item_id": new_item.id
    }


# GET ALL ACTION ITEMS
@router.get("/")
def get_all_action_items(
    db: Session = Depends(get_db)
):

    items = db.query(ActionItem).all()

    return items


# GET SINGLE ACTION ITEM
@router.get("/{item_id}")
def get_single_action_item(
    item_id: int,
    db: Session = Depends(get_db)
):

    item = db.query(ActionItem).filter(
        ActionItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Action Item not found"
        )

    return item


# DELETE ACTION ITEM
@router.delete("/{item_id}")
def delete_action_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Action Item Deleted Successfully"}


# PATCH STATUS — for Kanban column moves
@router.patch("/{item_id}/status")
def update_action_item_status(
    item_id: int,
    body: StatusUpdate,
    db: Session = Depends(get_db)
):
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {VALID_STATUSES}"
        )
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action Item not found")
    item.status = body.status
    db.commit()
    db.refresh(item)
    return {
        "message": "Status updated",
        "id": item.id,
        "status": item.status,
        "task": item.task,
    }


# PUT — full update
@router.put("/{item_id}")
def update_action_item(
    item_id: int,
    body: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action Item not found")
    if body.task        is not None: item.task        = body.task
    if body.assigned_to is not None: item.assigned_to = body.assigned_to
    if body.status      is not None:
        if body.status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status")
        item.status = body.status
    db.commit()
    db.refresh(item)
    return item