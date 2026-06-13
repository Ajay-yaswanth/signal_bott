-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('MANUAL', 'NORMAL', 'SNIPER');

-- AlterTable
ALTER TABLE "Signal"
ADD COLUMN "type" "SignalType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "fingerprint" TEXT,
ADD COLUMN "strategyVersion" TEXT,
ADD COLUMN "scannedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Signal_fingerprint_key" ON "Signal"("fingerprint");

-- CreateIndex
CREATE INDEX "Signal_type_createdAt_idx" ON "Signal"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Signal_source_createdAt_idx" ON "Signal"("source", "createdAt");
