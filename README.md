## Project Structure (Simplified)

```
clonefest2/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── api/
│   │   ├── db/
│   │   └── ...other backend code...
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── alembic/
│   ├── Dockerfile
│   └── ...other backend files...
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...other frontend code...
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── ...other frontend files...
├── README.md
├── .gitignore
├── docker-compose.yml
├── fly.toml
├── vercel.json
└── ...other root files (env files, configs, docs, etc.)...
```
# ChyrpLite Monorepo

Modern rebuild of ChyrpLite: FastAPI backend + Next.js 14 frontend with Redis, Postgres (Neon), Fly.io + Vercel deployment.

## Structure
```
backend/    FastAPI app (JWT auth, posts, taxonomy, engagement, uploads, captcha, sitemap, RSS)
frontend/   Next.js app (React Query, markdown rendering, theme, infinite feed)
```

## Backend
Python >=3.13

### Install
```
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or: pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```
Runs at http://localhost:8000

### Env Vars (backend)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ENVIRONMENT=development
JWT_SECRET=change_me
```

## Frontend
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:3000

### Env Vars (frontend)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment
### Backend (Fly.io)
```
cd backend
fly launch
fly secrets set DATABASE_URL=... REDIS_URL=... JWT_SECRET=... ENVIRONMENT=production
fly deploy
```
### Frontend (Vercel)
Set `NEXT_PUBLIC_API_URL=https://<your-backend-domain>` and deploy from repo.

## Regenerating requirements.txt
```
cd backend
pip install -e .
pip freeze > requirements.lock
```
Keep `requirements.txt` curated; `requirements.lock` (optional) can snapshot full resolver output.

## Features
- Auth (JWT)
- Post types: text, photo, quote, link, video, audio, uploader
- Tags / Categories (taxonomy)
- Likes, comments (with reply + delete), views
- File uploads
- MAPTCHA (simple captcha)
- Rate limiting & view tracking middleware
- Sitemap & RSS
- Dark / Light theme persistence
- Infinite scrolling feed

## Roadmap / Next
- Custom domain + HTTPS hardening
- Monitoring (Sentry / LogRocket)
- CI/CD (GitHub Actions)
- Security headers & CSP
- Backups & retention docs

MIT License (adjust as needed)
