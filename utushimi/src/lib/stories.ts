import "server-only";
import { prisma } from "@/lib/prisma";
import type { Genre } from "@/generated/prisma/enums";

export const STORIES_PAGE_SIZE = 12;

export type StorySort = "newest" | "price_asc" | "price_desc";

export async function getPublishedStories(options: {
  genre?: Genre;
  sort?: StorySort;
  page?: number;
}) {
  const page = Math.max(1, options.page ?? 1);
  const orderBy =
    options.sort === "price_asc"
      ? { priceNgwee: "asc" as const }
      : options.sort === "price_desc"
        ? { priceNgwee: "desc" as const }
        : { publishedAt: "desc" as const };

  const where = {
    status: "APPROVED" as const,
    ...(options.genre ? { genre: options.genre } : {}),
  };

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy,
      skip: (page - 1) * STORIES_PAGE_SIZE,
      take: STORIES_PAGE_SIZE,
      include: { writer: { select: { name: true } } },
    }),
    prisma.story.count({ where }),
  ]);

  return { stories, total, page, pageCount: Math.max(1, Math.ceil(total / STORIES_PAGE_SIZE)) };
}

export async function getPlatformStats() {
  const [storyCount, writerCount, completedPurchaseCount] = await Promise.all([
    prisma.story.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { role: "WRITER" } }),
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
  ]);
  return { storyCount, writerCount, completedPurchaseCount };
}

/** Which of the given story ids the reader has already unlocked, for grid/detail status stamps. */
export async function getUnlockedStoryIds(readerId: string | undefined, storyIds: string[]) {
  if (!readerId || storyIds.length === 0) return new Set<string>();
  const purchases = await prisma.purchase.findMany({
    where: { readerId, storyId: { in: storyIds }, status: "COMPLETED" },
    select: { storyId: true },
  });
  return new Set(purchases.map((p) => p.storyId));
}
