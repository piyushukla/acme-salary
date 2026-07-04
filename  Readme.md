# ACME Salary Management

Web software for ACME's HR Manager to manage salary data for ~10,000 employees
across multiple countries — replacing spreadsheets — and to **answer questions
about how the org pays people** (the core ask).

> Live demo: _<add deployed URL>_ · Demo video: _<add link>_

## What's here

| Path               | What                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| `REQUIREMENTS.md`  | One-page requirements (scope, out-of-scope, trade-offs) — written before build |
| `docs/AI_NOTES.md` | How AI was used + key engineering decisions and overrides                      |
| `backend/`         | Express + Prisma + SQLite API                                                  |
| `frontend/`        | Vite + React + TanStack Query + Recharts                                       |

## Architecture

```
React SPA (Vite)  ──HTTP──►  Express API  ──►  Prisma  ──►  SQLite (Turso on deploy)
  TanStack Query               route → service → repository layers
  Recharts                     analytics = SQL GROUP BY, USD-normalized
```

- All money is normalized to a base currency (USD) via an FX table so cross-country
  figures are comparable.
- Employee list + analytics are **server-side** (pagination, search, sort, `GROUP BY`);
  the client never loads all 10k rows.
- Layered backend: Prisma access lives only in `repositories/`.

## Run locally

Two terminals. Backend first.

**Backend** (`:4000`)

```bash
cd backend
npm install
cp .env.example .env          # set API_TOKEN
npm run db:push               # create SQLite schema
npm run seed                  # 10,000 deterministic employees
npm run dev
npm test                      # unit tests
```

**Frontend** (`:5173`)

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL + VITE_API_TOKEN (must match backend's API_TOKEN)
npm run dev
```

Open http://localhost:5173 — **Dashboard** (org pay analytics) and **Employees**
(searchable/filterable table with inline salary editing).

## Tech choices (short)

- **Separate Node/Express backend** over Next.js fullstack — clearer service boundary.
- **SQLite** (Turso/libSQL on deploy) — right-sized for 10k rows; serverless-safe.
- **Static seeded FX rates** — live FX deliberately out of scope (swappable, in a table).

See `REQUIREMENTS.md` for full scope and `docs/AI_NOTES.md` for decision rationale.
