"use client";

import { useActionState } from "react";
import { reviewStory, type AdminActionState } from "@/lib/admin/actions";

export function ReviewForm({ storyId }: { storyId: string }) {
  const boundAction = reviewStory.bind(null, storyId);
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(boundAction, {});

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <textarea
        name="notes"
        rows={2}
        placeholder="Editorial notes (required to reject)"
        className="w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary placeholder:text-text-micro"
      />

      {state.error && <p className="text-xs text-accent-strong">{state.error}</p>}
      {state.success && <p className="text-xs text-accent-strong">{state.success}</p>}

      <div className="mono-label flex gap-3 text-xs">
        <button
          type="submit"
          name="decision"
          value="APPROVE"
          disabled={pending}
          className="border border-accent px-4 py-2.5 text-accent-strong hover:bg-accent hover:text-text-primary disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECT"
          disabled={pending}
          className="border border-input-border px-4 py-2.5 text-text-muted hover:border-text-faint disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </form>
  );
}
