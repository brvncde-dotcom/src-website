-- Board Preview: token-gated draft preview links
ALTER TABLE "Report" ADD COLUMN "previewToken" TEXT;
CREATE UNIQUE INDEX "Report_previewToken_key" ON "Report"("previewToken");
