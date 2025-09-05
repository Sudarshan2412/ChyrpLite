import os
from sqlalchemy import create_engine, text

# Get DB URL from environment or hardcode if needed
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/postgres")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Dropping and recreating the database...")
    # Terminate all connections to the database
    conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgres' AND pid <> pg_backend_pid();"))
    conn.execute(text("DROP DATABASE IF EXISTS postgres;"))
    conn.execute(text("CREATE DATABASE postgres;"))
    print("Done. Database dropped and recreated.")
