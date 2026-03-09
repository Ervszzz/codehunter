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
        setTimeout(() => router.push("/dashboard"), 4000);
      }
    });
  }

  if (step === "done" && result) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-glow-pulse">
        <div
          className="text-6xl font-display font-black"
          style={{ color: "#ffd54f", textShadow: "0 0 40px rgba(255,213,79,0.6)" }}
        >
          ★ PRESTIGE {toRoman(result.tier)} ★
        </div>
        <p className="text-xl font-semibold" style={{ color: "#7c4dff" }}>
          &quot;{result.title}&quot;
        </p>
        <p className="text-slate-400 text-sm">Returning to the battlefield...</p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div
          className="rounded-2xl p-6 max-w-md"
          style={{
            background: "rgba(124,77,255,0.08)",
            border: "1px solid rgba(124,77,255,0.3)",
          }}
        >
          <p className="text-white font-semibold mb-2">Are you certain, Hunter?</p>
          <p className="text-slate-400 text-sm">
            Your rank resets to <span className="text-white font-bold">E</span> and all{" "}
            <span className="text-white font-bold">XP is lost</span>. In return you gain:
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div style={{ color: "#ffd54f" }}>★ Prestige {toRoman(currentTier + 1)} badge (permanent)</div>
            <div style={{ color: "#7c4dff" }}>&quot;{nextTitle}&quot; title</div>
            <div style={{ color: "#4fc3f7" }}>{nextMultiplier}x XP multiplier forever</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep("idle")}
            disabled={isPending}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Turn Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="px-8 py-3 rounded-lg text-sm font-display font-bold tracking-widest uppercase transition-all"
            style={{
              background: isPending ? "rgba(124,77,255,0.1)" : "rgba(124,77,255,0.2)",
              border: "1px solid rgba(124,77,255,0.6)",
              color: "#7c4dff",
              boxShadow: "0 0 20px rgba(124,77,255,0.2)",
            }}
          >
            {isPending ? "Entering the Void..." : "Confirm Prestige"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirm")}
      className="void-btn px-12 py-5 rounded-xl font-display font-black text-lg tracking-widest uppercase text-white cursor-pointer"
    >
      Enter the Void
    </button>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [[4, "IV"], [3, "III"], [2, "II"], [1, "I"]];
  for (const [val, str] of map) if (n >= val) return str;
  return String(n);
}
