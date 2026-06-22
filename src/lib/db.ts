import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const VALID_SECTIONS = [
  "ai-digital-infrastructure",
  "geo-strategy",
  "energy",
  "agriculture",
  "migration",
] as const;

export type Section = (typeof VALID_SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  "ai-digital-infrastructure": "AI & Digital Infrastructure",
  "geo-strategy": "Geo-Strategy",
  energy: "Energy",
  agriculture: "Agriculture",
  migration: "Migration",
};

export const VALID_TYPES = [
  "Analysis",
  "Strategy Paper",
  "Statement",
  "Brief",
  "Report",
] as const;

export const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "published",
] as const;

// Simple API key check for report ingestion
// In production, replace with proper auth (NextAuth, etc.)
export function validateIngestionKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const apiKey = process.env.INGESTION_API_KEY;
  if (!apiKey) {
    // If no key is configured, allow all (dev mode)
    return true;
  }

  const token = authHeader.replace("Bearer ", "");
  return token === apiKey;
}

// Simple admin key check for review operations
export function validateAdminKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return true;

  const token = authHeader.replace("Bearer ", "");
  return token === adminKey;
}