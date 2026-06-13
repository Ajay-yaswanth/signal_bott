-- CreateEnum
CREATE TYPE "MarketSession" AS ENUM ('ASIA', 'LONDON', 'NEW_YORK', 'LATE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Signal"
ADD COLUMN "session" "MarketSession" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "marketSnapshotId" TEXT,
ADD COLUMN "strategyScoreId" TEXT;

-- CreateTable
CREATE TABLE "SignalResult" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "outcome" "SignalResult" NOT NULL,
    "exitPrice" DECIMAL(12,2),
    "points" DECIMAL(10,2),
    "notes" TEXT,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "bid" DECIMAL(12,5) NOT NULL,
    "ask" DECIMAL(12,5) NOT NULL,
    "spreadPoints" DECIMAL(12,5) NOT NULL,
    "pointSize" DECIMAL(12,8) NOT NULL,
    "m1Candles" JSONB NOT NULL,
    "m5Candles" JSONB NOT NULL,
    "m15Candles" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyScore" (
    "id" TEXT NOT NULL,
    "marketSnapshotId" TEXT NOT NULL,
    "direction" "SignalDirection" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "trendScore" INTEGER NOT NULL,
    "smcScore" INTEGER NOT NULL,
    "sessionPassed" BOOLEAN NOT NULL,
    "spreadPassed" BOOLEAN NOT NULL,
    "fairValueGap" BOOLEAN NOT NULL,
    "liquiditySweep" BOOLEAN NOT NULL,
    "orderBlock" BOOLEAN NOT NULL,
    "reasons" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "normalConfidenceMin" INTEGER NOT NULL DEFAULT 76,
    "sniperConfidenceMin" INTEGER NOT NULL DEFAULT 91,
    "maxNormalSignalsPerDay" INTEGER NOT NULL DEFAULT 25,
    "maxSniperSignalsPerDay" INTEGER NOT NULL DEFAULT 8,
    "duplicateWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "strategyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signal_strategyScoreId_key" ON "Signal"("strategyScoreId");

-- CreateIndex
CREATE INDEX "Signal_session_createdAt_idx" ON "Signal"("session", "createdAt");

-- CreateIndex
CREATE INDEX "Signal_marketSnapshotId_idx" ON "Signal"("marketSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalResult_signalId_key" ON "SignalResult"("signalId");

-- CreateIndex
CREATE INDEX "SignalResult_outcome_resolvedAt_idx" ON "SignalResult"("outcome", "resolvedAt");

-- CreateIndex
CREATE INDEX "MarketSnapshot_symbol_capturedAt_idx" ON "MarketSnapshot"("symbol", "capturedAt");

-- CreateIndex
CREATE INDEX "StrategyScore_marketSnapshotId_idx" ON "StrategyScore"("marketSnapshotId");

-- CreateIndex
CREATE INDEX "StrategyScore_direction_confidence_createdAt_idx" ON "StrategyScore"("direction", "confidence", "createdAt");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_marketSnapshotId_fkey" FOREIGN KEY ("marketSnapshotId") REFERENCES "MarketSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_strategyScoreId_fkey" FOREIGN KEY ("strategyScoreId") REFERENCES "StrategyScore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalResult" ADD CONSTRAINT "SignalResult_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyScore" ADD CONSTRAINT "StrategyScore_marketSnapshotId_fkey" FOREIGN KEY ("marketSnapshotId") REFERENCES "MarketSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
