# ACME Salary Management — Backend (Express + Prisma + SQLite)

Layered API for managing 10,000 employees' salaries and answering
"how does the org pay people?" across countries (USD-normalized).

## Architecture
route handler -> service (business logic) -> repository (Prisma) -> SQLite

- Prisma queries live ONLY in `repositories/` (swappable data layer)
- Currency normalization + DTO shaping in `services/`
- Analytics aggregates run as SQL `GROUP BY` in the DB, not in Node
- Single bearer-token auth gate (multi-role RBAC is out of scope — see REQUIREMENTS)

## Run locally
```bash
npm install
cp .env.example .env        # set API_TOKEN
npm run db:push             # create SQLite schema
npm run seed                # 10,000 realistic employees (deterministic)
npm run dev                 # http://localhost:4000
npm test                    # unit tests
```

## API
All /api routes need `Authorization: Bearer <API_TOKEN>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | public health check |
| GET | `/api/employees` | list — `?page&pageSize&search&country&department&level&status&sortBy&sortDir` |
| GET | `/api/employees/filters` | distinct values for dropdowns |
| GET | `/api/employees/:id` | single employee |
| PATCH | `/api/employees/:id` | update salary-relevant fields |
| GET | `/api/analytics/summary` | org totals: headcount, payroll, avg, median (USD) |
| GET | `/api/analytics/by/:dimension` | pay by `country` \| `department` \| `level` |
| GET | `/api/analytics/distribution` | headcount per salary band |

## Deploy note
SQLite file won't persist on serverless FS. For deploy, point `DATABASE_URL`
at Turso (libSQL) — same SQLite, no code change.
