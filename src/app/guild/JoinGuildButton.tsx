"use client";

import { joinGuild } from "@/actions/guild";
import { useState } from "react";

export default function JoinGuildButton({ guildId }: { guildId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setPending(true);
    setError(null);
    const result = await joinGuild(guildId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      {error && (
        <p className="text-xs max-w-[140px] text-right" style={{ color: "#ef4444" }}>{error}</p>
      )}
      <button
        onClick={handleJoin}
        disabled={pending}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all disabled:opacity-50 flex-shrink-0"
        style={{
          color: "#4fc3f7",
          border: "1px solid rgba(79,195,247,0.35)",
          background: "rgba(79,195,247,0.06)",
        }}
      >
        {pending ? "Joining..." : "Join"}
      </button>
    </div>
  );
}
