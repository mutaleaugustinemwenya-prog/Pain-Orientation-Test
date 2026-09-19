import Link from "next/link";
import { getPublishedAnthologies } from "@/lib/anthologies";
import { formatNgweeAsKwacha } from "@/lib/money";

export default async function AnthologiesPage() {
  const anthologies = await getPublishedAnthologies();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="mono-label text-[0.65rem] text-accent-strong">Official Storefront — Mockingbird Digital</p>
      <h1 className="font-display mt-2 text-3xl text-text-primary sm:text-4xl">The Publisher&apos;s Shelf</h1>
      <p className="mt-2 max-w-xl text-sm text-text-muted">
        Anthologies published directly by Mockingbird Digital — a distinct catalog from the
        writer-submitted registry.
      </p>

      {anthologies.length === 0 ? (
        <p className="mt-10 border border-rule bg-panel p-10 text-center text-sm text-text-muted">
          No titles published yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {anthologies.map((a) => (
            <Link
              key={a.id}
              href={`/anthologies/${a.slug}`}
              className="border border-accent/40 bg-banner p-5 hover:border-accent"
            >
              <h2 className="font-display text-lg text-text-primary">{a.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-text-muted">{a.coverText}</p>
              <div className="mono-label mt-4 flex items-center justify-between text-[0.65rem] text-text-faint">
                <span>{a.readTimeMinutes} MIN READ</span>
                <span className="text-accent-strong">{formatNgweeAsKwacha(a.priceNgwee)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
