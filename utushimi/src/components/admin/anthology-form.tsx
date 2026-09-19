"use client";

import { useActionState } from "react";
import { ngweeToKwacha } from "@/lib/money";
import type { AnthologyFormState } from "@/lib/admin/anthology-actions";

export interface AnthologyFormDefaults {
  title: string;
  priceNgwee: number;
  coverText: string;
  body: string;
  readTimeMinutes: number;
  previewCutoff: number;
  published: boolean;
}

export function AnthologyForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: AnthologyFormState, formData: FormData) => Promise<AnthologyFormState>;
  defaults?: AnthologyFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<AnthologyFormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-5 border border-rule bg-panel p-6">
      <label className="mono-label block text-xs text-text-faint">
        Title
        <input
          type="text"
          name="title"
          required
          defaultValue={defaults?.title}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="mono-label block text-xs text-text-faint">
          Price (Kwacha)
          <input
            type="number"
            name="priceKwacha"
            min="1"
            step="0.5"
            required
            defaultValue={defaults ? ngweeToKwacha(defaults.priceNgwee) : undefined}
            className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
          />
        </label>

        <label className="mono-label block text-xs text-text-faint">
          Read Time (minutes)
          <input
            type="number"
            name="readTimeMinutes"
            min="1"
            required
            defaultValue={defaults?.readTimeMinutes}
            className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
          />
        </label>
      </div>

      <label className="mono-label block text-xs text-text-faint">
        Cover Text
        <textarea
          name="coverText"
          required
          rows={3}
          defaultValue={defaults?.coverText}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <label className="mono-label block text-xs text-text-faint">
        Full Text
        <textarea
          name="body"
          required
          rows={16}
          defaultValue={defaults?.body}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 font-body text-sm leading-relaxed text-text-primary"
        />
      </label>

      <label className="mono-label block text-xs text-text-faint">
        Free Preview Length (characters)
        <input
          type="number"
          name="previewCutoff"
          min="50"
          required
          defaultValue={defaults?.previewCutoff}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <label className="mono-label flex items-center gap-2 text-xs text-text-faint">
        <input type="checkbox" name="published" value="true" defaultChecked={defaults?.published} />
        Published (visible on the storefront)
      </label>

      {state.error && <p className="text-xs text-accent-strong">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mono-label w-full bg-accent px-5 py-3 text-xs text-text-primary hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
