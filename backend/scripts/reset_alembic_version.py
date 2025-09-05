import os
from sqlalchemy import create_engine, text

# Get DB URL from environment or hardcode if needed
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/postgres")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Deleting all rows from alembic_version table...")
    conn.execute(text("DELETE FROM alembic_version;"))
    conn.commit()
    print("Done. Alembic version table reset.")
