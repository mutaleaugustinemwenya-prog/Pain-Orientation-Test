import "server-only";
import { prisma } from "@/lib/prisma";
import { getMinPayoutThresholdNgwee } from "@/lib/money";

/**
 * Ledger entries move HELD -> ELIGIBLE once their holdback window has passed. There's no
 * background job in this app yet, so we advance them lazily whenever the admin payouts page
 * (or anything else that needs an accurate balance) is loaded.
 */
export async function advanceEligibleLedgerEntries() {
  await prisma.payoutLedgerEntry.updateMany({
    where: { status: "HELD", eligibleAt: { lte: new Date() } },
    data: { status: "ELIGIBLE" },
  });
}

export async function getPayoutCandidates() {
  await advanceEligibleLedgerEntries();

  const grouped = await prisma.payoutLedgerEntry.groupBy({
    by: ["writerProfileId"],
    where: { status: "ELIGIBLE" },
    _sum: { amountNgwee: true },
  });

  const threshold = getMinPayoutThresholdNgwee();
  const writerProfiles = await prisma.writerProfile.findMany({
    where: { id: { in: grouped.map((g) => g.writerProfileId) } },
    include: { user: { select: { name: true, email: true } } },
  });
  const profileById = new Map(writerProfiles.map((p) => [p.id, p]));

  return grouped
    .map((g) => {
      const profile = profileById.get(g.writerProfileId);
      const eligibleNgwee = g._sum.amountNgwee ?? 0;
      return profile
        ? {
            writerProfileId: g.writerProfileId,
            writerName: profile.user.name,
            writerEmail: profile.user.email,
            payoutPhone: profile.payoutPhone,
            payoutNetwork: profile.payoutNetwork,
            eligibleNgwee,
            meetsThreshold: eligibleNgwee >= threshold,
          }
        : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.eligibleNgwee - a.eligibleNgwee);
}

export async function getLedgerReconciliation(limit = 50) {
  return prisma.payoutLedgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      purchase: { include: { story: { select: { title: true } } } },
      writerProfile: { include: { user: { select: { name: true } } } },
    },
  });
}

export async function getRecentPayouts(limit = 20) {
  return prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { writerProfile: { include: { user: { select: { name: true } } } } },
  });
}
