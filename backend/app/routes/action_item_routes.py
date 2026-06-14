from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.action_item import ActionItem
from app.schemas.action_item_schema import ActionItemCreate

router = APIRouter()


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

    item = db.query(ActionItem).filter(
        ActionItem.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Action Item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Action Item Deleted Successfully"
    }