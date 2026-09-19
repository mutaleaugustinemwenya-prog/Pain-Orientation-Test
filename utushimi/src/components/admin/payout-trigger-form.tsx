"use client";

import { useActionState } from "react";
import { triggerPayout, type AdminActionState } from "@/lib/admin/actions";

export function PayoutTriggerForm({
  writerProfileId,
  disabled,
}: {
  writerProfileId: string;
  disabled?: boolean;
}) {
  const boundAction = triggerPayout.bind(null, writerProfileId);
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(boundAction, {});

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <button
        type="submit"
        disabled={disabled || pending}
        className="mono-label border border-accent px-4 py-2 text-xs text-accent-strong hover:bg-accent hover:text-text-primary disabled:cursor-not-allowed disabled:border-input-border disabled:text-text-micro"
      >
        {pending ? "Sending…" : "Pay Out"}
      </button>
      {state.error && <p className="max-w-48 text-right text-[0.65rem] text-accent-strong">{state.error}</p>}
      {state.success && <p className="text-[0.65rem] text-accent-strong">{state.success}</p>}
    </form>
  );
}
