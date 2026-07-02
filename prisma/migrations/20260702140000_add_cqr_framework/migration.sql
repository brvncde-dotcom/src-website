-- SRC-CQR: Content Classification, Qualification & Rating framework
-- See SRC-CQR-IMPLEMENTATION.md

-- CreateTable
CREATE TABLE "WorldviewDomain" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorldviewDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldviewEntry" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'Medium',
    "rationale" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldviewEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkConfig" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "weights" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "flagRules" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentScore" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "frameworkVersion" INTEGER NOT NULL,
    "matrixVersionLabel" TEXT,
    "scoredBy" TEXT NOT NULL DEFAULT 'in-website',
    "value" INTEGER NOT NULL,
    "trustworthiness" INTEGER NOT NULL,
    "sourceBias" INTEGER NOT NULL,
    "worldviewAlignment" INTEGER NOT NULL,
    "corruptionIndex" INTEGER NOT NULL,
    "actionability" INTEGER NOT NULL,
    "rationale" JSONB NOT NULL,
    "composite" DOUBLE PRECISION NOT NULL,
    "flags" TEXT[],
    "recommendedTier" TEXT,
    "recommendedAction" TEXT NOT NULL,
    "contrarianFlag" BOOLEAN NOT NULL DEFAULT false,
    "editorialOverride" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldviewDomain_code_key" ON "WorldviewDomain"("code");

-- CreateIndex
CREATE INDEX "WorldviewEntry_domainId_idx" ON "WorldviewEntry"("domainId");

-- CreateIndex
CREATE INDEX "WorldviewEntry_isActive_idx" ON "WorldviewEntry"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkConfig_version_key" ON "FrameworkConfig"("version");

-- CreateIndex
CREATE INDEX "FrameworkConfig_published_idx" ON "FrameworkConfig"("published");

-- CreateIndex
CREATE UNIQUE INDEX "ContentScore_reportId_frameworkVersion_key" ON "ContentScore"("reportId", "frameworkVersion");

-- CreateIndex
CREATE INDEX "ContentScore_reportId_idx" ON "ContentScore"("reportId");

-- CreateIndex
CREATE INDEX "ContentScore_composite_idx" ON "ContentScore"("composite");

-- AddForeignKey
ALTER TABLE "WorldviewEntry" ADD CONSTRAINT "WorldviewEntry_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "WorldviewDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentScore" ADD CONSTRAINT "ContentScore_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
