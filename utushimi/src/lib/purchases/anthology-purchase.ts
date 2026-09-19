"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { getPaymentProvider } from "@/lib/payments";
import type { PurchaseActionState } from "./story-purchase";

const purchaseSchema = z.object({
  anthologyId: z.string().min(1),
  network: z.enum(["MTN", "AIRTEL"]),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid Mobile Money number.")
    .regex(/^[0-9+ ]+$/, "Enter a valid Mobile Money number."),
});

export async function initiateAnthologyPurchase(
  _prevState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const user = await requireUser();

  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const anthology = await prisma.anthologyTitle.findUnique({ where: { id: parsed.data.anthologyId } });
  if (!anthology || !anthology.published) {
    return { error: "This title is not available for purchase." };
  }

  const alreadyUnlocked = await prisma.anthologyPurchase.findFirst({
    where: { readerId: user.id, anthologyId: anthology.id, status: "COMPLETED" },
  });
  if (alreadyUnlocked) redirect(`/anthologies/${anthology.slug}`);

  const provider = getPaymentProvider();

  const purchase = await prisma.anthologyPurchase.create({
    data: {
      readerId: user.id,
      anthologyId: anthology.id,
      amountNgwee: anthology.priceNgwee,
      network: parsed.data.network,
      phone: parsed.data.phone,
      provider: provider.id,
      status: "PENDING",
    },
  });

  const handle = await provider.collect({
    amountNgwee: anthology.priceNgwee,
    network: parsed.data.network,
    phone: parsed.data.phone,
    reference: purchase.id,
    narrative: `Mockingbird Digital — ${anthology.title}`,
  });

  await prisma.anthologyPurchase.update({
    where: { id: purchase.id },
    data: { providerRef: handle.providerRef },
  });

  redirect(`/anthologies/${anthology.slug}?purchase=${purchase.id}`);
}
