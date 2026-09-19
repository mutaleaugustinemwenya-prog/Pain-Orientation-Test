"use client";

import { useActionState } from "react";
import { initiateStoryPurchase, type PurchaseActionState } from "@/lib/purchases/story-purchase";
import { initiateAnthologyPurchase } from "@/lib/purchases/anthology-purchase";
import { formatNgweeAsKwacha } from "@/lib/money";

interface PaywallPanelProps {
  priceNgwee: number;
  label?: string;
  hiddenFieldName: "storyId" | "anthologyId";
  hiddenFieldValue: string;
  action: (prevState: PurchaseActionState, formData: FormData) => Promise<PurchaseActionState>;
}

function BasePaywallPanel({ priceNgwee, label = "Unlock This Story", hiddenFieldName, hiddenFieldValue, action }: PaywallPanelProps) {
  const [state, formAction, pending] = useActionState<PurchaseActionState, FormData>(action, {});

  return (
    <form action={formAction} className="border border-rule bg-panel p-6">
      <input type="hidden" name={hiddenFieldName} value={hiddenFieldValue} />
      <p className="mono-label text-[0.65rem] text-text-faint">{label}</p>
      <p className="font-display mt-2 text-2xl text-accent-strong">{formatNgweeAsKwacha(priceNgwee)}</p>

      <fieldset className="mono-label mt-5 grid grid-cols-2 gap-2 text-xs">
        <label className="flex items-center justify-center gap-2 border border-input-border p-3 has-[:checked]:border-accent">
          <input type="radio" name="network" value="MTN" defaultChecked />
          MTN Money
        </label>
        <label className="flex items-center justify-center gap-2 border border-input-border p-3 has-[:checked]:border-accent">
          <input type="radio" name="network" value="AIRTEL" />
          Airtel Money
        </label>
      </fieldset>

      <label className="mono-label mt-4 block text-xs text-text-faint">
        Mobile Money Number
        <input
          type="tel"
          name="phone"
          required
          placeholder="e.g. 0977123456"
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary placeholder:text-text-micro"
        />
      </label>

      {state.error && <p className="mt-3 text-xs text-accent-strong">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mono-label mt-5 w-full bg-accent px-5 py-3 text-xs text-text-primary hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Sending Prompt…" : "Unlock"}
      </button>
    </form>
  );
}

export function PaywallPanel({ storyId, priceNgwee }: { storyId: string; priceNgwee: number }) {
  return (
    <BasePaywallPanel
      priceNgwee={priceNgwee}
      label="Unlock This Story"
      hiddenFieldName="storyId"
      hiddenFieldValue={storyId}
      action={initiateStoryPurchase}
    />
  );
}

export function AnthologyPaywallPanel({ anthologyId, priceNgwee }: { anthologyId: string; priceNgwee: number }) {
  return (
    <BasePaywallPanel
      priceNgwee={priceNgwee}
      label="Unlock This Anthology"
      hiddenFieldName="anthologyId"
      hiddenFieldValue={anthologyId}
      action={initiateAnthologyPurchase}
    />
  );
}
