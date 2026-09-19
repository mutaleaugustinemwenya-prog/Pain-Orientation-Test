import { requireRole } from "@/lib/auth/current-user";
import { getPayoutCandidates, getLedgerReconciliation, getRecentPayouts } from "@/lib/payouts";
import { formatNgweeAsKwacha, getMinPayoutThresholdNgwee } from "@/lib/money";
import { StatusStamp } from "@/components/ui/status-stamp";
import { PayoutTriggerForm } from "@/components/admin/payout-trigger-form";

const LEDGER_STATUS_TONE = {
  HELD: "pending",
  ELIGIBLE: "unlocked",
  PAID: "approved",
} as const;

const PAYOUT_STATUS_TONE = {
  PENDING: "pending",
  PROCESSING: "pending",
  PAID: "approved",
  FAILED: "rejected",
} as const;

export default async function AdminPayoutsPage() {
  await requireRole("ADMIN");

  const [candidates, ledgerEntries, recentPayouts] = await Promise.all([
    getPayoutCandidates(),
    getLedgerReconciliation(),
    getRecentPayouts(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">Editorial Desk</p>
      <h1 className="font-display mt-1 text-3xl text-text-primary">Payout Ledger</h1>
      <p className="mt-2 text-sm text-text-muted">
        Minimum payout threshold: {formatNgweeAsKwacha(getMinPayoutThresholdNgwee())}
      </p>

      <section className="mt-8">
        <p className="mono-label mb-4 text-[0.65rem] text-text-faint">Ready For Payout</p>
        {candidates.length === 0 ? (
          <p className="border border-rule bg-panel p-8 text-center text-sm text-text-muted">
            No writer has an eligible balance yet.
          </p>
        ) : (
          <div className="divide-y divide-rule border border-rule bg-panel">
            {candidates.map((c) => (
              <div key={c.writerProfileId} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-text-primary">{c.writerName}</p>
                  <p className="mono-label mt-1 text-[0.65rem] text-text-faint">
                    {c.payoutPhone ? `${c.payoutNetwork} · ${c.payoutPhone}` : "No payout number on file"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-lg text-text-primary">
                    {formatNgweeAsKwacha(c.eligibleNgwee)}
                  </p>
                  <PayoutTriggerForm
                    writerProfileId={c.writerProfileId}
                    disabled={!c.meetsThreshold || !c.payoutPhone}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <p className="mono-label mb-4 text-[0.65rem] text-text-faint">Recent Payouts</p>
        {recentPayouts.length === 0 ? (
          <p className="border border-rule bg-panel p-8 text-center text-sm text-text-muted">
            No payouts have been sent yet.
          </p>
        ) : (
          <div className="divide-y divide-rule border border-rule bg-panel">
            {recentPayouts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span className="text-text-primary">{p.writerProfile.user.name}</span>
                <span className="text-text-muted">{formatNgweeAsKwacha(p.totalAmountNgwee)}</span>
                <StatusStamp label={p.status} tone={PAYOUT_STATUS_TONE[p.status]} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <p className="mono-label mb-4 text-[0.65rem] text-text-faint">Sale Reconciliation</p>
        <div className="overflow-x-auto border border-rule bg-panel">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="mono-label border-b border-rule text-[0.6rem] text-text-faint">
                <th className="p-3">Writer</th>
                <th className="p-3">Story</th>
                <th className="p-3">Sale</th>
                <th className="p-3">Platform Cut</th>
                <th className="p-3">Writer Cut</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-rule last:border-0">
                  <td className="p-3 text-text-primary">{entry.writerProfile.user.name}</td>
                  <td className="p-3 text-text-muted">{entry.purchase.story.title}</td>
                  <td className="p-3 text-text-muted">{formatNgweeAsKwacha(entry.purchase.amountNgwee)}</td>
                  <td className="p-3 text-text-muted">
                    {formatNgweeAsKwacha(entry.purchase.platformCutNgwee)}
                  </td>
                  <td className="p-3 text-text-muted">{formatNgweeAsKwacha(entry.amountNgwee)}</td>
                  <td className="p-3">
                    <StatusStamp label={entry.status} tone={LEDGER_STATUS_TONE[entry.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ledgerEntries.length === 0 && (
            <p className="p-8 text-center text-sm text-text-muted">No sales recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
