import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { formatNgweeAsKwacha } from "@/lib/money";
import { getPayoutCandidates } from "@/lib/payouts";

export default async function AdminOverviewPage() {
  await requireRole("ADMIN");

  const [pendingCount, storyCount, salesAgg, payoutCandidates] = await Promise.all([
    prisma.story.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.story.count({ where: { status: "APPROVED" } }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amountNgwee: true, platformCutNgwee: true },
      _count: true,
    }),
    getPayoutCandidates(),
  ]);

  const readyForPayout = payoutCandidates.filter((c) => c.meetsThreshold).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">Editorial Desk</p>
      <h1 className="font-display mt-1 text-3xl text-text-primary">Admin Overview</h1>

      <div className="mono-label mt-8 grid grid-cols-1 divide-y divide-rule border border-rule bg-panel text-center sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">{pendingCount}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Awaiting Review</p>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">{storyCount}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Live Stories</p>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">
            {formatNgweeAsKwacha(salesAgg._sum.amountNgwee ?? 0)}
          </p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Gross Sales ({salesAgg._count})</p>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">{readyForPayout}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Writers Ready For Payout</p>
        </div>
      </div>

      <div className="mono-label mt-8 flex flex-wrap gap-4 text-xs">
        <Link href="/admin/review" className="border border-accent px-5 py-3 text-accent-strong hover:bg-accent hover:text-text-primary">
          Review Queue ({pendingCount})
        </Link>
        <Link href="/admin/payouts" className="border border-input-border px-5 py-3 text-text-muted hover:border-accent">
          Payout Ledger
        </Link>
        <Link href="/admin/anthologies" className="border border-input-border px-5 py-3 text-text-muted hover:border-accent">
          Anthology Storefront
        </Link>
      </div>
    </div>
  );
}
