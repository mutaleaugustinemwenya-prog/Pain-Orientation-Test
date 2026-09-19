import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPaymentProvider } from "@/lib/payments";
import { getPayoutHoldbackDays } from "@/lib/money";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase || purchase.readerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (purchase.status !== "PENDING") {
    return NextResponse.json({ status: purchase.status });
  }

  const provider = getPaymentProvider();
  const result = await provider.checkCollectionStatus({
    providerRef: purchase.providerRef ?? "",
    initiatedAt: purchase.purchasedAt,
    phone: purchase.phone,
  });

  if (result.status === "PENDING") {
    return NextResponse.json({ status: "PENDING" });
  }

  if (result.status === "FAILED") {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    return NextResponse.json({ status: "FAILED", failureReason: result.failureReason });
  }

  // COMPLETED — record the sale and open the writer's payout ledger entry atomically.
  const completedAt = new Date();
  const eligibleAt = new Date(completedAt.getTime() + getPayoutHoldbackDays() * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "COMPLETED", completedAt },
      });

      const story = await tx.story.findUniqueOrThrow({ where: { id: purchase.storyId } });
      const writerProfile = await tx.writerProfile.findUniqueOrThrow({
        where: { userId: story.writerId },
      });

      await tx.payoutLedgerEntry.create({
        data: {
          purchaseId: purchase.id,
          writerProfileId: writerProfile.id,
          amountNgwee: purchase.writerCutNgwee,
          status: "HELD",
          eligibleAt,
        },
      });
    });
  } catch (err) {
    // A concurrent poll may have already completed this purchase and written the ledger entry.
    const current = await prisma.purchase.findUnique({ where: { id: purchase.id } });
    if (current?.status === "COMPLETED") {
      return NextResponse.json({ status: "COMPLETED" });
    }
    throw err;
  }

  return NextResponse.json({ status: "COMPLETED" });
}
