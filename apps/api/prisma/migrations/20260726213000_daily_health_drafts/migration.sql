ALTER TABLE "DailyHealthReport"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN "createdById" TEXT,
ADD COLUMN "submittedAt" TIMESTAMP(3),
ADD COLUMN "editableUntil" TIMESTAMP(3);

UPDATE "DailyHealthReport"
SET "submittedAt" = "createdAt",
    "editableUntil" = "createdAt";

CREATE INDEX "DailyHealthReport_createdById_status_idx"
ON "DailyHealthReport"("createdById", "status");
