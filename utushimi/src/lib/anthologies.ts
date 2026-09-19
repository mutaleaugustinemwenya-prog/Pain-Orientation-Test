import "server-only";
import { prisma } from "@/lib/prisma";

export async function getFeaturedAnthologies(limit = 3) {
  return prisma.anthologyTitle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPublishedAnthologies() {
  return prisma.anthologyTitle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}
