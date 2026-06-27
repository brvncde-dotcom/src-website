import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TIERS = [
  {
    slug: "observer",
    name: "Observer",
    priceMonthlyChf: 0,
    priceAnnualChf: 0,
    maxReportsMonthly: 10,
    archiveMonths: 6,
    hasPdfDownload: false,
    hasEarlyAccess: false,
    earlyAccessHours: 0,
    hasLiveCalls: false,
    hasBreakingAlerts: false,
    hasBespokeResearch: false,
    bespokeRequestsPerYear: 0,
    hasDedicatedManager: false,
    sortOrder: 0,
    isPublic: true,
  },
  {
    slug: "essential",
    name: "Essential",
    priceMonthlyChf: 29,
    priceAnnualChf: 290,
    maxReportsMonthly: null,
    archiveMonths: 12,
    hasPdfDownload: true,
    hasEarlyAccess: false,
    earlyAccessHours: 0,
    hasLiveCalls: false,
    hasBreakingAlerts: false,
    hasBespokeResearch: false,
    bespokeRequestsPerYear: 0,
    hasDedicatedManager: false,
    sortOrder: 1,
    isPublic: true,
  },
  {
    slug: "professional",
    name: "Professional",
    priceMonthlyChf: 79,
    priceAnnualChf: 790,
    maxReportsMonthly: null,
    archiveMonths: 0,
    hasPdfDownload: true,
    hasEarlyAccess: true,
    earlyAccessHours: 24,
    hasLiveCalls: false,
    hasBreakingAlerts: false,
    hasBespokeResearch: false,
    bespokeRequestsPerYear: 0,
    hasDedicatedManager: false,
    sortOrder: 2,
    isPublic: true,
  },
  {
    slug: "executive",
    name: "Executive",
    priceMonthlyChf: 149,
    priceAnnualChf: 1490,
    maxReportsMonthly: null,
    archiveMonths: 0,
    hasPdfDownload: true,
    hasEarlyAccess: true,
    earlyAccessHours: 0,
    hasLiveCalls: true,
    hasBreakingAlerts: true,
    hasBespokeResearch: true,
    bespokeRequestsPerYear: 4,
    hasDedicatedManager: true,
    sortOrder: 3,
    isPublic: true,
  },
] as const;

async function main() {
  console.log("Seeding tiers...");

  for (const tier of TIERS) {
    const result = await prisma.tier.upsert({
      where: { slug: tier.slug },
      update: {
        name: tier.name,
        priceMonthlyChf: tier.priceMonthlyChf,
        priceAnnualChf: tier.priceAnnualChf,
        maxReportsMonthly: tier.maxReportsMonthly,
        archiveMonths: tier.archiveMonths,
        hasPdfDownload: tier.hasPdfDownload,
        hasEarlyAccess: tier.hasEarlyAccess,
        earlyAccessHours: tier.earlyAccessHours,
        hasLiveCalls: tier.hasLiveCalls,
        hasBreakingAlerts: tier.hasBreakingAlerts,
        hasBespokeResearch: tier.hasBespokeResearch,
        bespokeRequestsPerYear: tier.bespokeRequestsPerYear,
        hasDedicatedManager: tier.hasDedicatedManager,
        sortOrder: tier.sortOrder,
        isPublic: tier.isPublic,
      },
      create: {
        slug: tier.slug,
        name: tier.name,
        priceMonthlyChf: tier.priceMonthlyChf,
        priceAnnualChf: tier.priceAnnualChf,
        maxReportsMonthly: tier.maxReportsMonthly,
        archiveMonths: tier.archiveMonths,
        hasPdfDownload: tier.hasPdfDownload,
        hasEarlyAccess: tier.hasEarlyAccess,
        earlyAccessHours: tier.earlyAccessHours,
        hasLiveCalls: tier.hasLiveCalls,
        hasBreakingAlerts: tier.hasBreakingAlerts,
        hasBespokeResearch: tier.hasBespokeResearch,
        bespokeRequestsPerYear: tier.bespokeRequestsPerYear,
        hasDedicatedManager: tier.hasDedicatedManager,
        sortOrder: tier.sortOrder,
        isPublic: tier.isPublic,
      },
    });
    console.log(`  ✓ ${result.name} (${result.slug})`);
  }

  console.log("Done seeding tiers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
