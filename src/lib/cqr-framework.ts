/**
 * Loads the current SRC-CQR framework: the published Worldview Matrix + the
 * highest published FrameworkConfig version. Shared by the Paperclip API
 * (GET /api/framework/current), the in-website scorer, and the admin UI.
 */
import { prisma } from "@/lib/db";
import {
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  type WeightTable,
  type Thresholds,
} from "@/lib/cqr-score";

export interface FrameworkMatrixEntry {
  topic: string;
  position: string;
  confidence: string;
  rationale: string;
}
export interface FrameworkMatrixDomain {
  code: string;
  name: string;
  entries: FrameworkMatrixEntry[];
}
export interface FrameworkBundle {
  version: number;
  weights: WeightTable;
  thresholds: Thresholds;
  flagRules: Record<string, unknown>;
  matrix: FrameworkMatrixDomain[];
  updatedAt: string | null;
}

/**
 * Assemble the current framework. Falls back to code defaults when no
 * FrameworkConfig row is published yet (version 0), so the scorer never hard-fails.
 */
export async function getCurrentFramework(): Promise<FrameworkBundle> {
  const [config, domains] = await Promise.all([
    prisma.frameworkConfig.findFirst({
      where: { published: true },
      orderBy: { version: "desc" },
    }),
    prisma.worldviewDomain.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        entries: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: { topic: true, position: true, confidence: true, rationale: true },
        },
      },
    }),
  ]);

  return {
    version: config?.version ?? 0,
    weights: (config?.weights as WeightTable | undefined) ?? DEFAULT_WEIGHTS,
    thresholds: (config?.thresholds as Thresholds | undefined) ?? DEFAULT_THRESHOLDS,
    flagRules: (config?.flagRules as Record<string, unknown> | undefined) ?? {},
    matrix: domains.map((d) => ({ code: d.code, name: d.name, entries: d.entries })),
    updatedAt: config?.createdAt.toISOString() ?? null,
  };
}
