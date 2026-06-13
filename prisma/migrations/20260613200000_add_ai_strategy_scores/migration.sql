-- AlterTable
ALTER TABLE "StrategyScore"
ADD COLUMN "liquiditySweepScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "fvgQualityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "orderBlockQualityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rsiScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "adxScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "atrScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sessionScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "newsRiskScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MarketSnapshot"
ADD COLUMN "newsRiskLevel" INTEGER,
ADD COLUMN "newsRiskReason" TEXT;

-- Align default classifications with the AI scoring policy.
ALTER TABLE "AdminSettings"
ALTER COLUMN "normalConfidenceMin" SET DEFAULT 75,
ALTER COLUMN "sniperConfidenceMin" SET DEFAULT 90;
