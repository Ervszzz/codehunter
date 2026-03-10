"use client";

import { useState, useTransition } from "react";
import { createBoost, cancelBoost } from "@/actions/boost";
import { useRouter } from "next/navigation";

interface Boost {
  id: string;
  label: string;
  multiplier: number;
  expiresAt: string; // ISO string — Dates aren't serializable across server→client boundary
}

const MULTIPLIER_PRESETS = [1.5, 2, 3, 5];

const DURATION_OPTS = [
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "3h", ms: 3 * 60 * 60 * 1000 },
  { label: "6h", ms: 6 * 60 * 60 * 1000 },
  { label: "12h", ms: 12 * 60 * 60 * 1000 },
  { label: "1 Day", ms: 24 * 60 * 60 * 1000 },
];

function timeLeft(expiresAt: Date): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function ArchitectModal({ activeBoost }: { activeBoost: Boost | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"boost">("boost");
  const [isPending, startTransition] = useTransition();

  // Boost form state — preset and custom are tracked separately to avoid conflicts
  const [selectedPreset, setSelectedPreset] = useState<number | null>(2);
  const [customInput, setCustomInput] = useState("");
  const [durationMs, setDurationMs] = useState(DURATION_OPTS[0].ms);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const multiplier = selectedPreset ?? (parseFloat(customInput) || 0);
  const multiplierValid = multiplier >= 1.1 && multiplier <= 50;

  function handleCreate() {
    if (!multiplierValid) { setError("Multiplier must be between 1.1 and 50"); return; }
    setError(null);
    const fd = new FormData();
    fd.set("label", label.trim() || `${multiplier}× XP Event`);
    fd.set("multiplier", String(multiplier));
    fd.set("durationMs", String(durationMs));
    setCustomInput("");
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

  const durationLabel = DURATION_OPTS.find(d => d.ms === durationMs)?.label ?? "Custom";

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl font-display font-bold text-xs tracking-widest uppercase z-50 transition-all"
        style={{
          background: "rgba(255,68,68,0.12)",
          border: "1px solid rgba(255,68,68,0.45)",
          color: "#ff4444",
          boxShadow: "0 0 24px rgba(255,68,68,0.25), 0 0 48px rgba(255,68,68,0.08)",
          animation: "border-glow-pulse 2.5s ease-in-out infinite",
        }}
      >
        <span>⚔</span>
        Architect Mode
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "rgba(6,10,20,0.98)",
              border: "1px solid rgba(255,68,68,0.35)",
              boxShadow: "0 0 80px rgba(255,68,68,0.15), 0 0 160px rgba(255,68,68,0.06)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,68,68,0.15)", background: "rgba(255,68,68,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: "#ff4444" }}>⚔</span>
                <h2 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: "#ff4444" }}>
                  Architect Mode
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {([["boost", "⚡ XP Boost"]] as const).map(([key, lbl]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
                  style={{
                    color: tab === key ? "#ff4444" : "#475569",
                    borderBottom: tab === key ? "2px solid #ff4444" : "2px solid transparent",
                    background: tab === key ? "rgba(255,68,68,0.06)" : "transparent",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {/* Boost tab content */}
            {tab === "boost" && (
              <div className="p-5 space-y-4">

                {/* Active boost */}
                {activeBoost && (
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,213,79,0.07)", border: "1px solid rgba(255,213,79,0.3)" }}
                  >
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#ffd54f" }}>
                        {activeBoost.multiplier}× — {activeBoost.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{timeLeft(new Date(activeBoost.expiresAt))}</p>
                    </div>
                    <button
                      onClick={() => handleCancel(activeBoost.id)}
                      disabled={isPending}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!activeBoost && (
                  <p className="text-xs text-slate-600 text-center py-1">No active boost. Create one below.</p>
                )}

                <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Event label */}
                <input
                  type="text"
                  placeholder="Event name (optional)"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,68,68,0.2)" }}
                />

                {/* Multiplier */}
                <div>
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Multiplier</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {MULTIPLIER_PRESETS.map(v => (
                      <button
                        key={v}
                        onClick={() => { setSelectedPreset(v); setCustomInput(""); }}
                        className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                        style={{
                          background: selectedPreset === v ? "rgba(255,68,68,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${selectedPreset === v ? "rgba(255,68,68,0.6)" : "rgba(255,255,255,0.08)"}`,
                          color: selectedPreset === v ? "#ff4444" : "#64748b",
                          boxShadow: selectedPreset === v ? "0 0 12px rgba(255,68,68,0.2)" : "none",
                        }}
                      >
                        {v}×
                      </button>
                    ))}
                    {/* Custom input — completely independent from preset state */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1.1"
                        max="50"
                        step="0.1"
                        placeholder="Custom"
                        value={customInput}
                        onChange={e => { setCustomInput(e.target.value); setSelectedPreset(null); }}
                        className="w-20 px-2 py-1.5 rounded-lg text-sm text-white text-center outline-none"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${selectedPreset === null && customInput ? "rgba(255,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      />
                      <span className="text-slate-500 text-sm">×</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Duration</p>
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
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  onClick={handleCreate}
                  disabled={isPending || !multiplierValid}
                  className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-40"
                  style={{
                    background: "rgba(255,68,68,0.15)",
                    border: "1px solid rgba(255,68,68,0.5)",
                    color: "#ff4444",
                    boxShadow: "0 0 24px rgba(255,68,68,0.12)",
                  }}
                >
                  {isPending ? "Activating..." : `⚡ Activate ${multiplierValid ? multiplier + "×" : "?×"} XP — ${durationLabel}`}
                </button>

                <p className="text-xs text-slate-600 text-center">
                  Creating a new boost replaces any existing active boost.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
