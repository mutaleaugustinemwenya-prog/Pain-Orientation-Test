const tones = {
  sealed: "border-input-border text-text-faint",
  unlocked: "border-accent text-accent-strong",
  pending: "border-input-border text-text-muted",
  approved: "border-accent text-accent-strong",
  rejected: "border-input-border text-text-faint",
} as const;

export function StatusStamp({
  label,
  tone = "sealed",
}: {
  label: string;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`mono-label inline-flex items-center border px-2.5 py-1 text-[0.65rem] ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
