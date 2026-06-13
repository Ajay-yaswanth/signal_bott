-- Paid trial and recurring pricing structure.
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'PRO', 'PRIME_ELITE');
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY');
CREATE TYPE "TrialAccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'CREATED';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'AUTHENTICATED';

CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "originalAmount" INTEGER NOT NULL,
    "intervalMonths" INTEGER NOT NULL,
    "sniperSignalsDay" INTEGER NOT NULL,
    "normalSignalsMin" INTEGER NOT NULL,
    "normalSignalsMax" INTEGER NOT NULL,
    "targetPerformance" TEXT NOT NULL,
    "mostPopular" BOOLEAN NOT NULL DEFAULT false,
    "razorpayPlanId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrialAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "status" "TrialAccessStatus" NOT NULL DEFAULT 'PENDING',
    "originalAmount" INTEGER NOT NULL DEFAULT 8900,
    "paidAmount" INTEGER NOT NULL DEFAULT 900,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrialAccess_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" DROP COLUMN IF EXISTS "trialEndsAt";

ALTER TABLE "Subscription"
ADD COLUMN "planId" TEXT,
ADD COLUMN "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN "startAt" TIMESTAMP(3),
ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "cancelledAt" TIMESTAMP(3);

ALTER TABLE "Payment"
ADD COLUMN "subscriptionId" TEXT,
ADD COLUMN "trialAccessId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");
CREATE UNIQUE INDEX "Plan_razorpayPlanId_key" ON "Plan"("razorpayPlanId");
CREATE INDEX "Plan_tier_billingCycle_active_idx" ON "Plan"("tier", "billingCycle", "active");
CREATE UNIQUE INDEX "TrialAccess_userId_key" ON "TrialAccess"("userId");
CREATE UNIQUE INDEX "TrialAccess_subscriptionId_key" ON "TrialAccess"("subscriptionId");
CREATE INDEX "TrialAccess_status_endsAt_idx" ON "TrialAccess"("status", "endsAt");
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");
CREATE INDEX "Payment_trialAccessId_idx" ON "Payment"("trialAccessId");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrialAccess" ADD CONSTRAINT "TrialAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrialAccess" ADD CONSTRAINT "TrialAccess_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_trialAccessId_fkey" FOREIGN KEY ("trialAccessId") REFERENCES "TrialAccess"("id") ON DELETE SET NULL ON UPDATE CASCADE;
