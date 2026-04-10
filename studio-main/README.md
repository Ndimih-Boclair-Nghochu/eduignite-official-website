# EduIgnite

EduIgnite is a full-stack school management platform built with **Next.js 15** for the frontend and **Django 4.2** for the backend.

## Deployment Model

- Frontend: deploy `studio-main/` to **Vercel**
- Backend: deploy `studio-main/backend/` to a Python host
- Database: use **PostgreSQL**

The frontend is Vercel-ready. The backend should be hosted separately because the Django stack includes API, Channels, and Celery concerns that are better suited to a full Python runtime than an all-in-one Vercel deployment.

## Local Development

### Backend

Prerequisites:

- Python 3.11+
- PostgreSQL 15+
- Redis 7+ for Channels/Celery features

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements/development.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

API: `http://localhost:8000/api/v1/`

### Frontend

Prerequisites:

- Node.js 20+

```bash
cd ..
npm install
cp .env.example .env.local
npm run dev
```

App: `http://localhost:3000`

## Vercel Frontend Setup

1. Import the repository into Vercel.
2. Set the project root directory to `studio-main`.
3. Install command: `npm install`
4. Build command: `npm run build`
5. Add the required environment variables.

Frontend environment variables:

```ini
NEXT_PUBLIC_API_URL=https://your-backend-domain/api/v1
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_APP_NAME=EduIgnite
NEXT_PUBLIC_CONTACT_EMAIL=eduignitecmr@gmail.com
```

## Backend Hosting Setup

Deploy `backend/` to Railway, Render, Fly.io, a VPS, or another Python host.

Required backend environment variables:

```ini
DJANGO_SECRET_KEY=replace-me
DEBUG=False
ENVIRONMENT=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
ALLOWED_HOSTS=your-backend-domain
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-domain.vercel.app
```

Useful optional variables:

```ini
REDIS_URL=redis://HOST:6379/1
CELERY_BROKER_URL=redis://HOST:6379/0
CELERY_RESULT_BACKEND=redis://HOST:6379/0
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
SENTRY_DSN=
```

After deploy:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

## Environment Notes

- PostgreSQL is the intended production database.
- If `REDIS_URL` is not set, the backend now falls back to local in-memory cache/channel settings for simpler non-realtime environments.
- No demo seed step is required or documented in this repository.

## Repo Structure

```text
studio-main/
├── backend/      Django API
├── src/          Next.js app source
├── package.json
└── next.config.ts
```
