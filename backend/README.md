# ChyrpLite Backend

FastAPI backend for modern ChyrpLite clone.

## Quickstart

Create `.env` with at least:
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/chyrplite
JWT_SECRET=change-me
```

Install & run:
```
pip install -e .
uvicorn app.main:app --reload
```

Run migrations (optional if using force sync):
```
alembic upgrade head
```

Force create tables (hackathon shortcut):
```
python -m app.management.force_sync
```

Feeds & utilities:
```
/rss.xml
/sitemap.xml
/captcha/new
```
