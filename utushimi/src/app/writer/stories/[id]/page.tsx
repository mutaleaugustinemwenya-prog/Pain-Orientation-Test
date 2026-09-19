import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { resubmitStory } from "@/lib/stories/writer-actions";
import { formatNgweeAsKwacha } from "@/lib/money";
import { dossierNumber } from "@/lib/dossier-number";
import { GENRE_LABELS } from "@/lib/genres";
import { StatusStamp } from "@/components/ui/status-stamp";
import { StoryForm } from "@/components/writer/story-form";

const STATUS_TONE = {
  DRAFT: "pending",
  PENDING_REVIEW: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Live In Registry",
  REJECTED: "Rejected",
} as const;

export default async function WriterStoryStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("WRITER");

  const story = await prisma.story.findUnique({
    where: { id },
    include: { _count: { select: { purchases: { where: { status: "COMPLETED" } } } } },
  });
  if (!story || story.writerId !== user.id) notFound();

  const boundResubmit = resubmitStory.bind(null, story.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mono-label flex items-center justify-between text-[0.65rem] text-text-micro">
        <span>{dossierNumber(story.id)}</span>
        <span>{GENRE_LABELS[story.genre]}</span>
      </div>

      <h1 className="font-display mt-3 text-3xl text-text-primary">{story.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusStamp label={STATUS_LABEL[story.status]} tone={STATUS_TONE[story.status]} />
        <span className="mono-label text-[0.65rem] text-text-faint">
          {formatNgweeAsKwacha(story.priceNgwee)} · {story._count.purchases} Sold
        </span>
        {story.status === "APPROVED" && (
          <Link href={`/stories/${story.slug}`} className="mono-label text-[0.65rem] text-accent-strong hover:underline">
            View Live Page →
          </Link>
        )}
      </div>

      {story.status === "REJECTED" && story.rejectionNotes && (
        <div className="mt-6 border border-input-border bg-panel p-5">
          <p className="mono-label text-[0.65rem] text-text-faint">Editorial Notes</p>
          <p className="mt-2 text-sm text-text-muted">{story.rejectionNotes}</p>
        </div>
      )}

      {story.status === "REJECTED" ? (
        <div className="mt-8">
          <p className="mono-label mb-4 text-[0.65rem] text-text-faint">
            Revise & Resubmit
          </p>
          <StoryForm
            action={boundResubmit}
            submitLabel="Resubmit For Review"
            defaults={{
              title: story.title,
              genre: story.genre,
              priceNgwee: story.priceNgwee,
              coverText: story.coverText,
              body: story.body,
              readTimeMinutes: story.readTimeMinutes,
              previewCutoff: story.previewCutoff,
            }}
          />
        </div>
      ) : (
        <div className="mt-8 border border-rule bg-panel p-6">
          <p className="mono-label text-[0.65rem] text-text-faint">Cover Text</p>
          <p className="mt-2 text-sm text-text-muted">{story.coverText}</p>
        </div>
      )}
    </div>
  );
}
