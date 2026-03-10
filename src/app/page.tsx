import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RANK_TITLES } from "@/lib/xp";
import { SignInButton } from "./login/SignInButton";

export default async function LandingPage() {
  const session = await auth().catch(() => null);
  if (session?.user?.id) redirect("/dashboard");

  // Live stats
  const [hunterCount, xpSum, topHunters] = await Promise.all([
    prisma.user.count({ where: { totalXP: { gt: 0 } } }),
    prisma.user.aggregate({ _sum: { totalXP: true } }),
    prisma.user.findMany({
      where: { totalXP: { gt: 0 } },
      orderBy: { totalXP: "desc" },
      take: 5,
      select: { username: true, name: true, avatarUrl: true, totalXP: true, rank: true, level: true },
    }),
  ]);

  const totalXP = xpSum._sum.totalXP ?? 0;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#050810", color: "#e2e8f0" }}>

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute animate-orb-drift" style={{ top: "-10%", left: "15%", width: 900, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,195,247,0.07) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute animate-orb-drift" style={{ top: "40%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,77,255,0.07) 0%, transparent 70%)", filter: "blur(100px)", animationDelay: "-6s" }} />
        <div className="absolute animate-orb-drift" style={{ bottom: "5%", left: "35%", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,195,247,0.05) 0%, transparent 70%)", filter: "blur(60px)", animationDelay: "-3s" }} />
        <div className="absolute left-0 right-0 h-px animate-scan-line" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.2), transparent)", animationDuration: "14s" }} />
      </div>

      {/* ── Nav ── */}
      <nav
        className="relative flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
        style={{ borderColor: "rgba(79,195,247,0.1)", background: "rgba(5,8,16,0.8)", zIndex: 10 }}
      >
        <span className="font-display font-bold tracking-widest text-lg" style={{ color: "#4fc3f7", textShadow: "0 0 30px rgba(79,195,247,0.6)" }}>
          CODE<span className="text-white">HUNTER</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-xs font-semibold px-4 py-2 rounded-lg uppercase tracking-wider transition-all"
            style={{ color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.25)", background: "rgba(79,195,247,0.05)" }}
          >
            Rankings
          </Link>
          <SignInButton compact />
        </div>
      </nav>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center space-y-8">
          {/* Pre-title */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.5))" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(79,195,247,0.7)" }}>Solo Leveling for Developers</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(270deg, transparent, rgba(79,195,247,0.5))" }} />
          </div>

          {/* Main title */}
          <h1
            className="font-display font-black tracking-widest uppercase shimmer-text"
            style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 1, letterSpacing: "0.05em" }}
          >
            CodeHunter
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>
            Every commit earns XP. Every PR levels you up. Rise from <span style={{ color: "#94a3b8" }}>Rank E</span> to <span style={{ color: "#ff9800", fontWeight: 700 }}>National Level</span> — purely through your GitHub activity.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <SignInButton />
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 px-8 py-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all"
              style={{ color: "rgba(226,232,240,0.6)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              View Rankings →
            </Link>
          </div>

          {/* Live stats */}
          {hunterCount > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              {[
                { label: "Hunters",  value: hunterCount.toLocaleString() },
                { label: "Total XP", value: totalXP >= 1_000_000 ? `${(totalXP / 1_000_000).toFixed(1)}M` : totalXP >= 1_000 ? `${(totalXP / 1_000).toFixed(0)}K` : totalXP.toLocaleString() },
                { label: "Top Rank", value: topHunters[0]?.rank ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="font-display font-black text-2xl text-white" style={{ textShadow: "0 0 20px rgba(79,195,247,0.3)" }}>{value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 max-w-5xl mx-auto px-6">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.2))" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(79,195,247,0.4)" }}>How It Works</span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(79,195,247,0.2))" }} />
        </div>

        {/* ── How it works ── */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect GitHub",
                desc: "Sign in with your GitHub account. No private access needed — we only read your public activity.",
                color: "#4fc3f7",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Earn XP",
                desc: "Commits, pull requests, issues, active days — every action on GitHub is automatically converted to XP.",
                color: "#7c4dff",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Rise the Ranks",
                desc: "Climb from E-Rank novice to National Level Hunter. Compete on the global leaderboard. Prestige when you peak.",
                color: "#ffd54f",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, color, icon }) => (
              <div
                key={step}
                className="rounded-2xl p-6 relative overflow-hidden card-hover"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20`, boxShadow: `0 0 30px ${color}06` }}
              >
                <div className="absolute top-0 left-6 right-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                    {icon}
                  </div>
                  <span className="font-mono text-3xl font-black" style={{ color: `${color}25` }}>{step}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── XP table ── */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(124,77,255,0.3))" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7c4dff" }}>XP Sources</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(124,77,255,0.3))" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Commit",     xp: 15,  color: "#4fc3f7" },
              { label: "Pull Request", xp: 80, color: "#7c4dff" },
              { label: "Issue",      xp: 30,  color: "#4ade80" },
              { label: "Active Day", xp: 25,  color: "#ffd54f" },
              { label: "New Repo",   xp: 20,  color: "#7c4dff" },
              { label: "Star Earned", xp: 10, color: "#ffd54f" },
              { label: "Fork Earned", xp: 12, color: "#4fc3f7" },
              { label: "Follower",   xp: 50,  color: "#4ade80" },
            ].map(({ label, xp, color }) => (
              <div key={label} className="rounded-xl px-4 py-3 flex items-center justify-between card-hover" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}18` }}>
                <span className="text-sm text-slate-400">{label}</span>
                <span className="font-display font-bold text-sm" style={{ color, textShadow: `0 0 10px ${color}60` }}>+{xp} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Ranks showcase ── */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,213,79,0.3))" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#ffd54f" }}>The Ranks</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(255,213,79,0.3))" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {RANKS_DISPLAY.map(({ rank, title, color, threshold }) => (
              <div
                key={rank}
                className="rounded-xl p-4 text-center card-hover relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}25` }}
              >
                <div className="absolute top-0 left-2 right-2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
                <div className="font-display font-black text-2xl mb-1" style={{ color, textShadow: `0 0 20px ${color}60` }}>
                  {rank === "NATIONAL" ? "★" : rank}
                </div>
                <div className="text-xs font-bold text-white mb-1">{title}</div>
                <div className="text-xs" style={{ color: `${color}60` }}>
                  {threshold === 0 ? "Start" : threshold >= 1000 ? `${threshold / 1000}K XP` : `${threshold} XP`}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Top hunters ── */}
        {topHunters.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.3))" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4fc3f7" }}>Top Hunters</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(79,195,247,0.3))" }} />
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(79,195,247,0.1)", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
            >
              {topHunters.map((hunter, i) => {
                const rs = RANK_STYLE_MAP[hunter.rank as keyof typeof RANK_STYLE_MAP] ?? RANK_STYLE_MAP.E;
                const posColor = ["#ffd54f", "#94a3b8", "#b45309"][i] ?? "rgba(148,163,184,0.3)";
                return (
                  <Link
                    key={hunter.username}
                    href={`/hunter/${hunter.username}`}
                    className="flex items-center gap-4 px-5 py-4 transition-all activity-row"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.2)",
                      borderBottom: i < topHunters.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      borderLeft: `3px solid ${posColor}50`,
                    }}
                  >
                    <div className="font-display font-black text-sm w-8 text-center" style={{ color: posColor }}>
                      #{i + 1}
                    </div>
                    <div
                      className="rounded-full p-px flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${rs.border}cc, ${rs.border}40)`, boxShadow: `0 0 8px ${rs.border}40` }}
                    >
                      {hunter.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={hunter.avatarUrl} alt={hunter.username ?? ""} className="w-9 h-9 rounded-full object-cover block" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: rs.bg, color: rs.color }}>
                          {(hunter.username ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{hunter.name ?? hunter.username}</div>
                      <div className="text-xs text-slate-500">@{hunter.username}</div>
                    </div>
                    <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full hidden sm:block" style={{ background: rs.bg, border: `1px solid ${rs.border}50`, color: rs.color }}>
                      {hunter.rank}
                    </span>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-black text-sm" style={{ color: rs.color }}>{hunter.totalXP.toLocaleString()}</div>
                      <div className="text-xs text-slate-600">XP</div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <Link href="/leaderboard" className="text-sm font-semibold transition-all" style={{ color: "#4fc3f7" }}>
                View full leaderboard →
              </Link>
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <section className="max-w-3xl mx-auto px-6 pb-24 text-center space-y-6">
          <div
            className="rounded-2xl p-10 relative overflow-hidden"
            style={{ background: "rgba(79,195,247,0.03)", border: "1px solid rgba(79,195,247,0.15)", boxShadow: "0 0 80px rgba(79,195,247,0.06)" }}
          >
            <div className="absolute top-0 left-12 right-12 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.5), transparent)" }} />
            <h2 className="font-display font-black text-3xl text-white mb-3">Ready to Hunt?</h2>
            <p className="text-slate-400 mb-8">Connect your GitHub and claim your rank. Your coding history is already waiting.</p>
            <div className="flex justify-center">
              <SignInButton />
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t px-6 py-8 text-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-xs text-slate-600">
            Built by{" "}
            <Link href="/hunter/Ervszzz" className="transition-all hover:opacity-80" style={{ color: "#ff4444", textShadow: "0 0 10px rgba(255,68,68,0.4)" }}>
              ⚔ The Architect
            </Link>
            {" "}· Only public GitHub data is used · No private repository access
          </p>
        </footer>

      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const RANKS_DISPLAY = [
  { rank: "E",        title: RANK_TITLES.E,        color: "#94a3b8", threshold: 0       },
  { rank: "D",        title: RANK_TITLES.D,        color: "#4ade80", threshold: 2000    },
  { rank: "C",        title: RANK_TITLES.C,        color: "#4fc3f7", threshold: 8000    },
  { rank: "B",        title: RANK_TITLES.B,        color: "#7c4dff", threshold: 20000   },
  { rank: "A",        title: RANK_TITLES.A,        color: "#ffd54f", threshold: 50000   },
  { rank: "S",        title: RANK_TITLES.S,        color: "#ef4444", threshold: 120000  },
  { rank: "NATIONAL", title: "National",           color: "#ff9800", threshold: 300000  },
];

const RANK_STYLE_MAP = {
  E:        { bg: "rgba(30,41,59,0.6)",  border: "#94a3b8", color: "#94a3b8" },
  D:        { bg: "rgba(5,46,22,0.6)",   border: "#4ade80", color: "#4ade80" },
  C:        { bg: "rgba(12,26,46,0.6)",  border: "#4fc3f7", color: "#4fc3f7" },
  B:        { bg: "rgba(26,9,56,0.6)",   border: "#7c4dff", color: "#7c4dff" },
  A:        { bg: "rgba(31,21,0,0.6)",   border: "#ffd54f", color: "#ffd54f" },
  S:        { bg: "rgba(31,0,0,0.6)",    border: "#ef4444", color: "#ef4444" },
  NATIONAL: { bg: "rgba(26,10,0,0.6)",   border: "#ff9800", color: "#ff9800" },
};
