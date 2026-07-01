import { PrismaClient, Tier } from "@prisma/client";

// --- Prisma Singleton ---
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Standard Prisma Client — works with any PostgreSQL provider
  // (Prisma Postgres, Neon, Vercel Postgres, etc.)
  return new PrismaClient();
}

// Always cache the Prisma client on globalThis to avoid exhausting the
// connection pool in serverless environments (Vercel, Neon, etc.).
// We assign directly to globalThis first, then export, so every module
// that imports this file gets the exact same client instance.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;

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
  "Opinion",
] as const;

export const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "published",
] as const;

export const VALID_LANGUAGES = ["en", "de", "fr", "it"] as const;
export type Language = (typeof VALID_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

// --- Gate 3 (Design Sign-Off) validators ---

const TITLE_HARD_FAIL_PATTERNS = [
  /^\s*\[(HIGH|MEDIUM|LOW|CRITICAL)\]/i,
  /\b(Research|ICT Domain Review|Domain Review|Assessment)\s*:/i,
  /\bSRC-\d+\b/,
  /cross-domain/i,
  /created under/i,
];

const SUMMARY_HARD_FAIL_PATTERNS = [
  /^\*\*Pillar:\*\*/i,
  /\(created under/i,
  /^\s*\[(HIGH|MEDIUM|LOW|CRITICAL)\]/i,
];

export type DesignGateResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateDesignGate(report: {
  title: string;
  summary?: string | null;
  author?: string | null;
  designSignedOffBy?: string | null;
}): DesignGateResult {
  // 1. Title checks
  for (const pattern of TITLE_HARD_FAIL_PATTERNS) {
    if (pattern.test(report.title)) {
      return {
        valid: false,
        reason: `Title fails Gate 3: contains disallowed pattern (${pattern.source}). Clean internal markers, prefixes, and issue references before publishing.`,
      };
    }
  }

  // 2. Summary checks
  if (report.summary) {
    for (const pattern of SUMMARY_HARD_FAIL_PATTERNS) {
      if (pattern.test(report.summary)) {
        return {
          valid: false,
          reason: `Summary fails Gate 3: contains internal scaffolding (${pattern.source}). Rewrite as reader-facing prose.`,
        };
      }
    }
  }

  // 3. Byline present
  if (!report.author || report.author.trim().length === 0) {
    return {
      valid: false,
      reason: "Author/byline is missing. Assign a desk byline before publishing.",
    };
  }

  // 4. Design sign-off recorded
  if (!report.designSignedOffBy || report.designSignedOffBy.trim().length === 0) {
    return {
      valid: false,
      reason: "Design sign-off is missing. Gate 3 requires a recorded sign-off by the Design Director or Editor-in-Chief before publish.",
    };
  }

  return { valid: true };
}

/** Map a report section to a canonical desk byline for backfill. */
export function deskBylineForSection(section: string): string {
  switch (section) {
    case "digital-power-ai":
      return "SRC Digital Power & AI Desk";
    case "geopolitics-hard-security":
      return "SRC Geopolitics & Security Desk";
    case "energy-resources":
      return "SRC Geo-Strategy & Energy Desk";
    case "climate-environment-food":
      return "SRC Climate, Environment & Food Desk";
    case "economy-competitiveness":
      return "SRC Economy & Competitiveness Desk";
    case "society-migration-institutions":
      return "SRC Society, Migration & Institutions Desk";
    default:
      return "SRC Expert Panel";
  }
}

// --- Auth helpers ---
export function validateIngestionKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const apiKey = process.env.INGESTION_API_KEY;
  if (!apiKey) {
    // No key configured: allow only outside production (local dev convenience).
    // In production this fails closed so the endpoint is never left open.
    return process.env.NODE_ENV !== "production";
  }

  const token = authHeader.replace("Bearer ", "");
  return token === apiKey;
}

export function validateAdminKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    // No key configured: allow only outside production (local dev convenience).
    // In production this fails closed so admin endpoints are never left open.
    return process.env.NODE_ENV !== "production";
  }

  // Single canonical admin key only. Do NOT reintroduce SRC_ADMIN_API_KEY or
  // any fallback key name — that path was used to smuggle back the rotated-out
  // weak key 'src-admin-review-2026'.
  const token = authHeader.replace("Bearer ", "");
  return token === apiKey;
}

// Publish-only key for the Paperclip orchestrator (CTO agent).
// Grants ONLY the ability to PATCH a report to status=published.
// Cannot delete, manage users, approve/reject, or read admin data.
// Set PAPERCLIP_PUBLISH_KEY in Vercel env (and Paperclip settings).
// Do NOT share ADMIN_API_KEY with the Paperclip orchestrator.
export function validatePublishKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const key = process.env.PAPERCLIP_PUBLISH_KEY;
  if (!key) return false; // fails closed — must be explicitly configured

  const token = authHeader.replace("Bearer ", "");
  return token === key;
}

// --- Tier helpers ---

/** Look up a tier by its slug */
export async function getTierBySlug(slug: string): Promise<Tier | null> {
  return prisma.tier.findUnique({ where: { slug } });
}

/**
 * Resolve a user's effective tier.
 * Priority: currentTierId > active subscription > active access grant > observer fallback
 */
export async function getUserTier(userId: string): Promise<Tier | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentTierId: true,
      subscriptions: {
        where: { status: "active", currentPeriodEnd: { gte: new Date() } },
        orderBy: { currentPeriodEnd: "desc" },
        take: 1,
        include: { tier: true },
      },
      accessGrants: {
        where: {
          status: "active",
          OR: [
            { isPermanent: true },
            { expiresAt: { gte: new Date() } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { tier: true },
      },
    },
  });

  if (!user) return null;

  // 1. Explicitly assigned tier
  if (user.currentTierId) {
    const tier = await prisma.tier.findUnique({ where: { id: user.currentTierId } });
    if (tier) return tier;
  }

  // 2. Active subscription tier
  if (user.subscriptions.length > 0 && user.subscriptions[0].tier) {
    return user.subscriptions[0].tier;
  }

  // 3. Active access grant tier
  if (user.accessGrants.length > 0 && user.accessGrants[0].tier) {
    return user.accessGrants[0].tier;
  }

  // 4. Fallback: observer tier
  return getTierBySlug("observer");
}

export type AccessResult = {
  access: "full" | "preview" | "denied";
  reason: string;
};

/**
 * Determine whether a user can access a piece of content.
 * - If the report has no minTierId → full access for everyone.
 * - Unauthenticated users get preview access for tier-gated content.
 * - Authenticated users are compared against the report's minTierId by sortOrder.
 */
export async function canAccessContent(
  userId: string | null,
  report: { minTierId?: string; publishedAt?: string }
): Promise<AccessResult> {
  // No tier gate on the report → full access
  if (!report.minTierId) {
    return { access: "full", reason: "No tier restriction" };
  }

  // Not authenticated → preview only
  if (!userId) {
    return { access: "preview", reason: "Authentication required to access this content" };
  }

  const [userTier, reportMinTier] = await Promise.all([
    getUserTier(userId),
    prisma.tier.findUnique({ where: { id: report.minTierId } }),
  ]);

  if (!reportMinTier) {
    // minTierId references a non-existent tier → grant full access
    return { access: "full", reason: "No valid tier restriction" };
  }

  if (!userTier) {
    return { access: "denied", reason: "Unable to determine user tier" };
  }

  // Compare by sortOrder — higher sortOrder = higher tier
  if (userTier.sortOrder >= reportMinTier.sortOrder) {
    return { access: "full", reason: "Tier requirement met" };
  }

  return {
    access: "preview",
    reason: `Requires ${reportMinTier.name} tier or higher`,
  };
}
// --- Admin audit log ---
export async function logAdminAction(entry: {
  actor: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actor: entry.actor,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        detail: entry.detail ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] failed to log admin action:", e);
  }
}
