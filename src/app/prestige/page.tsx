import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RANK_THRESHOLDS, PRESTIGE_TITLES, PRESTIGE_MULTIPLIERS, getPrestigeTitle, xpToNextRank, calcRank } from "@/lib/xp";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrestigeButton from "./PrestigeButton";

export default async function PrestigePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isEligible = calcRank(user.totalXP) === "NATIONAL";
  const nextTier = user.prestigeTier + 1;
  const nextTitle = getPrestigeTitle(nextTier) ?? PRESTIGE_TITLES[PRESTIGE_TITLES.length - 1];
  const nextMultiplier = PRESTIGE_MULTIPLIERS[Math.min(nextTier, 3)] ?? 2.0;
  const rankProgress = xpToNextRank(user.totalXP);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050810", color: "#e2e8f0" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(124,77,255,0.15)", background: "rgba(5,8,16,0.95)" }}
      >
        <Link
          href="/dashboard"
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 20px rgba(79,195,247,0.4)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider">
          ← Dashboard
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center px-6 py-12 relative overflow-hidden">
        {/* Deep void background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 30%, rgba(124,77,255,0.1) 0%, rgba(79,195,247,0.02) 50%, transparent 70%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,77,255,0.06) 0%, transparent 60%)",
        }} />

        {/* Rings */}
        <div className="absolute rounded-full border border-[#7c4dff]/10 animate-ring-spin pointer-events-none" style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="absolute rounded-full border border-[#7c4dff]/05 animate-ring-spin-reverse pointer-events-none" style={{ width: 1000, height: 1000, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="absolute rounded-full border border-[#ffd54f]/05 animate-ring-spin pointer-events-none" style={{ width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animationDuration: "8s" }} />

        <div className="relative z-10 w-full max-w-3xl space-y-10">

          {/* Hero title */}
          <div className="text-center pt-4">
            <p className="text-xs tracking-[0.6em] font-semibold uppercase mb-4" style={{ color: "rgba(124,77,255,0.7)" }}>
              ◆ Prestige System ◆
            </p>
            <h1
              className="font-display font-black text-5xl sm:text-7xl text-white mb-4 leading-none"
              style={{ textShadow: "0 0 60px rgba(124,77,255,0.5), 0 0 120px rgba(124,77,255,0.2)" }}
            >
              The Void<br />
              <span style={{ color: "#7c4dff" }}>Awaits</span>
            </h1>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sacrifice everything you have built.<br />
              <span style={{ color: "#a78bfa" }}>Return stronger. Your legacy is permanent.</span>
            </p>
          </div>

          {/* Earned prestige badges */}
          {user.prestigeTier > 0 && (
            <div className="flex justify-center gap-3 flex-wrap">
              {Array.from({ length: user.prestigeTier }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: "rgba(255,213,79,0.1)",
                    border: "1px solid rgba(255,213,79,0.5)",
                    boxShadow: "0 0 16px rgba(255,213,79,0.2)",
                  }}
                >
                  <span style={{ color: "#ffd54f", fontSize: "1rem" }}>★</span>
                  <span className="font-display font-bold text-sm" style={{ color: "#ffd54f" }}>
                    Prestige {toRoman(i + 1)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isEligible ? (
            <>
              {/* Gain / Lose — big cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* GAIN */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,213,79,0.08), rgba(255,152,0,0.04))",
                    border: "1px solid rgba(255,213,79,0.3)",
                    boxShadow: "0 0 30px rgba(255,213,79,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{ background: "#ffd54f", boxShadow: "0 0 8px rgba(255,213,79,0.6)" }}
                    />
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: "#ffd54f" }}>
                      You Will Gain
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Badge</div>
                      <div className="font-display font-bold text-xl" style={{ color: "#ffd54f", textShadow: "0 0 16px rgba(255,213,79,0.4)" }}>
                        ★ Prestige {toRoman(nextTier)}
                        <span className="text-xs font-normal text-slate-500 ml-2">(permanent)</span>
                      </div>
                    </li>
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Title</div>
                      <div className="font-semibold text-lg" style={{ color: "#a78bfa" }}>
                        &ldquo;{nextTitle}&rdquo;
                      </div>
                    </li>
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">XP Multiplier</div>
                      <div className="font-display font-black text-3xl" style={{ color: "#4fc3f7", textShadow: "0 0 16px rgba(79,195,247,0.4)" }}>
                        {nextMultiplier}x
                        <span className="text-sm font-normal text-slate-400 ml-2">on all future XP</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* LOSE */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(127,29,29,0.04))",
                    border: "1px solid rgba(239,68,68,0.25)",
                    boxShadow: "0 0 30px rgba(239,68,68,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{ background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)" }}
                    />
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: "#ef4444" }}>
                      The Cost
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">XP</div>
                      <div className="font-display font-black text-3xl text-white line-through decoration-red-500/60">
                        {user.totalXP.toLocaleString()}
                        <span className="text-sm no-underline text-slate-500 ml-2">→ 0</span>
                      </div>
                    </li>
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rank</div>
                      <div className="font-display font-bold text-xl text-white line-through decoration-red-500/60">
                        ★ National
                        <span className="text-sm no-underline text-slate-500 ml-2">→ E</span>
                      </div>
                    </li>
                    <li>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Level</div>
                      <div className="font-display font-bold text-xl text-white line-through decoration-red-500/60">
                        {user.level}
                        <span className="text-sm no-underline text-slate-500 ml-2">→ 1</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tier roadmap */}
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-600 mb-4 text-center">
                  Prestige Roadmap
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((tier) => {
                    const title = PRESTIGE_TITLES[tier - 1];
                    const mult = PRESTIGE_MULTIPLIERS[Math.min(tier, 3)] ?? 2.0;
                    const unlocked = tier <= user.prestigeTier;
                    const isCurrent = tier === nextTier;
                    return (
                      <div
                        key={tier}
                        className="rounded-xl p-4 text-center relative overflow-hidden"
                        style={{
                          background: unlocked
                            ? "linear-gradient(135deg, rgba(255,213,79,0.12), rgba(255,152,0,0.06))"
                            : isCurrent
                            ? "linear-gradient(135deg, rgba(124,77,255,0.15), rgba(79,195,247,0.05))"
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${
                            unlocked ? "rgba(255,213,79,0.4)"
                            : isCurrent ? "rgba(124,77,255,0.5)"
                            : "rgba(255,255,255,0.06)"
                          }`,
                          boxShadow: isCurrent ? "0 0 20px rgba(124,77,255,0.2)" : unlocked ? "0 0 16px rgba(255,213,79,0.1)" : "none",
                        }}
                      >
                        {isCurrent && (
                          <div
                            className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ background: "linear-gradient(90deg, transparent, #7c4dff, transparent)" }}
                          />
                        )}
                        <div
                          className="font-display font-black text-2xl mb-1"
                          style={{
                            color: unlocked ? "#ffd54f" : isCurrent ? "#a78bfa" : "#1e293b",
                            textShadow: isCurrent ? "0 0 16px rgba(124,77,255,0.5)" : unlocked ? "0 0 12px rgba(255,213,79,0.4)" : "none",
                          }}
                        >
                          {unlocked ? "★" : isCurrent ? "◆" : "◇"} {toRoman(tier)}
                        </div>
                        <div className="text-xs mb-2" style={{ color: unlocked || isCurrent ? "#94a3b8" : "#334155" }}>
                          {title}
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color: unlocked ? "#4fc3f7" : isCurrent ? "#7c4dff" : "#1e293b" }}
                        >
                          {mult}x
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* THE BUTTON */}
              <div className="flex justify-center py-6">
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
                className="rounded-2xl p-10 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(124,77,255,0.06), rgba(79,195,247,0.02))",
                  border: "1px solid rgba(124,77,255,0.15)",
                }}
              >
                <div className="font-display font-black text-5xl text-slate-700 mb-4">
                  {RANK_THRESHOLDS.NATIONAL.toLocaleString()}
                </div>
                <p className="text-slate-400 mb-1">XP required to unlock Prestige</p>
                <p className="text-slate-600 text-sm mb-8">
                  You have <span className="text-white font-bold">{user.totalXP.toLocaleString()}</span> XP
                </p>

                {/* big progress bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((user.totalXP / RANK_THRESHOLDS.NATIONAL) * 100, 100)}%`,
                        background: "linear-gradient(90deg, #4fc3f7, #7c4dff)",
                        boxShadow: "0 0 8px rgba(124,77,255,0.5)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    {((user.totalXP / RANK_THRESHOLDS.NATIONAL) * 100).toFixed(2)}% to National Level
                  </p>
                </div>
              </div>

              {/* Locked roadmap */}
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-700 mb-4 text-center">
                  What Awaits
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((tier) => (
                    <div
                      key={tier}
                      className="rounded-xl p-4 text-center"
                      style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="font-display font-black text-2xl mb-1 text-slate-800">
                        ◇ {toRoman(tier)}
                      </div>
                      <div className="text-xs text-slate-700 mb-1">{PRESTIGE_TITLES[tier - 1]}</div>
                      <div className="text-sm font-bold text-slate-700">
                        {PRESTIGE_MULTIPLIERS[Math.min(tier, 3)] ?? 2.0}x
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
