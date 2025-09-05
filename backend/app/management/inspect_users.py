from __future__ import annotations
from sqlalchemy import create_engine, text
from app.core.config import get_settings

def main():
    e = create_engine(get_settings().database_url, future=True)
    with e.connect() as c:
        rows = c.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position"))
        for name, dt in rows:
            print(name, dt)

if __name__ == '__main__':
    main()
