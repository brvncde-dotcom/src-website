-- User profile picture (stored as a small data URL; no external storage)
ALTER TABLE "User" ADD COLUMN "image" TEXT;
