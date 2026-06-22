---
Task ID: 1
Agent: Main Agent
Task: Implement vnOrchestrator report ingestion workflow with 6 focus sections

Work Log:
- Updated Prisma schema with Report model (title, summary, content, type, section, status, sourceRef, author, publishedAt, reviewedBy, reviewedAt, reviewNote)
- Ran prisma db push — Report table created in SQLite
- Created src/lib/db.ts with Prisma singleton, VALID_SECTIONS (6 sections), SECTION_LABELS, VALID_TYPES, VALID_STATUSES, auth helpers
- Created POST /api/reports — vnOrchestrator ingestion endpoint with Bearer auth, section/type validation, auto-sets status=pending
- Created GET /api/reports — public fetches published only; admin key returns all with filter by section/status/limit/offset
- Created PATCH /api/reports/[id] — review actions (approve/reject/publish) + field edits
- Created DELETE /api/reports/[id] — admin delete
- Created /admin/reports page — login with admin key, filter by section/status, approve/reject/publish workflow, expand to view content, delete with confirmation, API usage reference
- Updated homepage: 6 Focus Areas (Digital Power & AI, Geopolitics & Hard Security, Energy & Resources, Climate Environment & Food, Economy & Competitiveness, Society Migration & Institutions), 6 Circles of Competence, DB-driven Publications with fallback, stats updated to 6, FAQ updated
- Added .env with INGESTION_API_KEY and ADMIN_API_KEY placeholders
- Final build passes clean — all 6 routes confirmed

Stage Summary:
- Full report workflow: vnOrchestrator POST → pending → admin approve → publish → public GET
- 6 sections matching user's final taxonomy
- Admin dashboard at /admin/reports for manual review
- API docs embedded in admin page for vnOrchestrator integration
- Build verified: 0 errors, all routes render