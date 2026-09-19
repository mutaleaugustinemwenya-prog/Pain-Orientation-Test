const LINE_WIDTHS = ["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-3/4"];

/**
 * Visual treatment for the sealed remainder of a story: blurred/dimmed lines fading into the
 * background, capped with a "REMAINDER SEALED" label. Purely decorative — no real story text
 * is ever sent to the client for the locked portion, so this renders placeholder lines rather
 * than blurring real content that would still be readable in the DOM.
 */
export function RedactedBlock({ approxLines = 6 }: { approxLines?: number }) {
  const lines = Array.from({ length: approxLines }, (_, i) => LINE_WIDTHS[i % LINE_WIDTHS.length]);

  return (
    <div className="redacted-block h-56 overflow-hidden">
      <div className="space-y-3">
        {lines.map((width, i) => (
          <div key={i} className={`redacted-line h-4 bg-text-faint/40 ${width}`} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <span className="mono-label border border-input-border bg-ink px-3 py-1.5 text-[0.65rem] text-text-faint">
          Remainder Sealed
        </span>
      </div>
    </div>
  );
}
