"use client";

import { leaveGuild } from "@/actions/guild";
import { useState } from "react";

export default function LeaveGuildButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    const confirmed = window.confirm(
      "Are you sure you want to leave your guild? If you are the last member, the guild will be deleted."
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);
    const result = await leaveGuild();
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
      )}
      <button
        onClick={handleLeave}
        disabled={pending}
        className="text-xs font-semibold px-4 py-2 rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
        style={{
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.35)",
          background: "rgba(239,68,68,0.06)",
        }}
      >
        {pending ? "Leaving..." : "Leave Guild"}
      </button>
    </div>
  );
}
