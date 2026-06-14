from app.database.connection import engine
from app.database.base import Base

from app.models.user import User
from app.models.client import Client
from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.action_item import ActionItem

print("Creating Tables...")

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")