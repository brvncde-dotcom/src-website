import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, canAccessContent } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  const briefs = await prisma.report.findMany({
    where: {
      type: "Daily Brief",
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      publishedAt: true,
      author: true,
      isFreeMonthlyPick: true,
      minTierId: true,
      ...(isAdmin ? { reviewNote: true } : {}),
    },
  });

  const result = await Promise.all(
    briefs.map(async (brief) => {
      const access = await canAccessContent(userId, {
        minTierId: brief.minTierId,
        publishedAt: brief.publishedAt,
        isFreeMonthlyPick: brief.isFreeMonthlyPick,
      });

      return {
        id: brief.id,
        title: brief.title,
        summary: brief.summary,
        publishedAt: brief.publishedAt,
        author: brief.author,
        isFreeMonthlyPick: brief.isFreeMonthlyPick,
        // Full content only when access is "full"
        content: access.access === "full" ? brief.content : null,
        accessLevel: access.access,
        accessReason: access.reason,
      };
    })
  );

  return NextResponse.json({ briefs: result });
}
