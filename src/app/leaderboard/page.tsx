import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Rank, RANK_TITLES, RANK_THRESHOLDS } from "@/lib/xp";

// ── Rank styles ───────────────────────────────────────────────────────────────
const RANK_STYLES: Record<Rank, { bg: string; border: string; color: string }> = {
  E: { bg: "rgba(30,41,59,0.6)", border: "#94a3b8", color: "#94a3b8" },
  D: { bg: "rgba(5,46,22,0.6)", border: "#4ade80", color: "#4ade80" },
  C: { bg: "rgba(12,26,46,0.6)", border: "#4fc3f7", color: "#4fc3f7" },
  B: { bg: "rgba(26,9,56,0.6)", border: "#7c4dff", color: "#7c4dff" },
  A: { bg: "rgba(31,21,0,0.6)", border: "#ffd54f", color: "#ffd54f" },
  S: { bg: "rgba(31,0,0,0.6)", border: "#ef4444", color: "#ef4444" },
  NATIONAL: { bg: "rgba(26,10,0,0.6)", border: "#ff9800", color: "#ff9800" },
};

// Top-3 position styling
const POSITION_STYLES: Record<number, { color: string; glow: string; label: string }> = {
  1: { color: "#ffd54f", glow: "rgba(255,213,79,0.35)", label: "#1" },
  2: { color: "#94a3b8", glow: "rgba(148,163,184,0.25)", label: "#2" },
  3: { color: "#b45309", glow: "rgba(180,83,9,0.25)", label: "#3" },
};

export default async function LeaderboardPage() {
  // Auth is optional — used only to highlight current user's row
  const session = await auth().catch(() => null);
  const currentUserId = session?.user?.id ?? null;

  const hunters = await prisma.user.findMany({
    where: { totalXP: { gt: 0 } },
    orderBy: { totalXP: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      totalXP: true,
      level: true,
      rank: true,
      prestigeTier: true,
    },
  });

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#050810", color: "#e2e8f0" }}>

      {/* ── Ambient glow orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute animate-orb-drift"
          style={{
            top: "5%", left: "20%", width: 600, height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(79,195,247,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute animate-orb-drift"
          style={{
            top: "60%", right: "10%", width: 400, height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,77,255,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-6s",
          }}
        />
        <div
          className="absolute left-0 right-0 h-px animate-scan-line"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.25), transparent)",
            animationDuration: "14s",
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav
        className="relative flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
        style={{
          borderColor: "rgba(79,195,247,0.12)",
          background: "rgba(5,8,16,0.85)",
          boxShadow: "0 1px 0 rgba(79,195,247,0.08)",
          zIndex: 10,
        }}
      >
        <Link
          href={currentUserId ? "/dashboard" : "/"}
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 30px rgba(79,195,247,0.6)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>

        <Link
          href={currentUserId ? "/dashboard" : "/"}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all gate-btn"
          style={{ color: "#4fc3f7" }}
        >
          ← Back
        </Link>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-10 space-y-8" style={{ zIndex: 1 }}>

        {/* ── Title ── */}
        <div className="text-center space-y-3">
          <h1
            className="font-display font-black tracking-widest uppercase shimmer-text"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Hunter Rankings
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Global leaderboard — updated every sync
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="h-px w-24" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.4))" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4fc3f7" }}>
              Top {hunters.length} Hunters
            </span>
            <div className="h-px w-24" style={{ background: "linear-gradient(270deg, transparent, rgba(79,195,247,0.4))" }} />
          </div>
        </div>

        {/* ── Leaderboard ── */}
        {hunters.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-4xl mb-4">⚔</p>
            <p className="font-display font-bold text-xl text-white mb-2">No Hunters Yet</p>
            <p className="text-slate-400 text-sm">Be the first to sync your GitHub activity and claim the top spot.</p>
            <Link
              href="/dashboard"
              className="inline-block mt-6 px-6 py-2 rounded-lg text-sm font-semibold gate-btn transition-all"
              style={{ color: "#4fc3f7" }}
            >
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(79,195,247,0.12)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 120px rgba(79,195,247,0.04)",
            }}
          >
            {hunters.map((hunter, i) => {
              const pos = i + 1;
              const rankStyle = RANK_STYLES[hunter.rank as Rank];
              const posStyle = POSITION_STYLES[pos];
              const isCurrentUser = hunter.id === currentUserId;
              const isTop3 = pos <= 3;

              // Row background: top3 tint → current user highlight → alternating
              let rowBg: string;
              if (isCurrentUser) {
                rowBg = `${rankStyle.border}12`;
              } else if (isTop3 && pos === 1) {
                rowBg = "rgba(255,213,79,0.04)";
              } else if (isTop3 && pos === 2) {
                rowBg = "rgba(148,163,184,0.04)";
              } else if (isTop3 && pos === 3) {
                rowBg = "rgba(180,83,9,0.04)";
              } else {
                rowBg = i % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.2)";
              }

              return (
                <div
                  key={hunter.id}
                  className="activity-row flex items-center gap-4 px-5 py-3.5"
                  style={{
                    background: rowBg,
                    borderBottom: i < hunters.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderLeft: isCurrentUser
                      ? `3px solid ${rankStyle.border}`
                      : isTop3
                      ? `3px solid ${posStyle?.color ?? "transparent"}60`
                      : "3px solid transparent",
                  }}
                >
                  {/* Position number */}
                  <div
                    className="flex-shrink-0 w-10 text-center font-display font-black text-sm"
                    style={{
                      color: posStyle?.color ?? "rgba(148,163,184,0.4)",
                      textShadow: posStyle ? `0 0 12px ${posStyle.glow}` : undefined,
                    }}
                  >
                    {posStyle ? posStyle.label : `#${pos}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-full p-px"
                      style={{
                        background: `linear-gradient(135deg, ${rankStyle.border}cc, ${rankStyle.border}40)`,
                        boxShadow: `0 0 8px ${rankStyle.border}40`,
                      }}
                    >
                      {hunter.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={hunter.avatarUrl}
                          alt={hunter.username ?? "avatar"}
                          className="w-10 h-10 rounded-full object-cover block"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold"
                          style={{ background: rankStyle.bg, color: rankStyle.color }}
                        >
                          {(hunter.username ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/hunter/${hunter.username}`}
                        className="font-bold text-white text-sm hover:underline truncate"
                        style={{ textShadow: isTop3 ? `0 0 16px ${posStyle?.glow}` : undefined }}
                      >
                        {hunter.name ?? hunter.username}
                      </Link>
                      {isCurrentUser && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: `${rankStyle.border}20`,
                            border: `1px solid ${rankStyle.border}60`,
                            color: rankStyle.color,
                          }}
                        >
                          ← YOU
                        </span>
                      )}
                      {hunter.prestigeTier > 0 && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: PRESTIGE_COLORS[Math.min(hunter.prestigeTier, 4)] ?? "#fbbf24" }}
                        >
                          {PRESTIGE_ICONS[Math.min(hunter.prestigeTier, 4)] ?? "★"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">@{hunter.username}</p>
                  </div>

                  {/* Rank badge */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <span
                      className="text-xs font-display font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: rankStyle.bg,
                        border: `1px solid ${rankStyle.border}50`,
                        color: rankStyle.color,
                        boxShadow: `0 0 10px ${rankStyle.border}20`,
                      }}
                    >
                      {hunter.rank}
                    </span>
                  </div>

                  {/* Level */}
                  <div className="flex-shrink-0 text-center hidden sm:block" style={{ minWidth: 48 }}>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Lv.</div>
                    <div className="font-bold text-sm text-white">{hunter.level}</div>
                  </div>

                  {/* Total XP */}
                  <div className="flex-shrink-0 text-right" style={{ minWidth: 90 }}>
                    <div
                      className="font-display font-black text-base"
                      style={{
                        color: rankStyle.color,
                        textShadow: isTop3 ? `0 0 20px ${rankStyle.border}70` : undefined,
                      }}
                    >
                      {hunter.totalXP.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-slate-700 pb-4">
          Rankings update on every GitHub sync — keep committing, hunter.
        </p>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

const PRESTIGE_COLORS: Record<number, string> = {
  1: "#fbbf24",
  2: "#a78bfa",
  3: "#38bdf8",
  4: "#f87171",
};

const PRESTIGE_ICONS: Record<number, string> = {
  1: "★",
  2: "◆",
  3: "❄",
  4: "👑",
};
