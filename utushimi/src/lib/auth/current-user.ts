import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

/**
 * Reads and verifies the session cookie, then loads the current user from the database so
 * role/name reflect live state rather than a stale JWT claim. Memoized per-request with
 * React's `cache()` so multiple Server Components calling this only hit the DB once.
 */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { writerProfile: true },
  });
});

/**
 * Use in Server Components / layouts to gate a page. Every Server Action must ALSO call this
 * (or `requireRole`) independently — the proxy route guard is a UX convenience, not a security
 * boundary, since a matcher change could silently stop covering a route.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect("/");
  return user;
}
