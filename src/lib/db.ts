import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Neon serverless requires a WebSocket for HTTP connections
if (typeof WebSocket === "undefined") {
  // @ts-expect-error — ws is a Node WebSocket implementation
  globalThis.WebSocket = ws;
  neonConfig.webSocketConstructor = ws;
}

// --- Prisma Singleton ---
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "";

  // If it's a PostgreSQL URL (Neon / Vercel Postgres), use the Neon adapter
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  // Fallback: direct connection (e.g. local dev with a local Postgres)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- Constants ---
export const VALID_SECTIONS = [
  "digital-power-ai",
  "geopolitics-hard-security",
  "energy-resources",
  "climate-environment-food",
  "economy-competitiveness",
  "society-migration-institutions",
] as const;

export type Section = (typeof VALID_SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  "digital-power-ai": "Digital Power & AI",
  "geopolitics-hard-security": "Geopolitics & Hard Security",
  "energy-resources": "Energy & Resources",
  "climate-environment-food": "Climate, Environment & Food",
  "economy-competitiveness": "Economy & Competitiveness",
  "society-migration-institutions": "Society, Migration & Institutions",
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

// --- Auth helpers ---
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

export function validateAdminKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return true;

  const token = authHeader.replace("Bearer ", "");
  return token === adminKey;
}