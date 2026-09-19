"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "PENDING" | "COMPLETED" | "FAILED";

/**
 * Real Mobile Money collections are async (STK push -> payer approves on their phone), so this
 * polls our own status endpoint rather than flipping a UI toggle. On COMPLETED it refreshes the
 * server-rendered page so the story unlocks for real, not just locally in this component.
 */
export function UnlockPoller({
  purchaseId,
  kind = "story",
}: {
  purchaseId: string;
  kind?: "story" | "anthology";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("PENDING");
  const [failureReason, setFailureReason] = useState<string | undefined>();
  const endpoint =
    kind === "story"
      ? `/api/purchases/${purchaseId}/status`
      : `/api/anthology-purchases/${purchaseId}/status`;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;

        if (data.status === "COMPLETED") {
          setStatus("COMPLETED");
          router.refresh();
          return;
        }
        if (data.status === "FAILED") {
          setStatus("FAILED");
          setFailureReason(data.failureReason);
          return;
        }
        timer = setTimeout(poll, 1500);
      } catch {
        if (!cancelled) timer = setTimeout(poll, 2500);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [endpoint, router]);

  if (status === "COMPLETED") {
    return (
      <div className="border border-accent bg-panel p-6 text-center">
        <p className="mono-label text-[0.65rem] text-accent-strong">Unlock Confirmed</p>
        <p className="mt-2 text-sm text-text-muted">Refreshing the story…</p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="border border-input-border bg-panel p-6">
        <p className="mono-label text-[0.65rem] text-text-faint">Payment Failed</p>
        <p className="mt-2 text-sm text-text-muted">
          {failureReason ?? "The Mobile Money prompt was not approved."}
        </p>
        <a
          href="."
          className="mono-label mt-4 inline-block border border-accent px-5 py-3 text-xs text-accent-strong hover:bg-accent hover:text-text-primary"
        >
          Try Again
        </a>
      </div>
    );
  }

  return (
    <div className="border border-input-border bg-panel p-6">
      <p className="mono-label text-[0.65rem] text-text-faint">Awaiting Approval</p>
      <p className="mt-2 text-sm text-text-muted">
        Check your phone and approve the Mobile Money prompt to unlock this story.
      </p>
      <div className="mono-label mt-4 text-[0.65rem] text-text-micro">Checking every few seconds…</div>
    </div>
  );
}
