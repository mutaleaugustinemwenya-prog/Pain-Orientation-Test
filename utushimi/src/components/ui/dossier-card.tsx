import type { ReactNode } from "react";

export function DossierCard({
  fileNumber,
  children,
  className = "",
}: {
  fileNumber?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-rule bg-panel p-6 ${className}`}>
      {fileNumber && (
        <div className="mono-label mb-3 text-[0.65rem] text-text-micro">{fileNumber}</div>
      )}
      {children}
    </div>
  );
}
