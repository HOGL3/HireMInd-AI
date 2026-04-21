# 🧠 HireMind AI — Job Intelligence Platform

> **Find Smarter. Get Hired Faster.**

HireMind AI is a production-ready, AI-powered job intelligence platform. It aggregates jobs from multiple sources, uses AI to match and rank them against your profile, and provides a **Career Copilot** to guide your job search.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample jobs
python manage.py seed_jobs

# Start server
python manage.py runserver 8000
```

### 2. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### URLs
| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing Page |
| http://localhost:3000/dashboard | AI Job Dashboard |
| http://localhost:3000/profile | Profile Manager |
| http://localhost:3000/market | Market Intelligence |
| http://localhost:8000/admin/ | Django Admin |
| http://localhost:8000/api/ | REST API |

---

## 🔑 Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required for full AI features
OPENAI_API_KEY=sk-...

# Required for live job aggregation
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
JOOBLE_API_KEY=your_key

# Database (default: SQLite for dev)
DATABASE_URL=sqlite:///db.sqlite3
```

> Without API keys, the app runs with mock data and keyword-based AI fallbacks.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register |
| POST | `/api/auth/login/` | Get JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh tokens |
| GET | `/api/auth/me/` | Current user |
| GET/PATCH | `/api/auth/profile/` | User profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List all jobs |
| GET | `/api/jobs/?remote=true` | Remote jobs |
| GET | `/api/jobs/search/?q=python` | Search |
| GET | `/api/jobs/{id}/` | Job detail |
| GET | `/api/jobs/saved/` | Saved jobs |
| POST | `/api/jobs/saved/` | Save a job |
| DELETE | `/api/jobs/saved/{id}/` | Unsave |

### AI Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/recommendations/` | AI-ranked jobs |
| POST | `/api/ai/copilot/` | Career Copilot chat |
| POST | `/api/ai/cover-letter/` | Generate cover letter |
| POST | `/api/ai/resume/parse/` | Parse resume text |
| GET | `/api/ai/market-insights/` | Market data |

---

## 🏗️ Architecture

```
AI HIREMIND/
├── backend/
│   ├── accounts/          # User auth, profiles
│   ├── jobs/              # Job models, API, aggregator, tasks
│   ├── ai_engine/         # Matching, copilot, cover letters
│   └── core/              # Settings, URLs, Celery config
├── frontend/
│   └── app/
│       ├── page.tsx           # Landing page
│       ├── dashboard/         # AI Dashboard
│       ├── profile/           # Profile manager
│       └── market/            # Market intelligence
├── docker-compose.yml
└── .env.example
```

---

## 🤖 AI Features

| Feature | Status | Requires |
|---------|--------|----------|
| Job Fit Score (cosine similarity) | ✅ Always | — |
| Skill Gap Analysis | ✅ Always | — |
| AI Explanation | ✅ Always | — |
| Career Copilot | ✅ Always | OpenAI optional |
| Cover Letter Generator | ✅ Always | OpenAI optional |
| Semantic Embeddings | ✅ Always | OpenAI optional |
| Resume Parsing | ✅ Always | — |
| Market Intelligence | ✅ Always | — |

---

## ⚡ Background Tasks (Celery + Redis)

```bash
# Start Redis (via Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Start Celery worker
cd backend
celery -A core worker -l info

# Start Celery beat (scheduler)
celery -A core beat -l info
```

**Scheduled tasks:**
- Every 6h: Fetch new jobs from APIs
- Daily 3am: Expire jobs older than 14 days
- Daily 4:30am: Update AI embeddings

---

## 🐳 Docker (Full Stack)

```bash
# Copy env file
cp .env.example .env

# Start all services
docker compose up --build
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
1. Connect your GitHub repo to [Railway](https://railway.app)
2. Add environment variables from `.env`
3. Set build command: `python manage.py migrate && python manage.py seed_jobs`
4. Set start command: `gunicorn core.wsgi:application`

---

## 🛡️ Security
- JWT authentication on all protected routes
- CORS configured for known origins
- Rate limiting via Django middleware
- Input validation on all serializers
- No raw SQL queries
