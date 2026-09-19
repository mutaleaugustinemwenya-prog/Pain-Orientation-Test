import { GENRES, GENRE_LABELS } from "@/lib/genres";
import type { Genre } from "@/generated/prisma/enums";
import type { StorySort } from "@/lib/stories";

export function GenreFilterBar({
  genre,
  sort,
}: {
  genre?: Genre;
  sort?: StorySort;
}) {
  return (
    <form
      method="get"
      className="mono-label flex flex-wrap items-end gap-4 border border-rule bg-panel p-4 text-xs text-text-muted"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-text-faint">Genre</span>
        <select
          name="genre"
          defaultValue={genre ?? ""}
          className="border border-input-border bg-ink px-3 py-2 text-text-primary"
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {GENRE_LABELS[g]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-text-faint">Sort</span>
        <select
          name="sort"
          defaultValue={sort ?? "newest"}
          className="border border-input-border bg-ink px-3 py-2 text-text-primary"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>

      <button type="submit" className="border border-input-border px-4 py-2 hover:border-accent">
        Apply
      </button>
    </form>
  );
}
