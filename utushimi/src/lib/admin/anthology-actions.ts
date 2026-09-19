"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { kwachaToNgwee } from "@/lib/money";

export interface AnthologyFormState {
  error?: string;
}

const anthologySchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters."),
    priceKwacha: z.coerce.number().positive("Price must be greater than zero."),
    coverText: z.string().trim().min(20, "Cover text must be at least 20 characters."),
    body: z.string().trim().min(200, "Body must be at least 200 characters."),
    readTimeMinutes: z.coerce.number().int().positive("Read time must be a positive number."),
    previewCutoff: z.coerce.number().int().positive("Preview length must be a positive number."),
    published: z.coerce.boolean().optional(),
  })
  .refine((data) => data.previewCutoff < data.body.length, {
    message: "Preview length must be shorter than the full text.",
    path: ["previewCutoff"],
  });

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "anthology"
  );
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  const existing = await prisma.anthologyTitle.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${randomUUID().slice(0, 6)}`;
}

export async function createAnthology(
  _prevState: AnthologyFormState,
  formData: FormData,
): Promise<AnthologyFormState> {
  await requireRole("ADMIN");

  const parsed = anthologySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const slug = await uniqueSlug(parsed.data.title);

  const anthology = await prisma.anthologyTitle.create({
    data: {
      title: parsed.data.title,
      slug,
      priceNgwee: kwachaToNgwee(parsed.data.priceKwacha),
      coverText: parsed.data.coverText,
      body: parsed.data.body,
      readTimeMinutes: parsed.data.readTimeMinutes,
      previewCutoff: parsed.data.previewCutoff,
      published: !!parsed.data.published,
      publishedAt: parsed.data.published ? new Date() : null,
    },
  });

  redirect(`/admin/anthologies/${anthology.id}/edit`);
}

export async function updateAnthology(
  id: string,
  _prevState: AnthologyFormState,
  formData: FormData,
): Promise<AnthologyFormState> {
  await requireRole("ADMIN");

  const parsed = anthologySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const existing = await prisma.anthologyTitle.findUnique({ where: { id } });
  if (!existing) return { error: "Title not found." };

  const nowPublishing = !!parsed.data.published && !existing.published;

  await prisma.anthologyTitle.update({
    where: { id },
    data: {
      title: parsed.data.title,
      priceNgwee: kwachaToNgwee(parsed.data.priceKwacha),
      coverText: parsed.data.coverText,
      body: parsed.data.body,
      readTimeMinutes: parsed.data.readTimeMinutes,
      previewCutoff: parsed.data.previewCutoff,
      published: !!parsed.data.published,
      publishedAt: nowPublishing ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/admin/anthologies");
  return {};
}

export async function deleteAnthology(id: string) {
  await requireRole("ADMIN");
  await prisma.anthologyTitle.delete({ where: { id } });
  revalidatePath("/admin/anthologies");
  redirect("/admin/anthologies");
}
