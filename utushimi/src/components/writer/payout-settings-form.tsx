"use client";

import { useActionState } from "react";
import { updatePayoutSettings } from "@/lib/stories/writer-actions";
import type { StoryFormState } from "@/lib/stories/writer-actions";
import type { MobileMoneyNetwork } from "@/generated/prisma/enums";

export function PayoutSettingsForm({
  payoutPhone,
  payoutNetwork,
}: {
  payoutPhone: string | null;
  payoutNetwork: MobileMoneyNetwork | null;
}) {
  const [state, formAction, pending] = useActionState<StoryFormState, FormData>(
    updatePayoutSettings,
    {},
  );

  return (
    <form action={formAction} className="border border-rule bg-panel p-5">
      <p className="mono-label text-[0.65rem] text-text-faint">Payout Details</p>
      <p className="mt-1 text-xs text-text-muted">Where your earnings are sent once they clear the holdback window.</p>

      <div className="mono-label mt-4 grid grid-cols-2 gap-2 text-xs">
        <label className="flex items-center justify-center gap-2 border border-input-border p-3 has-[:checked]:border-accent">
          <input type="radio" name="payoutNetwork" value="MTN" defaultChecked={payoutNetwork !== "AIRTEL"} />
          MTN Money
        </label>
        <label className="flex items-center justify-center gap-2 border border-input-border p-3 has-[:checked]:border-accent">
          <input type="radio" name="payoutNetwork" value="AIRTEL" defaultChecked={payoutNetwork === "AIRTEL"} />
          Airtel Money
        </label>
      </div>

      <label className="mono-label mt-4 block text-xs text-text-faint">
        Mobile Money Number
        <input
          type="tel"
          name="payoutPhone"
          required
          defaultValue={payoutPhone ?? ""}
          placeholder="e.g. 0977123456"
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary placeholder:text-text-micro"
        />
      </label>

      {state.error && <p className="mt-3 text-xs text-accent-strong">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mono-label mt-4 border border-input-border px-4 py-2.5 text-xs text-text-muted hover:border-accent disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save Payout Details"}
      </button>
    </form>
  );
}
