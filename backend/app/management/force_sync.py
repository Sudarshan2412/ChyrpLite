from __future__ import annotations
"""Force create all tables ignoring Alembic state (hackathon utility)."""
from app.core.database import Base, get_engine
import asyncio

def main():
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Tables created (if they did not already exist).")

if __name__ == "__main__":
    main()
