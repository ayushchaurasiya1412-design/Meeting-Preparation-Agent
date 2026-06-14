from sqlalchemy import text
from app.database.connection import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))

        print("✅ Database Connected Successfully")

        for row in result:
            print(row[0])

except Exception as e:
    print("❌ Connection Failed")
    print(e)