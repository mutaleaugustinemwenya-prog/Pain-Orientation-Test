import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mono-label flex items-center justify-center gap-4 text-xs text-text-muted">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="hover:text-accent-strong">
          ← Prev
        </Link>
      ) : (
        <span className="text-text-micro">← Prev</span>
      )}
      <span className="text-text-faint">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={buildHref(page + 1)} className="hover:text-accent-strong">
          Next →
        </Link>
      ) : (
        <span className="text-text-micro">Next →</span>
      )}
    </nav>
  );
}
