import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import engine
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

def update_db():
    columns = ["phone", "bio", "timezone", "profile_photo"]
    for col in columns:
        with engine.connect() as conn:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR;"))
                conn.commit()
                print(f"Added column: {col}")
            except ProgrammingError as e:
                conn.rollback()
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"Column {col} already exists.")
                else:
                    print(f"Error adding {col}: {e}")

if __name__ == "__main__":
    update_db()
