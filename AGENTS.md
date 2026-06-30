# AGENTS.md — Multi-agent coordination for src-website

More than one autonomous agent works on this repo (Claude Code, and the
"Paperclip CTO"). Uncoordinated, concurrent changes have repeatedly taken
**production down**. Every agent MUST follow this protocol.

## 1. Active-work lock (`.agent-lock`)

Before you edit code, push to `main`, change the DB schema, run migrations,
or change env vars / deploy settings:

1. Read **`.agent-lock`** at the repo root.
2. If it is **held by another agent**, you are **NOT cleared** to touch
   code / `main` / DB / env / deploys. Do non-conflicting work only
   (drafting content, planning) and **tell the human** what you want to
   change. **Do not push to `main`. Do not deploy. Do not run migrations or
   alter the DB.**
3. If it is free or held by you, claim it: write your agent name, a UTC
   timestamp, and scope. Then proceed.
4. **Release it** (set holder to `none`) when you finish.

A held lock that is clearly stale (> 24h, no activity) may be taken over,
but announce it in the commit message.

## 2. Production invariants — do NOT override

- **Database.** src-website runs on its **own** Neon project
  `src-website-db` (id `damp-mountain-49321058`). **Never** repoint
  `DATABASE_URL` at `neon-sky-clock` — that is **vncprm's** database;
  sharing it caused the original schema-collision outage. Prod = `main`
  branch (pooled + `pgbouncer=true`); Preview/Dev = `preview` branch.
- **Migrations.** All schema changes go through Prisma **migration files**
  applied by the build's `prisma migrate deploy` (now over `DIRECT_URL`,
  the unpooled host — required because Prisma's migration locks are
  unreliable through Neon's PgBouncer pooler). **Do not** hand-`ALTER TABLE`
  production. **Do not** seed `_prisma_migrations` with fake checksums —
  use `prisma migrate resolve --applied <name>`. The DB is already
  baselined and `migrate status` is clean.
- **Ingestion `/api/reports`.** Keep the guard `internalTicketReason()`
  (rejects internal issue-tracker tickets with HTTP 422). Keep the GET
  treating the ingestion key as privileged (so POST→GET verification sees
  freshly-ingested `pending` rows). **Only post finished editorial
  reports** — never issue-tracker tickets, tasks, or test rows.
- **Never echo secrets.** Do not return any part of a connection string or
  env var from an endpoint. The `?diag=1` endpoint leaked the production DB
  password and forced a credential rotation.
- **No temp admin endpoints on prod.** `run-migration`, `purge-internal`,
  `backfill-*`, "temp secret fallback", diagnostic routes, etc. must not be
  left live. Remove them after use.

## 3. Deploys

`main` auto-deploys to production. The build is
`tsx scripts/fix-migrations.ts && prisma migrate deploy && next build`.
A failing migration **fails the build on purpose** — do not bypass it.

## 4. SRC-505 ("writes succeed but reads miss them") — RESOLVED, do not reopen

Root cause was **not** a stale bundle or connection-pool issue; POSTs always
persisted. The GET endpoint only returned `published` rows to non-admin
keys, so a POST→GET verification using the ingestion key never saw the new
`pending` row. Fixed by making the ingestion key privileged for reads. Do
**not** reintroduce transactional/bundle workarounds for this symptom.
