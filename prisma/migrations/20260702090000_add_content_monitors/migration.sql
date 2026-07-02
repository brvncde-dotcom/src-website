-- CreateTable
CREATE TABLE "ContentMonitor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "sections" TEXT[],
    "types" TEXT[],
    "languages" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorMatch" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "matchedOn" TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentMonitor_userId_idx" ON "ContentMonitor"("userId");

-- CreateIndex
CREATE INDEX "ContentMonitor_isActive_idx" ON "ContentMonitor"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MonitorMatch_monitorId_reportId_key" ON "MonitorMatch"("monitorId", "reportId");

-- CreateIndex
CREATE INDEX "MonitorMatch_monitorId_idx" ON "MonitorMatch"("monitorId");

-- CreateIndex
CREATE INDEX "MonitorMatch_reportId_idx" ON "MonitorMatch"("reportId");

-- CreateIndex
CREATE INDEX "MonitorMatch_isRead_idx" ON "MonitorMatch"("isRead");

-- CreateIndex
CREATE INDEX "MonitorMatch_createdAt_idx" ON "MonitorMatch"("createdAt");

-- AddForeignKey
ALTER TABLE "ContentMonitor" ADD CONSTRAINT "ContentMonitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorMatch" ADD CONSTRAINT "MonitorMatch_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "ContentMonitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorMatch" ADD CONSTRAINT "MonitorMatch_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
