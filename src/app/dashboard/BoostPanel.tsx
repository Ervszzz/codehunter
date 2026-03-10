"use client";

import { useState, useTransition } from "react";
import { createBoost, cancelBoost } from "@/actions/boost";
import { useRouter } from "next/navigation";

interface Boost {
  id: string;
  label: string;
  multiplier: number;
  expiresAt: Date;
}

const MULTIPLIER_OPTS = [
  { label: "1.5×", value: 1.5 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
  { label: "5×", value: 5 },
];

const DURATION_OPTS = [
  { label: "1 Hour", ms: 60 * 60 * 1000 },
  { label: "3 Hours", ms: 3 * 60 * 60 * 1000 },
  { label: "6 Hours", ms: 6 * 60 * 60 * 1000 },
  { label: "12 Hours", ms: 12 * 60 * 60 * 1000 },
  { label: "1 Day", ms: 24 * 60 * 60 * 1000 },
];

export default function BoostPanel({ activeBoosts }: { activeBoosts: Boost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [multiplier, setMultiplier] = useState(2);
  const [durationMs, setDurationMs] = useState(DURATION_OPTS[0].ms);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    const fd = new FormData();
    fd.set("label", label || `${multiplier}× XP Event`);
    fd.set("multiplier", String(multiplier));
    fd.set("durationMs", String(durationMs));
    startTransition(async () => {
      try {
        await createBoost(fd);
        setLabel("");
        router.refresh();
      } catch (e) {
        setError(String(e));
      }
    });
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      await cancelBoost(id);
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-2xl p-px"
      style={{ background: "linear-gradient(135deg, rgba(255,68,68,0.6), rgba(255,68,68,0.15), rgba(255,68,68,0.4))" }}
    >
      <div className="rounded-2xl p-5" style={{ background: "rgba(6,10,20,0.97)" }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span style={{ color: "#ff4444", fontSize: 16 }}>⚔</span>
          <h3 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: "#ff4444" }}>
            Architect Controls — XP Boost Events
          </h3>
        </div>

        {/* Active boosts */}
        {activeBoosts.length > 0 && (
          <div className="mb-4 space-y-2">
            {activeBoosts.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-2 rounded-lg"
                style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)" }}
              >
                <div>
                  <span className="text-sm font-bold" style={{ color: "#ff6b6b" }}>
                    {b.multiplier}× — {b.label}
                  </span>
                  <span className="text-xs text-slate-500 ml-3">
                    expires {new Date(b.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {new Date(b.expiresAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={isPending}
                  className="text-xs px-3 py-1 rounded-md transition-colors"
                  style={{ color: "#ff4444", border: "1px solid rgba(255,68,68,0.3)", background: "rgba(255,68,68,0.08)" }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create form */}
        <div className="space-y-3">
          {/* Label */}
          <input
            type="text"
            placeholder="Event name (optional)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,68,68,0.2)" }}
          />

          {/* Multiplier */}
          <div className="flex gap-2 flex-wrap">
            {MULTIPLIER_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMultiplier(opt.value)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: multiplier === opt.value ? "rgba(255,68,68,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${multiplier === opt.value ? "rgba(255,68,68,0.6)" : "rgba(255,255,255,0.08)"}`,
                  color: multiplier === opt.value ? "#ff4444" : "#94a3b8",
                  boxShadow: multiplier === opt.value ? "0 0 12px rgba(255,68,68,0.2)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTS.map(opt => (
              <button
                key={opt.ms}
                onClick={() => setDurationMs(opt.ms)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: durationMs === opt.ms ? "rgba(255,68,68,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${durationMs === opt.ms ? "rgba(255,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: durationMs === opt.ms ? "#ff6b6b" : "#64748b",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={isPending}
            className="w-full py-2.5 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,68,68,0.15)",
              border: "1px solid rgba(255,68,68,0.5)",
              color: "#ff4444",
              boxShadow: "0 0 20px rgba(255,68,68,0.15)",
            }}
          >
            {isPending ? "Activating..." : `⚡ Activate ${multiplier}× XP — ${DURATION_OPTS.find(d => d.ms === durationMs)?.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
