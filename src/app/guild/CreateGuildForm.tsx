"use client";

import { createGuild } from "@/actions/guild";
import { useState } from "react";

export default function CreateGuildForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createGuild(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="githubOrgLogin"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgba(148,163,184,0.8)" }}
        >
          GitHub Org Username
        </label>
        <input
          id="githubOrgLogin"
          name="githubOrgLogin"
          type="text"
          placeholder="e.g. my-org"
          required
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-medium outline-none disabled:opacity-50 transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(79,195,247,0.5)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgba(148,163,184,0.8)" }}
        >
          Guild Display Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Shadow Monarchs"
          required
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-medium outline-none disabled:opacity-50 transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(79,195,247,0.5)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />
      </div>

      {error && (
        <p className="text-xs rounded-lg px-3 py-2" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="gate-btn disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {pending ? "Creating..." : "Create Guild"}
      </button>
    </form>
  );
}
