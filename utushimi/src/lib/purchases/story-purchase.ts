"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { getPaymentProvider } from "@/lib/payments";
import { splitSaleNgwee } from "@/lib/money";

export interface PurchaseActionState {
  error?: string;
}

const purchaseSchema = z.object({
  storyId: z.string().min(1),
  network: z.enum(["MTN", "AIRTEL"]),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid Mobile Money number.")
    .regex(/^[0-9+ ]+$/, "Enter a valid Mobile Money number."),
});

export async function initiateStoryPurchase(
  _prevState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const user = await requireUser();

  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const story = await prisma.story.findUnique({ where: { id: parsed.data.storyId } });
  if (!story || story.status !== "APPROVED") {
    return { error: "This story is not available for purchase." };
  }

  const alreadyUnlocked = await prisma.purchase.findFirst({
    where: { readerId: user.id, storyId: story.id, status: "COMPLETED" },
  });
  if (alreadyUnlocked) redirect(`/stories/${story.slug}`);

  const { platformCutNgwee, writerCutNgwee } = splitSaleNgwee(story.priceNgwee);
  const provider = getPaymentProvider();

  const purchase = await prisma.purchase.create({
    data: {
      readerId: user.id,
      storyId: story.id,
      amountNgwee: story.priceNgwee,
      platformCutNgwee,
      writerCutNgwee,
      network: parsed.data.network,
      phone: parsed.data.phone,
      provider: provider.id,
      status: "PENDING",
    },
  });

  const handle = await provider.collect({
    amountNgwee: story.priceNgwee,
    network: parsed.data.network,
    phone: parsed.data.phone,
    reference: purchase.id,
    narrative: `Utushimi — ${story.title}`,
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { providerRef: handle.providerRef },
  });

  redirect(`/stories/${story.slug}?purchase=${purchase.id}`);
}
