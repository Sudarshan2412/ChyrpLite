import os
from sqlalchemy import create_engine, text

# Get DB URL from environment or hardcode if needed
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/postgres")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Dropping all tables in the database...")
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.commit()
    print("Done. All tables dropped and schema recreated.")
