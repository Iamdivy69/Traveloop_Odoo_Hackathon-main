# Traveloop

> Personalized Travel Planning Platform — Full-Stack Monorepo

## Project Structure

```
traveloop/
├── apps/
│   ├── frontend/     # React 19 + Vite 7 + TypeScript + TailwindCSS
│   └── backend/      # Node.js + Express 5 + TypeScript + Prisma + PostgreSQL
├── infrastructure/
│   ├── docker/       # Docker environment files
│   ├── nginx/        # Nginx config
│   └── scripts/      # Utility scripts (smoke tests, admin fixes)
├── docs/             # Documentation, PDFs, testing guides
├── .github/          # CI/CD workflows
├── docker-compose.yml
├── Makefile
└── package.json      # npm workspaces root
```

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Copy and configure environment
cp infrastructure/docker/.env.docker infrastructure/docker/.env.docker.local

# Start all services (db + backend + frontend)
docker compose up --build -d

# Check health
curl http://localhost:3000/api/v1/health

# Seed database (optional)
docker exec traveloop-backend npm run seed
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api/v1
- Database: localhost:5432

### Option 2: Local Development

```bash
# Terminal 1 — Backend
cd apps/backend
npm install
npm run dev

# Terminal 2 — Frontend
cd apps/frontend
npm install
npm run dev
```

### Prerequisites for local dev
- Node.js 20+
- PostgreSQL 15+ running on port 5432 (or adjust DATABASE_URL)
- Copy `apps/backend/.env.example` → `apps/backend/.env`
- Copy `apps/frontend/.env.example` → `apps/frontend/.env` (if exists)

## Environment Setup

See `.env.example` at the root for all required environment variables.

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `apps/backend/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `apps/backend/.env` | JWT signing secret (min 32 chars) |
| `CORS_ORIGIN` | `apps/backend/.env` | Frontend URL for CORS |
| `VITE_API_BASE_URL` | `apps/frontend/.env` | Backend API base URL |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, TypeScript, TailwindCSS 3, Zustand, TanStack Query, Radix UI |
| Backend | Node.js 20, Express 5, TypeScript, Prisma 6 |
| Database | PostgreSQL 15 |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Infra | Docker, Docker Compose, Nginx |

## Makefile Commands

```bash
make up          # docker compose up --build -d
make down        # docker compose down
make logs        # tail backend logs
make seed        # seed the database
make migrate     # run prisma migrations
make reset-db    # wipe and restart database
make smoke-test  # run API smoke tests
```
