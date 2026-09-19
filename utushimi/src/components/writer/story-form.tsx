"use client";

import { useActionState } from "react";
import { GENRES, GENRE_LABELS } from "@/lib/genres";
import { ngweeToKwacha } from "@/lib/money";
import type { StoryFormState } from "@/lib/stories/writer-actions";
import type { Genre } from "@/generated/prisma/enums";

export interface StoryFormDefaults {
  title: string;
  genre: Genre;
  priceNgwee: number;
  coverText: string;
  body: string;
  readTimeMinutes: number;
  previewCutoff: number;
}

export function StoryForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prevState: StoryFormState, formData: FormData) => Promise<StoryFormState>;
  defaults?: StoryFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<StoryFormState, FormData>(action, {});

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
          Genre
          <select
            name="genre"
            required
            defaultValue={defaults?.genre ?? ""}
            className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
          >
            <option value="" disabled>
              Select a genre
            </option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {GENRE_LABELS[g]}
              </option>
            ))}
          </select>
        </label>

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
      </div>

      <label className="mono-label block text-xs text-text-faint">
        Cover Text (shown on the registry card)
        <textarea
          name="coverText"
          required
          rows={3}
          defaultValue={defaults?.coverText}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <label className="mono-label block text-xs text-text-faint">
        Full Story Text
        <textarea
          name="body"
          required
          rows={16}
          defaultValue={defaults?.body}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 font-body text-sm leading-relaxed text-text-primary"
        />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
      </div>

      {state.error && <p className="text-xs text-accent-strong">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mono-label w-full bg-accent px-5 py-3 text-xs text-text-primary hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}
