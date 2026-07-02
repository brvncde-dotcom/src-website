-- Ingestion observability: every POST /api/reports attempt (accepted,
-- rejected, errored, unauthorized) writes one row. Answers "did Paperclip's
-- push ever arrive, and if so why isn't it in the review queue?"

CREATE TABLE "IngestionLog" (
    "id" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "reason" TEXT,
    "code" TEXT,
    "httpStatus" INTEGER NOT NULL,
    "title" TEXT,
    "sourceRef" TEXT,
    "language" TEXT,
    "type" TEXT,
    "section" TEXT,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IngestionLog_createdAt_idx" ON "IngestionLog"("createdAt");
CREATE INDEX "IngestionLog_outcome_idx" ON "IngestionLog"("outcome");
CREATE INDEX "IngestionLog_sourceRef_idx" ON "IngestionLog"("sourceRef");
