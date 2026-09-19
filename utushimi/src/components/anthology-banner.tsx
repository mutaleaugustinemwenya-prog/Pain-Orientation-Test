import Link from "next/link";
import { formatNgweeAsKwacha } from "@/lib/money";

export interface AnthologyBannerItem {
  slug: string;
  title: string;
  coverText: string;
  priceNgwee: number;
}

/** Visually distinct from the story grid — this is Mockingbird Digital's own storefront, not a writer submission. */
export function AnthologyBanner({ titles }: { titles: AnthologyBannerItem[] }) {
  if (titles.length === 0) return null;

  return (
    <section className="border border-accent/60 bg-banner">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono-label text-[0.65rem] text-accent-strong">
            Official Storefront — Mockingbird Digital
          </p>
          <h2 className="font-display mt-2 text-2xl text-text-primary">The Publisher&apos;s Shelf</h2>
          <p className="mt-1 max-w-md text-sm text-text-muted">
            Curated anthologies published directly by Mockingbird Digital — distinct from the
            writer registry above.
          </p>
        </div>
        <Link
          href="/anthologies"
          className="mono-label shrink-0 border border-accent px-5 py-3 text-xs text-accent-strong hover:bg-accent hover:text-text-primary"
        >
          View Full Shelf
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px border-t border-rule bg-rule sm:grid-cols-3">
        {titles.map((title) => (
          <Link
            key={title.slug}
            href={`/anthologies/${title.slug}`}
            className="bg-banner p-5 hover:bg-panel"
          >
            <h3 className="font-display text-base text-text-primary">{title.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-text-muted">{title.coverText}</p>
            <p className="mono-label mt-3 text-[0.65rem] text-accent-strong">
              {formatNgweeAsKwacha(title.priceNgwee)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
