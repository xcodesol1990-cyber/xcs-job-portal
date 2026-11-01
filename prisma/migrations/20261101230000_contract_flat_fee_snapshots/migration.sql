-- AlterTable contracts for WorkWasl flat $1 fee model
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "client_fee_cents" BIGINT NOT NULL DEFAULT 100;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "freelancer_fee_cents" BIGINT NOT NULL DEFAULT 100;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "fee_policy_version" TEXT NOT NULL DEFAULT 'v1_flat_1_dollar';
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "client_fee_charged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "freelancer_fee_charged" BOOLEAN NOT NULL DEFAULT false;
