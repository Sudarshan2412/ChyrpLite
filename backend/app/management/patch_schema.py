from __future__ import annotations
"""Lightweight schema patcher to add any missing columns for existing Neon DB.
Runs idempotent ALTER TABLE ... ADD COLUMN IF NOT EXISTS statements.
"""
from sqlalchemy import text, create_engine
from app.core.config import get_settings

def main():
    settings = get_settings()
    engine = create_engine(settings.database_url, future=True)
    stmts = [
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
    ]
    with engine.begin() as conn:
        for s in stmts:
            conn.execute(text(s))
        # Backfill is_admin from legacy is_superuser
        conn.execute(text("UPDATE users SET is_admin = is_superuser WHERE is_admin IS FALSE AND is_superuser IS TRUE"))
    print("Schema patch applied (users table).")

if __name__ == "__main__":
    main()
