from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.base import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String, nullable=False)

    contact_person = Column(String)

    email = Column(String)

    industry = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )