-- Read-only feed of published "Digital Power & AI" Daily Briefs.
--
-- Exposes a stable, minimal column contract for external consumers that read
-- this database directly (the VNClagoon partner portal / VNCprm "SRC Background
-- Information" section). Readers query this view instead of the base "Report"
-- table so the schema can evolve without breaking downstream, and so the read
-- surface is scoped to exactly the published Digital Power & AI briefs.

CREATE OR REPLACE VIEW daily_brief_feed AS
SELECT
  r.id,
  r.title,
  r.summary,
  r.content,
  r.author,
  r.language,
  r.section,
  r.code,
  r."sourceRef"   AS source_ref,
  r."publishedAt" AS published_at
FROM "Report" r
WHERE r.type = 'Daily Brief'
  AND r.section = 'digital-power-ai'
  AND r."publishedAt" IS NOT NULL;

-- Grant read access to the dedicated read-only role used by VNCprm, if present.
-- Provision the role out-of-band (kept out of this migration because it needs a
-- password / infra decision):
--
--   CREATE ROLE vncprm_readonly LOGIN PASSWORD '<secret>';
--   GRANT CONNECT ON DATABASE <db>   TO vncprm_readonly;
--   GRANT USAGE   ON SCHEMA public   TO vncprm_readonly;
--
-- The block below is idempotent: it grants SELECT on the view only if the role
-- already exists, so the migration succeeds whether or not the role is set up.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vncprm_readonly') THEN
    GRANT SELECT ON daily_brief_feed TO vncprm_readonly;
  END IF;
END
$$;
