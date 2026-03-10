"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncUserXP } from "@/actions/syncXP";
import { getAchievementInfo } from "@/lib/achievements";

interface SyncState {
  xpGained: number;
  levelUp: boolean;
  newLevel: number;
  rankUp: boolean;
  newRank: string;
  newAchievements: string[];
}

export default function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (errorTimerRef.current !== null) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }

  function handleSync() {
    clearTimers();
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await syncUserXP();
        if (res.success) {
          setResult({
            xpGained: res.xpGained,
            levelUp: res.levelUp,
            newLevel: res.newLevel,
            rankUp: res.rankUp,
            newRank: res.newRank,
            newAchievements: res.newAchievements,
          });
          router.refresh();
          // Auto-dismiss after 6s if there are achievements, otherwise 4s
          const delay = res.newAchievements.length > 0 ? 6000 : 4000;
          dismissTimerRef.current = setTimeout(() => {
            setResult(null);
            dismissTimerRef.current = null;
          }, delay);
        } else {
          setError(res.error ?? "Sync failed");
          errorTimerRef.current = setTimeout(() => {
            setError(null);
            errorTimerRef.current = null;
          }, 5000);
        }
      } catch (e) {
        setError(String(e));
        errorTimerRef.current = setTimeout(() => {
          setError(null);
          errorTimerRef.current = null;
        }, 5000);
      }
    });
  }

  const hasNotifications =
    result !== null &&
    (result.xpGained > 0 || result.levelUp || result.rankUp || result.newAchievements.length > 0);

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Button row */}
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

        {/* Inline XP gained / up-to-date */}
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
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>

      {/* Notification panel — level-up, rank-up, achievements */}
      {hasNotifications && (
        <div
          className="flex flex-col gap-1.5 rounded-xl p-3 min-w-[220px] max-w-xs"
          style={{
            background: "rgba(6,10,20,0.95)",
            border: "1px solid rgba(79,195,247,0.2)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Level-up */}
          {result.levelUp && (
            <div
              className="flex items-center gap-2 text-sm font-bold px-2 py-1 rounded-lg"
              style={{
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.25)",
                color: "#4ade80",
              }}
            >
              <span style={{ fontSize: "1rem" }}>&#x2B06;</span>
              Level Up! → Lv.{result.newLevel}
            </div>
          )}

          {/* Rank-up */}
          {result.rankUp && (
            <div
              className="flex items-center gap-2 text-sm font-bold px-2 py-1 rounded-lg"
              style={{
                background: "rgba(255,213,79,0.08)",
                border: "1px solid rgba(255,213,79,0.30)",
                color: "#ffd54f",
              }}
            >
              <span style={{ fontSize: "1rem" }}>&#9733;</span>
              Rank Up! → {result.newRank}
            </div>
          )}

          {/* Achievement unlocks */}
          {result.newAchievements.length > 0 && (
            <div className="flex flex-col gap-1 mt-0.5">
              <div
                className="text-xs font-bold uppercase tracking-widest px-2"
                style={{ color: "rgba(255,213,79,0.6)" }}
              >
                Achievement{result.newAchievements.length > 1 ? "s" : ""} Unlocked
              </div>
              {result.newAchievements.map((key) => {
                const info = getAchievementInfo(key);
                if (!info) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(255,213,79,0.07)",
                      border: "1px solid rgba(255,213,79,0.25)",
                      color: "#ffd54f",
                    }}
                  >
                    <span className="text-base leading-none">{info.icon}</span>
                    <span className="font-semibold">{info.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
