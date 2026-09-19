"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { getPaymentProvider } from "@/lib/payments";
import { getMinPayoutThresholdNgwee } from "@/lib/money";
import { advanceEligibleLedgerEntries } from "@/lib/payouts";

export interface AdminActionState {
  error?: string;
  success?: string;
}

const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().trim().optional(),
});

export async function reviewStory(
  storyId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN");

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid review submission." };

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story || story.status !== "PENDING_REVIEW") {
    return { error: "This story is no longer awaiting review." };
  }

  if (parsed.data.decision === "REJECT" && !parsed.data.notes) {
    return { error: "Notes are required when rejecting a submission." };
  }

  await prisma.$transaction([
    prisma.story.update({
      where: { id: story.id },
      data:
        parsed.data.decision === "APPROVE"
          ? { status: "APPROVED", publishedAt: new Date(), rejectionNotes: null }
          : { status: "REJECTED", rejectionNotes: parsed.data.notes },
    }),
    prisma.reviewAction.create({
      data: {
        storyId: story.id,
        adminId: admin.id,
        decision: parsed.data.decision,
        notes: parsed.data.notes || null,
      },
    }),
  ]);

  revalidatePath("/admin/review");
  return { success: `Story ${parsed.data.decision === "APPROVE" ? "approved" : "rejected"}.` };
}

export async function triggerPayout(
  writerProfileId: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN");
  await advanceEligibleLedgerEntries();

  const writerProfile = await prisma.writerProfile.findUnique({ where: { id: writerProfileId } });
  if (!writerProfile) return { error: "Writer not found." };
  if (!writerProfile.payoutPhone || !writerProfile.payoutNetwork) {
    return { error: "This writer has not set a payout phone number and network yet." };
  }

  const eligibleEntries = await prisma.payoutLedgerEntry.findMany({
    where: { writerProfileId, status: "ELIGIBLE" },
  });
  const totalNgwee = eligibleEntries.reduce((sum, e) => sum + e.amountNgwee, 0);

  if (totalNgwee < getMinPayoutThresholdNgwee()) {
    return { error: "Balance is below the minimum payout threshold." };
  }
  if (eligibleEntries.length === 0) {
    return { error: "No eligible balance to pay out." };
  }

  const provider = getPaymentProvider();

  const payout = await prisma.payout.create({
    data: {
      writerProfileId,
      totalAmountNgwee: totalNgwee,
      status: "PROCESSING",
      network: writerProfile.payoutNetwork,
      phone: writerProfile.payoutPhone,
      provider: provider.id,
      triggeredById: admin.id,
    },
  });

  const result = await provider.disburse({
    amountNgwee: totalNgwee,
    network: writerProfile.payoutNetwork,
    phone: writerProfile.payoutPhone,
    reference: payout.id,
    narrative: "Utushimi writer payout",
  });

  // Mock disburse() always resolves to PAID or FAILED synchronously. A real aggregator whose
  // disbursement API is itself async (PROCESSING) would need a status webhook/poll — like
  // collection's checkCollectionStatus — before these ledger entries can be marked PAID.
  await prisma.$transaction([
    prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: result.status === "PAID" ? "PAID" : result.status === "PROCESSING" ? "PROCESSING" : "FAILED",
        providerRef: result.providerRef,
        failureReason: result.failureReason,
        paidAt: result.status === "PAID" ? new Date() : null,
      },
    }),
    ...(result.status === "PAID"
      ? [
          prisma.payoutLedgerEntry.updateMany({
            where: { id: { in: eligibleEntries.map((e) => e.id) } },
            data: { status: "PAID", payoutId: payout.id },
          }),
        ]
      : []),
  ]);

  revalidatePath("/admin/payouts");

  if (result.status === "FAILED") {
    return { error: `Payout failed: ${result.failureReason ?? "unknown reason"}` };
  }
  return { success: "Payout sent." };
}
