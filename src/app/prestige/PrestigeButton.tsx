"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enterTheVoid } from "@/actions/prestige";

interface Props {
  currentTier: number;
  nextTitle: string;
  nextMultiplier: number;
}

export default function PrestigeButton({ currentTier, nextTitle, nextMultiplier }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [result, setResult] = useState<{ tier: number; title: string } | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const res = await enterTheVoid();
      if (res.success && res.newTier && res.newTitle) {
        setResult({ tier: res.newTier, title: res.newTitle });
        setStep("done");
        setTimeout(() => router.push("/dashboard"), 5000);
      }
    });
  }

  // ── Full-screen prestige reveal ──────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 50%, #0d0520 0%, #050810 60%)" }}
      >
        {/* Rings */}
        <div className="absolute rounded-full border border-[#7c4dff]/30 animate-ring-spin" style={{ width: 700, height: 700 }} />
        <div className="absolute rounded-full border border-[#ffd54f]/20 animate-ring-spin-reverse" style={{ width: 500, height: 500 }} />
        <div className="absolute rounded-full border border-[#7c4dff]/10 animate-ring-spin" style={{ width: 900, height: 900, animationDuration: "20s" }} />

        {/* Center glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(124,77,255,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 text-center px-8 animate-prestige-reveal">
          {/* PRESTIGE badge */}
          <div
            className="inline-block px-6 py-2 rounded-full text-xs font-semibold tracking-[0.4em] uppercase mb-6"
            style={{
              background: "rgba(255,213,79,0.1)",
              border: "1px solid rgba(255,213,79,0.5)",
              color: "#ffd54f",
              boxShadow: "0 0 20px rgba(255,213,79,0.3)",
            }}
          >
            Prestige Unlocked
          </div>

          {/* Big number */}
          <div
            className="font-display font-black mb-4 shimmer-text"
            style={{
              fontSize: "clamp(5rem, 20vw, 10rem)",
              lineHeight: 1,
              filter: "drop-shadow(0 0 40px rgba(255,213,79,0.5))",
            }}
          >
            {toRoman(result.tier)}
          </div>

          {/* Title */}
          <div
            className="font-display font-bold text-2xl sm:text-3xl mb-3"
            style={{ color: "#7c4dff", textShadow: "0 0 30px rgba(124,77,255,0.6)" }}
          >
            &ldquo;{result.title}&rdquo;
          </div>

          <p className="text-slate-400 text-sm tracking-widest uppercase animate-glow-pulse">
            Returning to the battlefield...
          </p>
        </div>
      </div>
    );
  }

  // ── Confirm step ─────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
        <div
          className="w-full rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,77,255,0.12), rgba(239,68,68,0.06))",
            border: "1px solid rgba(124,77,255,0.4)",
            boxShadow: "0 0 40px rgba(124,77,255,0.15), inset 0 0 40px rgba(124,77,255,0.04)",
          }}
        >
          <div
            className="text-4xl mb-3"
            style={{ filter: "drop-shadow(0 0 10px rgba(239,68,68,0.5))" }}
          >
            ⚠
          </div>
          <p className="font-display font-bold text-xl text-white mb-2 tracking-wide">
            This cannot be undone.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            You will lose all XP and return to Rank E.<br />
            Your Prestige badge and multiplier are permanent.
          </p>

          {/* What you get */}
          <div className="space-y-2 mb-6">
            {[
              { icon: "★", label: `Prestige ${toRoman(currentTier + 1)} — permanent badge`, color: "#ffd54f" },
              { icon: "◆", label: `"${nextTitle}" title`, color: "#7c4dff" },
              { icon: "▲", label: `${nextMultiplier}x XP multiplier — forever`, color: "#4fc3f7" },
            ].map(({ icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep("idle")}
              disabled={isPending}
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: "#64748b", border: "1px solid #1e293b" }}
            >
              Turn Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="px-8 py-3 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all"
              style={{
                background: isPending ? "rgba(124,77,255,0.1)" : "rgba(124,77,255,0.25)",
                border: "1px solid rgba(124,77,255,0.7)",
                color: "#a78bfa",
                boxShadow: isPending ? "none" : "0 0 30px rgba(124,77,255,0.3)",
              }}
            >
              {isPending ? "Entering the Void..." : "I am ready"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Idle — the main CTA ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setStep("confirm")}
        className="void-btn px-16 py-6 rounded-2xl font-display font-black text-xl tracking-[0.15em] uppercase text-white cursor-pointer"
      >
        ⬛ Enter the Void
      </button>
      <p className="text-xs text-slate-600 tracking-wider">
        Sacrifice everything. Return as legend.
      </p>
    </div>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [[4, "IV"], [3, "III"], [2, "II"], [1, "I"]];
  for (const [val, str] of map) if (n >= val) return str;
  return String(n);
}
