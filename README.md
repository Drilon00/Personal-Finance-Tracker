# FinTracker — Personal Finance Tracker

A full-stack web application for tracking personal income, expenses, and budgets. Built with Next.js 14, Express, and PostgreSQL.

## Features

- **Authentication** — Register, login, logout with JWT access tokens and httpOnly refresh cookies
- **Transactions** — Full CRUD with pagination, sorting, multi-field filtering, recurring transactions, and CSV export
- **Budgets** — Per-category spending limits with real-time progress tracking and over-budget alerts
- **Categories** — Custom income and expense categories with color picker
- **Analytics** — Monthly income/expense trends, category breakdowns, net balance chart, and savings rate gauge
- **Multi-currency** — Switch between USD, EUR, GBP, JPY, and more from the settings page
- **Responsive** — Works on desktop and mobile

## Tech Stack

**Frontend**
- Next.js 14 (App Router), TypeScript
- Tailwind CSS
- TanStack Query v5 (React Query) with optimistic updates
- Recharts
- React Hook Form + Zod

**Backend**
- Node.js + Express, TypeScript
- Prisma ORM
- PostgreSQL (NeonDB)
- JWT with refresh token rotation

## Project Structure

```
personal-finance-tracker/
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   └── lib/
│   └── prisma/
│       └── schema.prisma
└── frontend/                 # Next.js app
    └── src/
        ├── app/
        ├── components/
        ├── hooks/
        ├── contexts/
        └── lib/
```

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database — [NeonDB](https://neon.tech) free tier works great

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/personal-finance-tracker.git
cd personal-finance-tracker
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL="your_pooled_postgres_connection_string"
DIRECT_URL="your_direct_postgres_connection_string"
JWT_ACCESS_SECRET="your-random-secret-min-32-chars"
JWT_REFRESH_SECRET="your-random-secret-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

> If using NeonDB, use the **pooled** connection string for `DATABASE_URL` and the **direct** connection string for `DIRECT_URL`.

### 3. Run database migrations

```bash
npm run db:migrate --workspace=backend
```

### 4. Configure the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Start the app

```bash
npm run dev
```

This starts both backend (port 4000) and frontend (port 3000) at the same time.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
npm test --workspace=backend
```

## API Documentation

Swagger UI is available at [http://localhost:4000/api/docs](http://localhost:4000/api/docs) when the backend is running.

## CI

GitHub Actions runs on every push to `main` — installs dependencies, runs backend tests, and builds both workspaces.
