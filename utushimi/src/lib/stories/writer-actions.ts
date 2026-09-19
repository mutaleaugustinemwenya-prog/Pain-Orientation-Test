"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { kwachaToNgwee } from "@/lib/money";
import { GENRES } from "@/lib/genres";

export interface StoryFormState {
  error?: string;
}

const storySchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters."),
    genre: z.enum(GENRES as [string, ...string[]], { message: "Choose a genre." }),
    priceKwacha: z.coerce.number().positive("Price must be greater than zero."),
    coverText: z.string().trim().min(20, "Cover text must be at least 20 characters."),
    body: z.string().trim().min(200, "Story body must be at least 200 characters."),
    readTimeMinutes: z.coerce.number().int().positive("Read time must be a positive number."),
    previewCutoff: z.coerce.number().int().positive("Preview length must be a positive number."),
  })
  .refine((data) => data.previewCutoff < data.body.length, {
    message: "Preview length must be shorter than the full story.",
    path: ["previewCutoff"],
  });

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "story"
  );
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  const existing = await prisma.story.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${randomUUID().slice(0, 6)}`;
}

export async function createStory(_prevState: StoryFormState, formData: FormData): Promise<StoryFormState> {
  const user = await requireRole("WRITER");

  const parsed = storySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const slug = await uniqueSlug(parsed.data.title);

  const story = await prisma.story.create({
    data: {
      writerId: user.id,
      title: parsed.data.title,
      slug,
      genre: parsed.data.genre as (typeof GENRES)[number],
      priceNgwee: kwachaToNgwee(parsed.data.priceKwacha),
      coverText: parsed.data.coverText,
      body: parsed.data.body,
      readTimeMinutes: parsed.data.readTimeMinutes,
      previewCutoff: parsed.data.previewCutoff,
      status: "PENDING_REVIEW",
    },
  });

  redirect(`/writer/stories/${story.id}`);
}

const payoutSettingsSchema = z.object({
  payoutNetwork: z.enum(["MTN", "AIRTEL"]),
  payoutPhone: z
    .string()
    .trim()
    .min(9, "Enter a valid Mobile Money number.")
    .regex(/^[0-9+ ]+$/, "Enter a valid Mobile Money number."),
});

export async function updatePayoutSettings(
  _prevState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const user = await requireRole("WRITER");

  const parsed = payoutSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payout details." };
  }

  await prisma.writerProfile.update({
    where: { userId: user.id },
    data: { payoutNetwork: parsed.data.payoutNetwork, payoutPhone: parsed.data.payoutPhone },
  });

  return {};
}

export async function resubmitStory(
  storyId: string,
  _prevState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const user = await requireRole("WRITER");

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story || story.writerId !== user.id) {
    return { error: "Story not found." };
  }
  if (story.status !== "REJECTED") {
    return { error: "Only rejected stories can be edited and resubmitted." };
  }

  const parsed = storySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  await prisma.story.update({
    where: { id: story.id },
    data: {
      title: parsed.data.title,
      genre: parsed.data.genre as (typeof GENRES)[number],
      priceNgwee: kwachaToNgwee(parsed.data.priceKwacha),
      coverText: parsed.data.coverText,
      body: parsed.data.body,
      readTimeMinutes: parsed.data.readTimeMinutes,
      previewCutoff: parsed.data.previewCutoff,
      status: "PENDING_REVIEW",
      rejectionNotes: null,
      submittedAt: new Date(),
    },
  });

  redirect(`/writer/stories/${story.id}`);
}
