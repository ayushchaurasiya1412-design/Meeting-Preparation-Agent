from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    company = Column(String, nullable=True)

    role = Column(String, nullable=True)

    phone = Column(String, nullable=True)
    
    bio = Column(String, nullable=True)
    
    timezone = Column(String, nullable=True)

    profile_photo = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)