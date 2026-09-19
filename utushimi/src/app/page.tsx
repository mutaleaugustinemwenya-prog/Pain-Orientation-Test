import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublishedStories, getPlatformStats, getUnlockedStoryIds, type StorySort } from "@/lib/stories";
import { getFeaturedAnthologies } from "@/lib/anthologies";
import { isGenre } from "@/lib/genres";
import { StoryCard } from "@/components/story-card";
import { GenreFilterBar } from "@/components/genre-filter-bar";
import { AnthologyBanner } from "@/components/anthology-banner";
import { Pagination } from "@/components/pagination";

function isStorySort(value: string | undefined): value is StorySort {
  return value === "newest" || value === "price_asc" || value === "price_desc";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const genre = isGenre(params.genre) ? params.genre : undefined;
  const sort = isStorySort(params.sort) ? params.sort : "newest";
  const page = Number(params.page) || 1;

  const user = await getCurrentUser();
  const [{ stories, pageCount }, stats, anthologies] = await Promise.all([
    getPublishedStories({ genre, sort, page }),
    getPlatformStats(),
    getFeaturedAnthologies(),
  ]);
  const unlockedIds = await getUnlockedStoryIds(user?.id, stories.map((s) => s.id));

  const buildHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (genre) qs.set("genre", genre);
    if (sort !== "newest") qs.set("sort", sort);
    if (targetPage > 1) qs.set("page", String(targetPage));
    const query = qs.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="border border-rule bg-panel px-6 py-14 text-center sm:py-20">
        <p className="mono-label text-[0.65rem] text-text-faint">Registry Est. 2024 — Lusaka, Zambia</p>
        <h1 className="font-display mx-auto mt-4 max-w-2xl text-4xl leading-tight text-text-primary sm:text-5xl">
          A Case File for Every Zambian Short Story
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-muted">
          Read fiction from Zambian writers, unlocked story by story with Mobile Money. Every
          submission is reviewed before it&apos;s sealed into the registry.
        </p>
        <div className="mono-label mt-8 flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="#registry" className="border border-accent bg-accent px-6 py-3 text-text-primary hover:bg-accent-strong">
            Browse the Registry
          </Link>
          <Link href="/register" className="border border-input-border px-6 py-3 hover:border-accent">
            Submit Your Work
          </Link>
        </div>
      </section>

      <section className="mono-label mt-10 grid grid-cols-1 divide-y divide-rule border border-rule bg-panel text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6">
          <p className="font-display text-3xl text-text-primary">{stats.storyCount}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Stories Sealed Into The Registry</p>
        </div>
        <div className="p-6">
          <p className="font-display text-3xl text-text-primary">{stats.writerCount}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Writers On Record</p>
        </div>
        <div className="p-6">
          <p className="font-display text-3xl text-text-primary">{stats.completedPurchaseCount}</p>
          <p className="mt-1 text-[0.65rem] text-text-faint">Unlocks Purchased</p>
        </div>
      </section>

      <div className="mt-10">
        <AnthologyBanner
          titles={anthologies.map((a) => ({
            slug: a.slug,
            title: a.title,
            coverText: a.coverText,
            priceNgwee: a.priceNgwee,
          }))}
        />
      </div>

      <section id="registry" className="mt-14 scroll-mt-24">
        <div className="mono-label mb-6 flex items-center justify-between text-[0.65rem] text-text-faint">
          <span>The Registry</span>
          <span>{stories.length} Shown</span>
        </div>

        <div className="mb-8">
          <GenreFilterBar genre={genre} sort={sort} />
        </div>

        {stories.length === 0 ? (
          <p className="border border-rule bg-panel p-10 text-center text-sm text-text-muted">
            No stories match this filter yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} unlocked={unlockedIds.has(story.id)} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination page={page} pageCount={pageCount} buildHref={buildHref} />
        </div>
      </section>
    </div>
  );
}
