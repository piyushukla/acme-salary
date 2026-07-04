# ACME Salary Management — Frontend (Vite + React + TanStack Query)

Two views for the HR Manager:
- **Dashboard** — org-level answers ("how do we pay people"): headcount, total payroll,
  average/median (USD), pay by department/country, salary distribution.
- **Employees** — 10k rows with server-side pagination, debounced search, filters, sort,
  and inline salary editing.

## Stack
Vite · React 18 · TypeScript · TanStack Query (server-state) · Recharts · Tailwind.
UI primitives are hand-rolled (shadcn-style) to avoid CLI init; swap for shadcn if preferred.

## Run
```bash
npm install
cp .env.example .env      # point VITE_API_URL at the backend, set VITE_API_TOKEN
npm run dev               # http://localhost:5173
```
Backend must be running first (default http://localhost:4000) and CORS_ORIGIN set to this app.

## Notes
- All money is USD-normalized server-side; the client never knows FX rates.
- Editing a salary invalidates both the employee list and analytics caches (numbers stay consistent).
- The demo ships a token to the browser for simplicity — prod would use a session/proxy (see REQUIREMENTS).
