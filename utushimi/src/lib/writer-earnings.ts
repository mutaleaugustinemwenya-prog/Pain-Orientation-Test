import "server-only";
import { prisma } from "@/lib/prisma";

export async function getWriterEarnings(writerProfileId: string) {
  const grouped = await prisma.payoutLedgerEntry.groupBy({
    by: ["status"],
    where: { writerProfileId },
    _sum: { amountNgwee: true },
  });

  const sums = { HELD: 0, ELIGIBLE: 0, PAID: 0 } as Record<"HELD" | "ELIGIBLE" | "PAID", number>;
  for (const row of grouped) {
    sums[row.status] = row._sum.amountNgwee ?? 0;
  }

  return {
    heldNgwee: sums.HELD,
    eligibleNgwee: sums.ELIGIBLE,
    paidNgwee: sums.PAID,
    lifetimeNgwee: sums.HELD + sums.ELIGIBLE + sums.PAID,
  };
}

export async function getWriterStories(writerId: string) {
  return prisma.story.findMany({
    where: { writerId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchases: { where: { status: "COMPLETED" } } } } },
  });
}
