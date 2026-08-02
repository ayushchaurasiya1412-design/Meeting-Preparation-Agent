from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.dependencies import get_db
from app.models.client import Client
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