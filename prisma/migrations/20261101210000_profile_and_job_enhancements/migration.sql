-- AlterTable freelancer_profiles
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "github_url" TEXT;
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "linkedin_url" TEXT;
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "website_url" TEXT;
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "years_of_experience" INTEGER;
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "english_proficiency" TEXT;

-- AlterTable client_profiles
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "company_size" TEXT;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "about" TEXT;
ALTER TABLE "client_profiles" ADD COLUMN IF NOT EXISTS "linkedin_url" TEXT;

-- AlterTable jobs
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "time_commitment" TEXT;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "deliverables" TEXT;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "screening_questions" TEXT[] NOT NULL DEFAULT '{}';
