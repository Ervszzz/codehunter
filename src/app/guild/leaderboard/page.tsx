import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GuildRank } from "@prisma/client";

// ── Rank styles ───────────────────────────────────────────────────────────────

const GUILD_RANK_STYLES: Record<GuildRank, { bg: string; border: string; color: string }> = {
  BRONZE: { bg: "rgba(205,127,50,0.12)",  border: "#cd7f32", color: "#cd7f32" },
  SILVER: { bg: "rgba(148,163,184,0.10)", border: "#94a3b8", color: "#94a3b8" },
  GOLD:   { bg: "rgba(255,213,79,0.10)",  border: "#ffd54f", color: "#ffd54f" },
  SHADOW: { bg: "rgba(124,77,255,0.12)",  border: "#7c4dff", color: "#7c4dff" },
};

// Top-3 position styling
const POSITION_STYLES: Record<number, { color: string; glow: string; label: string }> = {
  1: { color: "#ffd54f", glow: "rgba(255,213,79,0.35)",  label: "#1" },
  2: { color: "#94a3b8", glow: "rgba(148,163,184,0.25)", label: "#2" },
  3: { color: "#b45309", glow: "rgba(180,83,9,0.25)",    label: "#3" },
};

export default async function GuildLeaderboardPage() {
  // Auth is optional — used only to determine back link destination
  const session = await auth().catch(() => null);
  const isLoggedIn = !!(session?.user?.id);

  const guilds = await prisma.guild.findMany({
    orderBy: { totalXP: "desc" },
    take: 50,
    select: {
      id: true,
      githubOrgLogin: true,
      name: true,
      avatarUrl: true,
      totalXP: true,
      rank: true,
      members: { select: { userId: true } },
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
            background: "radial-gradient(ellipse, rgba(79,195,247,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute animate-orb-drift"
          style={{
            top: "55%", right: "8%", width: 450, height: 450,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,77,255,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-7s",
          }}
        />
        <div
          className="absolute left-0 right-0 h-px animate-scan-line"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.22), transparent)",
            animationDuration: "16s",
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
          href="/"
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 30px rgba(79,195,247,0.6)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>

        <Link
          href={isLoggedIn ? "/guild" : "/leaderboard"}
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
            Guild Rankings
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Global guild leaderboard — ranked by total XP
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="h-px w-24" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,247,0.4))" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4fc3f7" }}>
              Top {guilds.length} Guild{guilds.length !== 1 ? "s" : ""}
            </span>
            <div className="h-px w-24" style={{ background: "linear-gradient(270deg, transparent, rgba(79,195,247,0.4))" }} />
          </div>
        </div>

        {/* ── Leaderboard ── */}
        {guilds.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-4xl mb-4">🛡</p>
            <p className="font-display font-bold text-xl text-white mb-2">No Guilds Yet</p>
            <p className="text-slate-400 text-sm">
              No guilds have been created yet. Be the first to establish one and lead your hunters to glory.
            </p>
            {isLoggedIn && (
              <Link
                href="/guild"
                className="inline-block mt-6 px-6 py-2 rounded-lg text-sm font-semibold gate-btn transition-all"
                style={{ color: "#4fc3f7" }}
              >
                Create a Guild →
              </Link>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(79,195,247,0.12)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 120px rgba(79,195,247,0.04)",
            }}
          >
            {guilds.map((guild, i) => {
              const pos = i + 1;
              const rankStyle = GUILD_RANK_STYLES[guild.rank];
              const posStyle = POSITION_STYLES[pos];
              const isTop3 = pos <= 3;
              const memberCount = guild.members.length;

              // Row background: top-3 tint → alternating
              let rowBg: string;
              if (isTop3 && pos === 1) {
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
                  key={guild.id}
                  className="activity-row flex items-center gap-4 px-5 py-3.5"
                  style={{
                    background: rowBg,
                    borderBottom: i < guilds.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderLeft: isTop3
                      ? `3px solid ${posStyle?.color ?? "transparent"}60`
                      : "3px solid transparent",
                  }}
                >
                  {/* Position */}
                  <div
                    className="flex-shrink-0 w-10 text-center font-display font-black text-sm"
                    style={{
                      color: posStyle?.color ?? "rgba(148,163,184,0.4)",
                      textShadow: posStyle ? `0 0 12px ${posStyle.glow}` : undefined,
                    }}
                  >
                    {posStyle ? posStyle.label : `#${pos}`}
                  </div>

                  {/* Guild avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-xl p-px"
                      style={{
                        background: `linear-gradient(135deg, ${rankStyle.border}cc, ${rankStyle.border}40)`,
                        boxShadow: `0 0 8px ${rankStyle.border}40`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={guild.avatarUrl ?? `https://github.com/${guild.githubOrgLogin}.png`}
                        alt={guild.name}
                        className="w-10 h-10 rounded-xl object-cover block"
                      />
                    </div>
                  </div>

                  {/* Guild identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold text-white text-sm truncate"
                        style={{ textShadow: isTop3 ? `0 0 16px ${posStyle?.glow}` : undefined }}
                      >
                        {guild.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 truncate">@{guild.githubOrgLogin}</p>
                      <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                      <span className="text-xs text-slate-500">
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                      </span>
                    </div>
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
                      {guild.rank}
                    </span>
                  </div>

                  {/* Members count (desktop only, separate column) */}
                  <div className="flex-shrink-0 text-center hidden md:block" style={{ minWidth: 52 }}>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Members</div>
                    <div className="font-bold text-sm text-white">{memberCount}</div>
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
                      {guild.totalXP.toLocaleString()}
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
          Guild XP is the sum of all member contributions — unite and conquer.
        </p>
      </div>
    </div>
  );
}
