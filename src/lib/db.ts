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
  "Daily Brief",
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

  // NOTE: There is no separate design sign-off step. Board approval IS design
  // approval. This gate is now an automated publish backstop only (clean
  // title/summary + a byline). Kept to stop internal-marker junk going live.
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

// NOTE: Publishing is board-gated by design. There is intentionally NO
// programmatic publish key. Reports are published only by an authenticated
// admin (session or ADMIN_API_KEY) via the panel, or by an allow-listed
// board member from the Telegram approval card (server-side). The Paperclip
// orchestrator/CTO agent is NOT given any publish capability — its role ends
// at ingestion (POST /api/reports with INGESTION_API_KEY → status=pending).
// See PUBLISHING.md for the full workflow and rationale.

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
 * - Free monthly pick + authenticated → full access regardless of tier.
 * - If the report has no minTierId → full access for everyone.
 * - Unauthenticated users get preview access for tier-gated content.
 * - Authenticated users are compared against the report's minTierId by sortOrder.
 */
export async function canAccessContent(
  userId: string | null,
  report: { minTierId?: string | null; publishedAt?: Date | string | null; isFreeMonthlyPick?: boolean }
): Promise<AccessResult> {
  // Free monthly pick — any signed-in user (including free tier) gets full access
  if (report.isFreeMonthlyPick && userId) {
    return { access: "full", reason: "Free monthly pick" };
  }

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
// --- AI Embeddings ---

function buildEmbedText(report: {
  title: string;
  summary: string | null;
  content: string | null;
  author: string | null;
  section: string;
  type: string;
}): string {
  return [
    report.title,
    report.summary,
    report.author ? `Author: ${report.author}` : null,
    `Section: ${report.section}  Type: ${report.type}`,
    report.content,
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 8000);
}

// Generate and store an embedding for a single report. Fire-and-forget safe —
// failures are logged but never bubble up to the publish flow.
export async function embedReport(reportId: string): Promise<void> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return; // no key = skip silently (dev / staging without key)

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { title: true, summary: true, content: true, author: true, section: true, type: true },
    });
    if (!report) return;

    const text = buildEmbedText(report);
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    if (!res.ok) {
      console.error(`[embed] OpenAI error ${res.status} for report ${reportId}`);
      return;
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    const vec = json.data[0].embedding;
    const vecLiteral = `[${vec.join(",")}]`;
    await prisma.$executeRaw`
      UPDATE "Report" SET embedding = ${vecLiteral}::vector WHERE id = ${reportId}
    `;
  } catch (e) {
    console.error(`[embed] failed for report ${reportId}:`, e);
  }
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
