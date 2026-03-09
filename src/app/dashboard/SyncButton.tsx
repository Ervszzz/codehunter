"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncUserXP } from "@/actions/syncXP";

export default function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ xpGained: number } | null>(null);

  function handleSync() {
    startTransition(async () => {
      const res = await syncUserXP();
      if (res.success) {
        setResult({ xpGained: res.xpGained });
        router.refresh();
        setTimeout(() => setResult(null), 4000);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isPending ? "rgba(79,195,247,0.05)" : "rgba(79,195,247,0.1)",
          border: "1px solid rgba(79,195,247,0.4)",
          color: "#4fc3f7",
          boxShadow: isPending ? "none" : "0 0 12px rgba(79,195,247,0.1)",
        }}
      >
        {isPending ? (
          <>
            <SpinIcon />
            Syncing...
          </>
        ) : (
          <>
            <SyncIcon />
            Sync XP
          </>
        )}
      </button>

      {result && result.xpGained > 0 && (
        <span
          className="text-sm font-bold animate-fade-in"
          style={{ color: "#4ade80" }}
        >
          +{result.xpGained} XP
        </span>
      )}
      {result && result.xpGained === 0 && (
        <span className="text-xs text-slate-500">Already up to date</span>
      )}
    </div>
  );
}

function SyncIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: "ring-spin 0.8s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
