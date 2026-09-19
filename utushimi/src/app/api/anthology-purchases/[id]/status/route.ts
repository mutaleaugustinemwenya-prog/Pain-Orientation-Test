import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPaymentProvider } from "@/lib/payments";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const purchase = await prisma.anthologyPurchase.findUnique({ where: { id } });
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
    await prisma.anthologyPurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    return NextResponse.json({ status: "FAILED", failureReason: result.failureReason });
  }

  // Anthology sales are 100% platform revenue — no writer payout ledger entry to open.
  await prisma.anthologyPurchase.update({
    where: { id: purchase.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  return NextResponse.json({ status: "COMPLETED" });
}
