from pydantic import BaseModel


class ClientCreate(BaseModel):
    company_name: str
    contact_person: str
    email: str
    industry: str


class ClientResponse(BaseModel):
    id: int
    company_name: str
    contact_person: str
    email: str
    industry: str

    class Config:
        from_attributes = True