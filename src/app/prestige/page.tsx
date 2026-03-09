import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RANK_THRESHOLDS, PRESTIGE_TITLES, PRESTIGE_MULTIPLIERS, getPrestigeTitle, xpToNextRank } from "@/lib/xp";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrestigeButton from "./PrestigeButton";

export default async function PrestigePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isEligible = user.rank === "NATIONAL";
  const nextTier = user.prestigeTier + 1;
  const nextTitle = getPrestigeTitle(nextTier) ?? PRESTIGE_TITLES[PRESTIGE_TITLES.length - 1];
  const nextMultiplier = PRESTIGE_MULTIPLIERS[Math.min(nextTier, 3)] ?? 2.0;
  const rankProgress = xpToNextRank(user.totalXP);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050810", color: "#e2e8f0" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(124,77,255,0.15)", background: "rgba(5,8,16,0.9)" }}
      >
        <Link
          href="/dashboard"
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 20px rgba(79,195,247,0.4)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        {/* Background void effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,77,255,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full border border-[#7c4dff]/10 animate-ring-spin pointer-events-none"
          style={{ width: 600, height: 600 }}
        />
        <div
          className="absolute rounded-full border border-[#7c4dff]/05 animate-ring-spin-reverse pointer-events-none"
          style={{ width: 900, height: 900 }}
        />

        <div className="relative z-10 w-full max-w-3xl space-y-10">
          {/* Title */}
          <div className="text-center">
            <p className="text-xs tracking-[0.5em] text-[#7c4dff]/60 font-semibold uppercase mb-2">
              Prestige System
            </p>
            <h1
              className="font-display font-black text-4xl sm:text-5xl text-white mb-3"
              style={{ textShadow: "0 0 40px rgba(124,77,255,0.4)" }}
            >
              The Void Awaits
            </h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Sacrifice everything you have built. Return stronger. Your legacy is permanent.
            </p>
          </div>

          {/* Current prestige badges */}
          {user.prestigeTier > 0 && (
            <div className="flex justify-center gap-3 flex-wrap">
              {Array.from({ length: user.prestigeTier }).map((_, i) => (
                <span
                  key={i}
                  className="text-sm px-4 py-1.5 rounded-full font-display font-bold"
                  style={{
                    background: "rgba(255,213,79,0.1)",
                    border: "1px solid rgba(255,213,79,0.4)",
                    color: "#ffd54f",
                  }}
                >
                  ★ Prestige {toRoman(i + 1)}
                </span>
              ))}
            </div>
          )}

          {isEligible ? (
            <>
              {/* What you gain / lose */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: "rgba(255,213,79,0.04)", border: "1px solid rgba(255,213,79,0.2)" }}
                >
                  <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#ffd54f" }}>
                    You Will Gain
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#ffd54f" }}>★</span>
                      <span className="text-white font-bold">Prestige {toRoman(nextTier)}</span>
                      <span className="text-slate-400">badge (permanent)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#7c4dff" }}>◆</span>
                      <span className="text-white font-bold">&quot;{nextTitle}&quot;</span>
                      <span className="text-slate-400">title</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#4fc3f7" }}>▲</span>
                      <span className="text-white font-bold">{nextMultiplier}x</span>
                      <span className="text-slate-400">permanent XP multiplier</span>
                    </li>
                  </ul>
                </div>

                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#ef4444" }}>
                    You Will Lose
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#ef4444" }}>✕</span>
                      <span className="text-slate-300">All XP reset to</span>
                      <span className="text-white font-bold">0</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#ef4444" }}>✕</span>
                      <span className="text-slate-300">Rank reset to</span>
                      <span className="text-white font-bold">E — Novice Coder</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span style={{ color: "#ef4444" }}>✕</span>
                      <span className="text-slate-300">Level reset to</span>
                      <span className="text-white font-bold">1</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* All prestige tiers roadmap */}
              <div
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-4">
                  Prestige Roadmap
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((tier) => {
                    const title = PRESTIGE_TITLES[tier - 1];
                    const mult = PRESTIGE_MULTIPLIERS[Math.min(tier, 3)] ?? 2.0;
                    const unlocked = tier <= user.prestigeTier;
                    const isCurrent = tier === nextTier;
                    return (
                      <div
                        key={tier}
                        className="rounded-lg p-3 text-center"
                        style={{
                          background: unlocked
                            ? "rgba(255,213,79,0.08)"
                            : isCurrent
                            ? "rgba(124,77,255,0.1)"
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${
                            unlocked
                              ? "rgba(255,213,79,0.3)"
                              : isCurrent
                              ? "rgba(124,77,255,0.4)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                        }}
                      >
                        <div
                          className="text-lg font-display font-bold mb-1"
                          style={{ color: unlocked ? "#ffd54f" : isCurrent ? "#7c4dff" : "#475569" }}
                        >
                          {unlocked ? "★" : "◇"} {toRoman(tier)}
                        </div>
                        <div className="text-xs text-slate-400 mb-1">{title}</div>
                        <div className="text-xs font-bold" style={{ color: isCurrent || unlocked ? "#4fc3f7" : "#334155" }}>
                          {mult}x XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* The button */}
              <div className="flex justify-center pt-4">
                <PrestigeButton
                  currentTier={user.prestigeTier}
                  nextTitle={nextTitle}
                  nextMultiplier={nextMultiplier}
                />
              </div>
            </>
          ) : (
            /* Not eligible */
            <div className="space-y-6">
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-slate-400 mb-2">
                  Prestige unlocks at{" "}
                  <span className="text-white font-bold">★ National Level</span>{" "}
                  (300,000 XP)
                </p>
                <p className="text-sm text-slate-500">
                  Current XP:{" "}
                  <span className="text-white font-semibold">{user.totalXP.toLocaleString()}</span>
                  {" / "}
                  <span className="text-white font-semibold">
                    {RANK_THRESHOLDS.NATIONAL.toLocaleString()}
                  </span>
                </p>

                {rankProgress && (
                  <div className="mt-6">
                    <div className="h-2 rounded-full overflow-hidden mx-auto max-w-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(user.totalXP / RANK_THRESHOLDS.NATIONAL) * 100}%`,
                          background: "linear-gradient(90deg, #4fc3f7, #7c4dff)",
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {((user.totalXP / RANK_THRESHOLDS.NATIONAL) * 100).toFixed(2)}% to National Level
                    </p>
                  </div>
                )}
              </div>

              {/* Still show the prestige roadmap */}
              <div
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-4">
                  What Awaits You
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((tier) => (
                    <div
                      key={tier}
                      className="rounded-lg p-3 text-center"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="text-lg font-display font-bold mb-1" style={{ color: "#334155" }}>
                        ◇ {toRoman(tier)}
                      </div>
                      <div className="text-xs text-slate-600 mb-1">{PRESTIGE_TITLES[tier - 1]}</div>
                      <div className="text-xs font-bold" style={{ color: "#334155" }}>
                        {PRESTIGE_MULTIPLIERS[Math.min(tier, 3)] ?? 2.0}x XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [[4, "IV"], [3, "III"], [2, "II"], [1, "I"]];
  for (const [val, str] of map) if (n >= val) return str;
  return String(n);
}
