-- CreateTable
CREATE TABLE "OperationalRecord" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "data" JSONB NOT NULL DEFAULT '{}',
    "eventAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationalRecord_facilityId_module_status_idx"
ON "OperationalRecord"("facilityId", "module", "status");

-- CreateIndex
CREATE INDEX "OperationalRecord_facilityId_eventAt_idx"
ON "OperationalRecord"("facilityId", "eventAt");

-- AddForeignKey
ALTER TABLE "OperationalRecord"
ADD CONSTRAINT "OperationalRecord_facilityId_fkey"
FOREIGN KEY ("facilityId") REFERENCES "Facility"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
