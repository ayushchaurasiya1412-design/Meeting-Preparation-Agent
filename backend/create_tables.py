import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import engine
from app.database.base import Base
# Import all models so they are registered with Base
from app.models.user import User
from app.models.document import Document

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()
