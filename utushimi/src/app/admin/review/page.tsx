import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { dossierNumber } from "@/lib/dossier-number";
import { GENRE_LABELS } from "@/lib/genres";
import { formatNgweeAsKwacha } from "@/lib/money";
import { ReviewForm } from "@/components/admin/review-form";

export default async function ReviewQueuePage() {
  await requireRole("ADMIN");

  const stories = await prisma.story.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { submittedAt: "asc" },
    include: { writer: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-text-faint">Editorial Desk</p>
      <h1 className="font-display mt-1 text-3xl text-text-primary">Review Queue</h1>
      <p className="mt-2 text-sm text-text-muted">{stories.length} submissions awaiting a decision.</p>

      <div className="mt-8 space-y-6">
        {stories.length === 0 && (
          <p className="border border-rule bg-panel p-10 text-center text-sm text-text-muted">
            Nothing waiting. The queue is clear.
          </p>
        )}

        {stories.map((story) => (
          <div key={story.id} className="border border-rule bg-panel p-6">
            <div className="mono-label flex items-center justify-between text-[0.65rem] text-text-micro">
              <span>{dossierNumber(story.id)}</span>
              <span>{GENRE_LABELS[story.genre]}</span>
            </div>
            <h2 className="font-display mt-2 text-xl text-text-primary">{story.title}</h2>
            <p className="mono-label mt-1 text-[0.65rem] text-text-faint">
              by {story.writer.name} ({story.writer.email}) · {formatNgweeAsKwacha(story.priceNgwee)} ·{" "}
              {story.readTimeMinutes} MIN
            </p>

            <p className="mt-4 text-sm text-text-muted">{story.coverText}</p>

            <details className="mt-4">
              <summary className="mono-label cursor-pointer text-[0.65rem] text-accent-strong">
                Read Full Submission
              </summary>
              <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap border border-input-border bg-ink p-4 font-body text-sm leading-relaxed text-text-primary">
                {story.body}
              </div>
            </details>

            <ReviewForm storyId={story.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
