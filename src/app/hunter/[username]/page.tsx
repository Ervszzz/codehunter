import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Rank,
  RANK_TITLES,
  RANK_THRESHOLDS,
  XPEventType,
  calcLevel,
  calcRank,
  xpToNextRank,
  getPrestigeTitle,
} from "@/lib/xp";
import ShareButton from "./ShareButton";

// ── Constants ─────────────────────────────────────────────────────────────────
const OWNER_USERNAME = "Ervszzz";

const ARCHITECT = {
  primary: "#ff4444",
  glow:    "rgba(255,68,68,0.6)",
  cardBg:  "rgba(20,4,4,0.97)",
};

const RANK_STYLES: Record<Rank, { bg: string; border: string; color: string }> = {
  E:        { bg: "rgba(30,41,59,0.6)",  border: "#94a3b8", color: "#94a3b8" },
  D:        { bg: "rgba(5,46,22,0.6)",   border: "#4ade80", color: "#4ade80" },
  C:        { bg: "rgba(12,26,46,0.6)",  border: "#4fc3f7", color: "#4fc3f7" },
  B:        { bg: "rgba(26,9,56,0.6)",   border: "#7c4dff", color: "#7c4dff" },
  A:        { bg: "rgba(31,21,0,0.6)",   border: "#ffd54f", color: "#ffd54f" },
  S:        { bg: "rgba(31,0,0,0.6)",    border: "#ef4444", color: "#ef4444" },
  NATIONAL: { bg: "rgba(26,10,0,0.6)",   border: "#ff9800", color: "#ff9800" },
};

const EVENT_STYLES: Record<XPEventType, { label: string; color: string }> = {
  COMMIT:          { label: "Commit",     color: "#4fc3f7" },
  PULL_REQUEST:    { label: "PR",         color: "#7c4dff" },
  ISSUE:           { label: "Issue",      color: "#4ade80" },
  ACTIVE_DAY:      { label: "Active Day", color: "#ffd54f" },
  STAR_EARNED:     { label: "Star",       color: "#ffd54f" },
  REPO_CREATED:    { label: "New Repo",   color: "#7c4dff" },
  FOLLOWER_GAINED: { label: "Follower",   color: "#4ade80" },
  FORK_EARNED:     { label: "Fork",       color: "#4fc3f7" },
};

interface Props {
  params: Promise<{ username: string }>;
}

export default async function HunterProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      xpEvents:     { orderBy: { occurredAt: "desc" }, take: 10 },
      achievements: true,
    },
  });

  if (!user) notFound();

  const isOwner      = user.username === OWNER_USERNAME;
  const liveRank     = calcRank(user.totalXP);
  const liveLevel    = calcLevel(user.totalXP);
  const rankStyle    = RANK_STYLES[liveRank];
  const rankProgress = xpToNextRank(user.totalXP);
  const prestigeTitle = getPrestigeTitle(user.prestigeTier);

  const statsByType = await prisma.xPEvent.groupBy({
    by: ["eventType"],
    where: { userId: user.id },
    _sum: { xpAwarded: true },
    _count: { id: true },
  });
  const statsMap = Object.fromEntries(
    statsByType.map((s) => [s.eventType, { count: s._count.id, xp: s._sum.xpAwarded ?? 0 }])
  );

  const accentColor = isOwner ? ARCHITECT.primary  : rankStyle.border;
  const accentGlow  = isOwner ? ARCHITECT.glow     : `${rankStyle.border}90`;
  const cardBg      = isOwner ? ARCHITECT.cardBg   : "rgba(6,10,20,0.97)";

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#050810", color: "#e2e8f0" }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {isOwner ? (
          <>
            <div className="absolute animate-orb-drift" style={{ top: "-5%", left: "10%", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,68,68,0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
            <div className="absolute animate-orb-drift" style={{ top: "50%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,20,20,0.10) 0%, transparent 70%)", filter: "blur(100px)", animationDelay: "-7s" }} />
            <div className="absolute animate-orb-drift" style={{ bottom: "10%", left: "30%", width: 400, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,68,68,0.07) 0%, transparent 70%)", filter: "blur(60px)", animationDelay: "-3s" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(80,0,0,0.35) 100%)" }} />
            <div className="absolute left-0 right-0 h-px animate-scan-line" style={{ background: "linear-gradient(90deg, transparent, rgba(255,68,68,0.4), transparent)", animationDuration: "10s" }} />
          </>
        ) : (
          <>
            <div className="absolute animate-orb-drift" style={{ top: "5%", left: "25%", width: 700, height: 350, borderRadius: "50%", background: `radial-gradient(ellipse, ${rankStyle.border}10 0%, transparent 70%)`, filter: "blur(60px)" }} />
            <div className="absolute animate-orb-drift" style={{ top: "55%", right: "5%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,77,255,0.08) 0%, transparent 70%)", filter: "blur(80px)", animationDelay: "-5s" }} />
            <div className="absolute left-0 right-0 h-px animate-scan-line" style={{ background: `linear-gradient(90deg, transparent, ${rankStyle.border}25, transparent)`, animationDuration: "12s" }} />
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className="relative flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
        style={{
          borderColor: isOwner ? "rgba(255,68,68,0.2)"    : "rgba(79,195,247,0.12)",
          background:  isOwner ? "rgba(10,2,2,0.90)"      : "rgba(5,8,16,0.85)",
          boxShadow:   isOwner ? "0 1px 0 rgba(255,68,68,0.15)" : "0 1px 0 rgba(79,195,247,0.08)",
          zIndex: 10,
        }}
      >
        <Link
          href="/dashboard"
          className="font-display font-bold tracking-widest text-lg"
          style={{
            color:      isOwner ? "#ff4444" : "#4fc3f7",
            textShadow: isOwner ? "0 0 30px rgba(255,68,68,0.7)" : "0 0 30px rgba(79,195,247,0.6)",
          }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
            style={{
              color:      isOwner ? "#ff4444" : "#4fc3f7",
              border:     isOwner ? "1px solid rgba(255,68,68,0.3)"  : "1px solid rgba(79,195,247,0.3)",
              background: isOwner ? "rgba(255,68,68,0.06)" : "rgba(79,195,247,0.06)",
            }}
          >
            ← Rankings
          </Link>
          <ShareButton />
        </div>
      </nav>

      <div className="relative max-w-3xl mx-auto px-6 py-10 space-y-6" style={{ zIndex: 1 }}>

        {/* ── Architect title banner ── */}
        {isOwner && (
          <div className="text-center py-6 space-y-3">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,68,68,0.6))" }} />
              <span style={{ color: "rgba(255,68,68,0.5)", fontSize: 18 }}>⚔</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(255,68,68,0.6))" }} />
            </div>
            <h1
              className="font-display font-black tracking-widest uppercase"
              style={{
                fontSize: "clamp(2rem, 7vw, 4.5rem)",
                color: "#ff4444",
                textShadow: "0 0 40px rgba(255,68,68,0.9), 0 0 80px rgba(255,68,68,0.5), 0 0 160px rgba(255,68,68,0.2)",
                letterSpacing: "0.1em",
              }}
            >
              The Architect
            </h1>
            <p className="text-sm font-display tracking-widest uppercase" style={{ color: "rgba(255,68,68,0.55)", letterSpacing: "0.25em" }}>
              Builder of CodeHunter &nbsp;·&nbsp; System Architect
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,68,68,0.25))" }} />
              <span
                className="text-xs font-mono tracking-widest px-3 py-1 rounded"
                style={{ color: "rgba(255,68,68,0.4)", border: "1px solid rgba(255,68,68,0.15)", background: "rgba(255,68,68,0.04)" }}
              >
                ACCESS LEVEL: ROOT
              </span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(255,68,68,0.25))" }} />
            </div>
          </div>
        )}

        {/* ── Hunter Card ── */}
        <div
          className="rounded-2xl p-px"
          style={{
            background: isOwner
              ? "linear-gradient(135deg, #ff4444 0%, rgba(255,68,68,0.5) 30%, rgba(255,68,68,0.15) 60%, #ff4444 100%)"
              : `linear-gradient(135deg, ${rankStyle.border}ff 0%, ${rankStyle.border}60 30%, ${rankStyle.border}20 60%, ${rankStyle.border}80 100%)`,
            boxShadow: isOwner
              ? "0 0 0 1px rgba(255,68,68,0.25), 0 0 40px rgba(255,68,68,0.5), 0 0 100px rgba(255,68,68,0.25), 0 0 200px rgba(255,68,68,0.10)"
              : `0 0 0 1px ${rankStyle.border}30, 0 0 30px ${rankStyle.border}40, 0 0 80px ${rankStyle.border}20`,
          }}
        >
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6" style={{ background: cardBg }}>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="rounded-full p-px"
                style={{
                  background: isOwner
                    ? "linear-gradient(135deg, #ff4444, rgba(255,68,68,0.4), #ff4444)"
                    : `linear-gradient(135deg, ${rankStyle.border}ff, ${rankStyle.border}60, ${rankStyle.border}ff)`,
                  boxShadow: isOwner
                    ? "0 0 0 1px rgba(255,68,68,0.3), 0 0 20px rgba(255,68,68,0.8), 0 0 50px rgba(255,68,68,0.5)"
                    : `0 0 0 1px ${rankStyle.border}40, 0 0 16px ${rankStyle.border}70, 0 0 32px ${rankStyle.border}40`,
                }}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.username ?? "avatar"} className="w-20 h-20 rounded-full object-cover block" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold" style={{ background: rankStyle.bg, color: rankStyle.color }}>
                    {(user.username ?? "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span
                className="absolute -bottom-1 -right-1 text-xs font-display font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: rankStyle.bg,
                  border: `1px solid ${rankStyle.border}cc`,
                  color: rankStyle.color,
                  boxShadow: `0 0 12px ${rankStyle.border}80`,
                }}
              >
                {liveRank}
              </span>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2
                  className="text-2xl font-display font-bold text-white truncate"
                  style={{
                    textShadow: isOwner
                      ? "0 0 30px rgba(255,68,68,0.4), 0 0 60px rgba(255,68,68,0.15)"
                      : "0 0 20px rgba(255,255,255,0.2)",
                  }}
                >
                  {user.name ?? user.username}
                </h2>
                {isOwner && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-display font-bold tracking-wider"
                    style={{
                      background: "rgba(255,68,68,0.10)",
                      border: "1px solid rgba(255,68,68,0.5)",
                      color: "#ff4444",
                      boxShadow: "0 0 20px rgba(255,68,68,0.6)",
                      textShadow: "0 0 12px rgba(255,68,68,0.8)",
                    }}
                  >
                    ⚔ The Architect
                  </span>
                )}
                {user.prestigeTier > 0 && (() => {
                  const ps = getPrestigeStyle(user.prestigeTier);
                  return (
                    <span
                      className="text-xs px-3 py-1 rounded-full font-display font-bold tracking-wider"
                      style={{ background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color, boxShadow: `0 0 12px ${ps.glow}` }}
                    >
                      {ps.label} Prestige {toRoman(user.prestigeTier)}
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm mb-3" style={{ color: isOwner ? "rgba(255,68,68,0.45)" : "rgba(148,163,184,0.5)" }}>
                @{user.username}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-full"
                  style={{ background: rankStyle.bg, border: `1px solid ${rankStyle.border}50`, color: rankStyle.color, boxShadow: `0 0 12px ${rankStyle.border}30` }}
                >
                  {liveRank === "NATIONAL" ? "★" : liveRank} — {RANK_TITLES[liveRank]}
                </span>
                <span className="text-slate-400 text-sm">
                  Lv. <span className="font-bold text-white">{liveLevel}</span>
                </span>
                {prestigeTitle && (() => {
                  const ps = getPrestigeStyle(user.prestigeTier);
                  return (
                    <span
                      className="text-sm font-display font-bold px-3 py-1 rounded-full"
                      style={{ background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color, boxShadow: `0 0 14px ${ps.glow}`, textShadow: `0 0 10px ${ps.glow}` }}
                    >
                      &ldquo;{prestigeTitle}&rdquo;
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* XP total */}
            <div className="text-right flex-shrink-0">
              <div
                className="font-display font-black"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  color: isOwner ? "#ff4444" : rankStyle.color,
                  textShadow: isOwner
                    ? "0 0 30px rgba(255,68,68,1), 0 0 60px rgba(255,68,68,0.5)"
                    : `0 0 30px ${rankStyle.border}80`,
                  letterSpacing: "-0.02em",
                }}
              >
                {user.totalXP.toLocaleString()}
              </div>
              <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: isOwner ? "rgba(255,68,68,0.45)" : "rgba(148,163,184,0.5)" }}>
                Total XP
              </div>
              {user.achievements.length > 0 && (
                <div className="text-xs mt-1.5 font-semibold" style={{ color: "#ffd54f" }}>
                  ★ {user.achievements.length} Achievement{user.achievements.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── XP Progress bar ── */}
        {rankProgress ? (
          <div
            className="rounded-xl p-5"
            style={{
              background: isOwner ? "rgba(255,68,68,0.03)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${isOwner ? "rgba(255,68,68,0.2)" : `${rankStyle.border}20`}`,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold tracking-wider" style={{ color: "rgba(226,232,240,0.7)" }}>
                Progress to Rank{" "}
                <span className="font-bold" style={{ color: RANK_STYLES[rankProgress.rank].color }}>
                  {rankProgress.rank} — {RANK_TITLES[rankProgress.rank]}
                </span>
              </span>
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                {rankProgress.needed.toLocaleString()} XP left
              </span>
            </div>
            <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "rgba(10,14,26,0.9)" }}>
              <div
                className="relative h-full rounded-full overflow-hidden"
                style={{
                  width: `${rankProgress.progress}%`,
                  background: accentColor,
                  boxShadow: `0 0 10px ${accentGlow}, 0 0 20px ${isOwner ? "rgba(255,68,68,0.3)" : `${rankStyle.border}40`}`,
                }}
              >
                <div className="absolute inset-0 xp-bar-shimmer" style={{ mixBlendMode: "overlay" }} />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
              <span>{RANK_THRESHOLDS[liveRank].toLocaleString()} XP</span>
              <span style={{ color: accentColor }}>{rankProgress.progress.toFixed(1)}%</span>
              <span>{RANK_THRESHOLDS[rankProgress.rank].toLocaleString()} XP</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-5 text-center" style={{ background: "rgba(255,213,79,0.04)", border: "1px solid rgba(255,213,79,0.4)", boxShadow: "0 0 40px rgba(255,213,79,0.12)" }}>
            <p className="font-display font-bold text-lg shimmer-text">★ NATIONAL LEVEL ACHIEVED ★</p>
            <p className="text-slate-400 text-sm mt-1">This hunter has reached the pinnacle.</p>
          </div>
        )}

        {/* ── Stats grid ── */}
        <div>
          <SectionDivider label="Hunter Stats" color={isOwner ? ARCHITECT.primary : "#4fc3f7"} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STAT_CARDS(statsMap, isOwner ? ARCHITECT.primary : undefined).map(({ label, value, sub, color }) => (
              <div
                key={label}
                className="rounded-xl p-5 card-hover relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20`, boxShadow: `0 0 20px ${color}08` }}
              >
                <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
                <div className="text-3xl font-display font-black mb-1" style={{ color, textShadow: `0 0 20px ${color}60` }}>{value}</div>
                <div className="text-sm text-slate-400 font-semibold">{label}</div>
                {sub && <div className="text-xs mt-1" style={{ color: `${color}70` }}>{sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <SectionDivider label="Recent Activity" color={isOwner ? ARCHITECT.primary : "#4fc3f7"} />
          {user.xpEvents.length === 0 ? (
            <div className="rounded-xl p-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-slate-400 text-sm">No activity synced yet.</p>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border:     isOwner ? "1px solid rgba(255,68,68,0.15)"  : "1px solid rgba(255,255,255,0.07)",
                boxShadow:  isOwner ? "0 0 40px rgba(255,68,68,0.08)"   : "0 0 40px rgba(0,0,0,0.4)",
              }}
            >
              {user.xpEvents.map((event, i) => {
                const es = EVENT_STYLES[event.eventType as XPEventType];
                return (
                  <div
                    key={event.id}
                    className="activity-row flex items-center justify-between px-5 py-3 text-sm"
                    style={{
                      background:   i % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.2)",
                      borderBottom: i < user.xpEvents.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      borderLeft:   isOwner ? "3px solid rgba(255,68,68,0.4)" : `3px solid ${es.color}60`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md" style={{ background: `${es.color}15`, color: es.color, border: `1px solid ${es.color}30` }}>
                        {es.label}
                      </span>
                      <span className="text-slate-400 truncate max-w-[180px] sm:max-w-xs text-xs">{event.repoName ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold text-sm" style={{ color: isOwner ? "#ff6666" : es.color }}>
                        +{event.xpAwarded} XP
                      </span>
                      <span className="text-xs hidden sm:block" style={{ color: "rgba(148,163,184,0.4)" }}>{timeAgo(event.occurredAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionDivider({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}50, transparent)` }} />
      <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</h3>
      <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${color}50, transparent)` }} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRESTIGE_STYLES: Record<number, { color: string; glow: string; bg: string; border: string; label: string }> = {
  1: { color: "#fbbf24", glow: "rgba(251,191,36,0.4)",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.5)",  label: "★" },
  2: { color: "#a78bfa", glow: "rgba(167,139,250,0.4)", bg: "rgba(124,77,255,0.12)", border: "rgba(124,77,255,0.5)",  label: "◆" },
  3: { color: "#38bdf8", glow: "rgba(56,189,248,0.4)",  bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.5)",  label: "❄" },
  4: { color: "#f87171", glow: "rgba(248,113,113,0.4)", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.5)", label: "👑" },
};
function getPrestigeStyle(tier: number) {
  return PRESTIGE_STYLES[Math.min(tier, 4)] ?? PRESTIGE_STYLES[4];
}

function STAT_CARDS(stats: Record<string, { count: number; xp: number }>, overrideColor?: string) {
  return [
    { label: "Commits",       key: "COMMIT",       color: "#4fc3f7" },
    { label: "Pull Requests", key: "PULL_REQUEST",  color: "#7c4dff" },
    { label: "Issues",        key: "ISSUE",         color: "#4ade80" },
    { label: "Active Days",   key: "ACTIVE_DAY",    color: "#ffd54f" },
  ].map(({ label, key, color }) => ({
    label,
    value: (stats[key]?.count ?? 0).toLocaleString(),
    sub:   `+${(stats[key]?.xp ?? 0).toLocaleString()} XP`,
    color: overrideColor ?? color,
  }));
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toRoman(n: number): string {
  const map: [number, string][] = [[4, "IV"], [3, "III"], [2, "II"], [1, "I"]];
  for (const [val, str] of map) if (n >= val) return str;
  return String(n);
}
