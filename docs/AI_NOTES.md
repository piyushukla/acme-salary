# AI Usage & Engineering Decisions

How I used AI tools on this build, and — more importantly — where I directed,
overrode, or corrected them. The point of this doc is to show _judgment_, not to
show that an AI can generate code.

## Tools

- Claude (agentic, in-editor + chat) — scaffolding, boilerplate, first-draft
  components, and as a sounding board for design trade-offs.
- VS Code — editing, running, git.
- Verification (running Prisma, seeding the real DB, eyeballing the UI and the
  converted numbers) was done by me locally, not by the AI.

## How I worked with it

I drove the design; the AI accelerated the typing. Each step was: decide the
approach → have the AI draft it → review, correct, and commit. I did not ask
it to "build the whole app" in one shot — that produces an unreviewable blob and
destroys the commit history, which is exactly what this exercise grades.

## Decisions where I directed or overrode the AI

These are the ones that matter.

1. Separate Node/Express backend instead of a Next.js fullstack app.
   The AI recommended one Next.js repo with route handlers. I chose a standalone
   Express + Prisma service with a React (Vite) SPA. Reasoning: cleaner front/back
   separation, closer to a real service boundary, and I'm comfortable in the JS
   ecosystem. I explicitly accepted the cost this adds (two deploys + CORS).

2. Kept SQLite, not a heavier DB. The AI flagged the real trap — SQLite on a
   serverless FS is ephemeral, so a local `.db` won't survive on Vercel. I kept
   SQLite for the dev mental model and will point `DATABASE_URL` at Turso (libSQL)
   for deploy — no schema change. I rejected the suggestion to reach for Postgres:
   unnecessary for 10k rows and a new provider to learn under time pressure.

3. Currency is load-bearing, treated as first-class. "How does the org pay
   people" is unanswerable across countries without normalization. So: store
   `baseSalary + currencyCode` per employee, keep an FX table, and normalize every
   aggregate to USD. Live FX is deliberately out of scope (static seeded rates in a
   table, so it's swappable later).

4. Server-side everything; aggregation in SQL. Pagination, search, sort, and
   filtering hit the DB with indexes. Analytics run as `GROUP BY` with a JOIN to
   the FX table; org median uses the SQLite offset trick so it stays in the DB
   instead of pulling 10k rows into Node. I deliberately avoided the anti-pattern
   of loading all rows client-side and filtering there.

5. Realistic, deterministic seed. `faker.seed(42)` for reproducibility, plus
   weighted distributions (country headcount + cost factor, a level pyramid). Flat
   random salaries would make the analytics look like noise and kill the demo.

6. DRY on salary bands. One `SALARY_BANDS` constant feeds _both_ the JS
   bucketer and the SQL `CASE` expression, so the distribution logic can't drift
   between the two layers.

7. Rejected a hand-rolled dropdown. When I wanted the filter dropdowns styled,
   the naive path is a custom `<div>` menu — an accessibility footgun (keyboard nav,
   focus, ARIA all by hand). I used Radix Select (what shadcn wraps): styled and
   accessible, small dependency.

8. Pushed back on AI over-asking. At one point the AI kept asking clarifying
   questions instead of delivering. I called it out and had it produce code. Knowing
   when to stop the AI from "helpfully" stalling is part of using it well.

## Where the AI added genuine value

- Fast, consistent scaffolding of the layered structure (routes / services /
  repositories) so I could review shape rather than type boilerplate.
- Catching the SQLite-on-serverless trap before I hit it in deploy.
- Zod schemas, error middleware, and the TanStack Query cache-invalidation wiring
  (editing a salary invalidates both the list and analytics caches).

## Where the AI got it wrong / I corrected it

- Over-processed with clarifying questions; I redirected it to ship.
- Left stray files and an inconsistent folder name during setup; I cleaned those up
  manually (`rm` the duplicates, rename to `backend/` + `frontend/`).
- Its sandbox couldn't run Prisma (engine download blocked), so I verified the
  schema, seed, and analytics numbers on my own machine — including spot-checking
  currency conversion (e.g. ₹1,979,308 at 0.012 → ~$23,752).

## Deliberately out of scope (with reasons)

Multi-role RBAC, audit logging, salary history/versioning, approval workflows, live
FX, and bulk Excel import — all cut on purpose. Salary data is sensitive so
audit/history genuinely matter in production; I called them out as _decisions_, not
oversights, to keep the build focused on the core ask (manage + answer questions).

## Key trade-offs

- `baseSalary` stored as `Float` for readability; production-correct is integer
  minor units (cents) to avoid float error — flagged, not shipped.
- `country`/`department` denormalized as indexed strings (read/analytics-heavy);
  the FX table _is_ normalized because normalization depends on it.
- Bundle size warning from Recharts left as-is for the demo; code-splitting is the
  fix if it matters.
