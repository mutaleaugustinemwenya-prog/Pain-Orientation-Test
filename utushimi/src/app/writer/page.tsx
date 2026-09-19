import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { getWriterEarnings, getWriterStories } from "@/lib/writer-earnings";
import { formatNgweeAsKwacha } from "@/lib/money";
import { dossierNumber } from "@/lib/dossier-number";
import { GENRE_LABELS } from "@/lib/genres";
import { StatusStamp } from "@/components/ui/status-stamp";
import { PayoutSettingsForm } from "@/components/writer/payout-settings-form";

const STATUS_TONE = {
  DRAFT: "pending",
  PENDING_REVIEW: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Live",
  REJECTED: "Rejected",
} as const;

export default async function WriterDashboardPage() {
  const user = await requireRole("WRITER");
  const writerProfile = user.writerProfile!;

  const [earnings, stories] = await Promise.all([
    getWriterEarnings(writerProfile.id),
    getWriterStories(user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono-label text-[0.65rem] text-text-faint">Writer Desk</p>
          <h1 className="font-display mt-1 text-3xl text-text-primary">{user.name}</h1>
        </div>
        <Link
          href="/writer/stories/new"
          className="mono-label border border-accent px-5 py-3 text-xs text-accent-strong hover:bg-accent hover:text-text-primary"
        >
          Submit New Story
        </Link>
      </div>

      <section className="mono-label mt-8 grid grid-cols-1 divide-y divide-rule border border-rule bg-panel text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">
            {formatNgweeAsKwacha(earnings.eligibleNgwee)}
          </p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Ready For Payout</p>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">
            {formatNgweeAsKwacha(earnings.heldNgwee)}
          </p>
          <p className="mt-1 text-[0.65rem] text-text-faint">In Holdback Window</p>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-text-primary">
            {formatNgweeAsKwacha(earnings.lifetimeNgwee)}
          </p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Lifetime Earnings</p>
        </div>
      </section>

      <section className="mt-10 max-w-md">
        <PayoutSettingsForm
          payoutPhone={writerProfile.payoutPhone}
          payoutNetwork={writerProfile.payoutNetwork}
        />
      </section>

      <section className="mt-10">
        <p className="mono-label mb-4 text-[0.65rem] text-text-faint">Your Submissions</p>

        {stories.length === 0 ? (
          <p className="border border-rule bg-panel p-10 text-center text-sm text-text-muted">
            You haven&apos;t submitted a story yet.
          </p>
        ) : (
          <div className="divide-y divide-rule border border-rule bg-panel">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/writer/stories/${story.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-ink/40"
              >
                <div>
                  <p className="mono-label text-[0.65rem] text-text-micro">{dossierNumber(story.id)}</p>
                  <p className="font-display mt-1 text-lg text-text-primary">{story.title}</p>
                  <p className="mono-label mt-1 text-[0.65rem] text-text-faint">
                    {GENRE_LABELS[story.genre]} · {formatNgweeAsKwacha(story.priceNgwee)} ·{" "}
                    {story._count.purchases} Sold
                  </p>
                </div>
                <StatusStamp label={STATUS_LABEL[story.status]} tone={STATUS_TONE[story.status]} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
