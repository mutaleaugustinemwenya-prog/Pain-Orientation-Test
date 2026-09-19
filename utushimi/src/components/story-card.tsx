import Link from "next/link";
import { dossierNumber } from "@/lib/dossier-number";
import { formatNgweeAsKwacha } from "@/lib/money";
import { GENRE_LABELS } from "@/lib/genres";
import { StatusStamp } from "@/components/ui/status-stamp";
import type { Genre } from "@/generated/prisma/enums";

export interface StoryCardData {
  id: string;
  slug: string;
  title: string;
  genre: Genre;
  priceNgwee: number;
  coverText: string;
  readTimeMinutes: number;
  writer: { name: string };
}

export function StoryCard({ story, unlocked }: { story: StoryCardData; unlocked: boolean }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group block border border-rule bg-panel p-5 transition-colors hover:border-accent"
    >
      <div className="mono-label mb-3 flex items-center justify-between text-[0.65rem] text-text-micro">
        <span>{dossierNumber(story.id)}</span>
        <span>{GENRE_LABELS[story.genre]}</span>
      </div>

      <h3 className="font-display text-lg leading-snug text-text-primary group-hover:text-accent-strong">
        {story.title}
      </h3>
      <p className="mono-label mt-1 text-[0.65rem] text-text-faint">by {story.writer.name}</p>

      <p className="mt-3 line-clamp-3 text-sm text-text-muted">{story.coverText}</p>

      <div className="mono-label mt-5 flex items-center justify-between text-[0.65rem] text-text-faint">
        <span>{story.readTimeMinutes} MIN READ</span>
        <div className="flex items-center gap-2">
          <StatusStamp
            label={unlocked ? "Unlocked" : formatNgweeAsKwacha(story.priceNgwee)}
            tone={unlocked ? "unlocked" : "sealed"}
          />
        </div>
      </div>
    </Link>
  );
}
