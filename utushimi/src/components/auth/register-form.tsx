"use client";

import { useActionState } from "react";
import { registerReader, registerWriter, type ActionState } from "@/lib/auth/actions";

export function RegisterForm({ as }: { as: "reader" | "writer" }) {
  const action = as === "writer" ? registerWriter : registerReader;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="border border-rule bg-panel p-6">
      <label className="mono-label block text-xs text-text-faint">
        Full Name
        <input
          type="text"
          name="name"
          required
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <label className="mono-label mt-4 block text-xs text-text-faint">
        Email
        <input
          type="email"
          name="email"
          required
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      <label className="mono-label mt-4 block text-xs text-text-faint">
        Phone (optional)
        <input
          type="tel"
          name="phone"
          placeholder="e.g. 0977123456"
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary placeholder:text-text-micro"
        />
      </label>

      <label className="mono-label mt-4 block text-xs text-text-faint">
        Password
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="mt-1.5 w-full border border-input-border bg-ink px-3 py-2.5 text-sm text-text-primary"
        />
      </label>

      {state.error && <p className="mt-3 text-xs text-accent-strong">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mono-label mt-5 w-full bg-accent px-5 py-3 text-xs text-text-primary hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Creating Account…" : as === "writer" ? "Register as Writer" : "Create Reader Account"}
      </button>
    </form>
  );
}
