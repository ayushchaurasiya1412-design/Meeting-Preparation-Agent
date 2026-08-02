from pydantic import BaseModel
from typing import Optional


class ClientCreate(BaseModel):
    company_name: str
    contact_person: str
    email: str
    industry: str


class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    company_name: str
    contact_person: str
    email: str
    industry: str

    class Config:
        from_attributes = True