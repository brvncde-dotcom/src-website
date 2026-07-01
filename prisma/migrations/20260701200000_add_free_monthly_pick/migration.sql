-- Free tier: mark one report per month as complimentary full access for free users
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "isFreeMonthlyPick" BOOLEAN NOT NULL DEFAULT FALSE;
