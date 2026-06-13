-- Apply after the enum-value migration has committed.
ALTER TABLE "Subscription"
ALTER COLUMN "status" SET DEFAULT 'CREATED';
