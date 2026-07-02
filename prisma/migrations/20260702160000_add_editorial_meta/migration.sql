-- "The SRC Position" editorial payload, 1:1 with a Report.
-- Present only for editorial content (type "Editorial" / legacy "Opinion").

CREATE TABLE "EditorialMeta" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "subBrand" TEXT NOT NULL DEFAULT 'position-paper',
    "thesis" TEXT,
    "facts" JSONB,
    "analysis" TEXT,
    "roomForDisagreement" TEXT,
    "theAsk" TEXT,
    "authorTitle" TEXT,
    "authorCreds" TEXT,
    "authorLinkedin" TEXT,
    "authorTwitter" TEXT,
    "methodology" TEXT,
    "sourcesCount" INTEGER,
    "conflicts" TEXT,
    "videoUrl" TEXT,
    "videoDuration" INTEGER,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorialMeta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EditorialMeta_reportId_key" ON "EditorialMeta"("reportId");
CREATE INDEX "EditorialMeta_subBrand_idx" ON "EditorialMeta"("subBrand");

ALTER TABLE "EditorialMeta" ADD CONSTRAINT "EditorialMeta_reportId_fkey"
    FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
