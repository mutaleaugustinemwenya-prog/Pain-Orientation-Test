import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { formatNgweeAsKwacha } from "@/lib/money";
import { StatusStamp } from "@/components/ui/status-stamp";

export default async function AdminAnthologiesPage() {
  await requireRole("ADMIN");

  const anthologies = await prisma.anthologyTitle.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono-label text-[0.65rem] text-accent-strong">Mockingbird Digital</p>
          <h1 className="font-display mt-1 text-3xl text-text-primary">Anthology Storefront</h1>
        </div>
        <Link
          href="/admin/anthologies/new"
          className="mono-label border border-accent px-5 py-3 text-xs text-accent-strong hover:bg-accent hover:text-text-primary"
        >
          Add Title
        </Link>
      </div>

      <div className="mt-8 divide-y divide-rule border border-rule bg-panel">
        {anthologies.length === 0 && (
          <p className="p-10 text-center text-sm text-text-muted">No anthology titles yet.</p>
        )}
        {anthologies.map((a) => (
          <Link
            key={a.id}
            href={`/admin/anthologies/${a.id}/edit`}
            className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-ink/40"
          >
            <div>
              <p className="font-display text-lg text-text-primary">{a.title}</p>
              <p className="mono-label mt-1 text-[0.65rem] text-text-faint">
                {formatNgweeAsKwacha(a.priceNgwee)} · {a.readTimeMinutes} MIN
              </p>
            </div>
            <StatusStamp label={a.published ? "Published" : "Draft"} tone={a.published ? "approved" : "pending"} />
          </Link>
        ))}
      </div>
    </div>
  );
}
