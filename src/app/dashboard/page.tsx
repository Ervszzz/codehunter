import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calcLevel, calcRank, Rank, XPEventType, RANK_TITLES, xpToNextRank, RANK_THRESHOLDS, getPrestigeTitle } from "@/lib/xp";
import { redirect } from "next/navigation";
import SyncButton from "./SyncButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      xpEvents: {
        orderBy: { occurredAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) redirect("/login");

  const rankProgress = xpToNextRank(user.totalXP);
  const prestigeTitle = getPrestigeTitle(user.prestigeTier);
  const rankStyle = RANK_STYLES[user.rank];

  // Per-event-type XP totals for stats
  const statsByType = await prisma.xPEvent.groupBy({
    by: ["eventType"],
    where: { userId: user.id },
    _sum: { xpAwarded: true },
    _count: { id: true },
  });
  const statsMap = Object.fromEntries(
    statsByType.map((s) => [s.eventType, { count: s._count.id, xp: s._sum.xpAwarded ?? 0 }])
  );

  return (
    <div className="min-h-screen" style={{ background: "#050810", color: "#e2e8f0" }}>
      {/* Top nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(79,195,247,0.1)", background: "rgba(5,8,16,0.8)" }}
      >
        <span
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 20px rgba(79,195,247,0.4)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </span>

        <div className="flex items-center gap-4">
          {calcRank(user.totalXP) === "NATIONAL" && (
            <Link
              href="/prestige"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all animate-glow-pulse"
              style={{ color: "#7c4dff", border: "1px solid rgba(124,77,255,0.4)", background: "rgba(124,77,255,0.08)" }}
            >
              ★ Prestige
            </Link>
          )}
          <SyncButton />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hunter Card */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${rankStyle.border}30`,
            boxShadow: `0 0 40px ${rankStyle.border}08`,
          }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.username ?? "avatar"}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: `2px solid ${rankStyle.border}`, boxShadow: `0 0 16px ${rankStyle.border}40` }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold"
                style={{ background: rankStyle.bg, border: `2px solid ${rankStyle.border}`, color: rankStyle.color }}
              >
                {(user.username ?? "?")[0].toUpperCase()}
              </div>
            )}
            {/* Rank badge overlay */}
            <span
              className="absolute -bottom-2 -right-2 text-xs font-display font-bold px-2 py-0.5 rounded-full"
              style={{ background: rankStyle.bg, border: `1px solid ${rankStyle.border}`, color: rankStyle.color }}
            >
              {user.rank}
            </span>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-2xl font-display font-bold text-white truncate">
                {user.name ?? user.username}
              </h2>
              {user.username === OWNER_USERNAME && (
                <span
                  className="text-xs px-3 py-1 rounded-full font-display font-bold tracking-wider"
                  style={{
                    background: OWNER_STYLE.bg,
                    border: `1px solid ${OWNER_STYLE.border}`,
                    color: OWNER_STYLE.color,
                    boxShadow: `0 0 14px ${OWNER_STYLE.glow}`,
                    textShadow: `0 0 10px ${OWNER_STYLE.glow}`,
                  }}
                >
                  {OWNER_STYLE.label}
                </span>
              )}
              {user.prestigeTier > 0 && (() => {
                const ps = getPrestigeStyle(user.prestigeTier);
                return (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-display font-bold tracking-wider"
                    style={{
                      background: ps.bg,
                      border: `1px solid ${ps.border}`,
                      color: ps.color,
                      boxShadow: `0 0 12px ${ps.glow}`,
                      textShadow: `0 0 8px ${ps.glow}`,
                    }}
                  >
                    {ps.label} Prestige {toRoman(user.prestigeTier)}
                  </span>
                );
              })()}
            </div>
            <p className="text-slate-400 text-sm mb-3">@{user.username}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{ background: rankStyle.bg, border: `1px solid ${rankStyle.border}40`, color: rankStyle.color }}
              >
                {user.rank === "NATIONAL" ? "★" : user.rank} — {RANK_TITLES[user.rank]}
              </span>
              <span className="text-slate-400 text-sm">
                Level <span className="text-white font-bold">{user.level}</span>
              </span>
              {prestigeTitle && (() => {
                const ps = getPrestigeStyle(user.prestigeTier);
                return (
                  <span
                    className="text-sm font-display font-bold px-3 py-1 rounded-full"
                    style={{
                      background: ps.bg,
                      border: `1px solid ${ps.border}`,
                      color: ps.color,
                      boxShadow: `0 0 14px ${ps.glow}`,
                      textShadow: `0 0 10px ${ps.glow}`,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", marginRight: 5, verticalAlign: "middle", opacity: 0.85 }}>
                      <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/>
                    </svg>
                    &ldquo;{prestigeTitle}&rdquo;
                  </span>
                );
              })()}
            </div>
          </div>

          {/* XP total */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-4xl font-display font-black"
              style={{ color: rankStyle.color, textShadow: `0 0 20px ${rankStyle.border}40` }}
            >
              {user.totalXP.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 tracking-wider uppercase">Total XP</div>
            {user.lastSyncedAt && (
              <div className="text-xs text-slate-600 mt-1">
                Synced {timeAgo(user.lastSyncedAt)}
              </div>
            )}
          </div>
        </div>

        {/* XP Progress bar */}
        {rankProgress ? (
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(79,195,247,0.1)" }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-400">
                Progress to Rank{" "}
                <span
                  className="font-bold"
                  style={{ color: RANK_STYLES[rankProgress.rank].color }}
                >
                  {rankProgress.rank}
                </span>
              </span>
              <span className="text-sm text-slate-400">
                <span className="text-white font-semibold">{rankProgress.needed.toLocaleString()}</span> XP needed
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full animate-xp-bar"
                style={{
                  width: `${rankProgress.progress}%`,
                  background: `linear-gradient(90deg, ${rankStyle.border}, ${RANK_STYLES[rankProgress.rank].border})`,
                  boxShadow: `0 0 8px ${rankStyle.border}80`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>{RANK_THRESHOLDS[user.rank].toLocaleString()} XP</span>
              <span>{rankProgress.progress.toFixed(1)}%</span>
              <span>{RANK_THRESHOLDS[rankProgress.rank].toLocaleString()} XP</span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl p-5 text-center"
            style={{
              background: "rgba(255,213,79,0.05)",
              border: "1px solid rgba(255,213,79,0.3)",
              boxShadow: "0 0 30px rgba(255,213,79,0.1)",
            }}
          >
            <p className="font-display font-bold text-lg" style={{ color: "#ffd54f" }}>
              ★ NATIONAL LEVEL ACHIEVED ★
            </p>
            <p className="text-slate-400 text-sm mt-1">You have reached the pinnacle. Consider entering the Prestige.</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STAT_CARDS(statsMap).map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20` }}
            >
              <div className="text-2xl font-bold mb-0.5" style={{ color }}>
                {value}
              </div>
              <div className="text-sm text-slate-400">{label}</div>
              {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div>
          <h3
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "#4fc3f7" }}
          >
            Recent Activity
          </h3>
          {user.xpEvents.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center text-slate-500"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              No activity yet. Click &quot;Sync XP&quot; to pull your GitHub data.
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {user.xpEvents.map((event, i) => {
                const es = EVENT_STYLES[event.eventType];
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                      borderBottom: i < user.xpEvents.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: `${es.color}15`, color: es.color }}
                      >
                        {es.label}
                      </span>
                      <span className="text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                        {event.repoName ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold" style={{ color: es.color }}>
                        +{event.xpAwarded} XP
                      </span>
                      <span className="text-xs text-slate-600 hidden sm:block">
                        {timeAgo(event.occurredAt)}
                      </span>
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

// ── constants & helpers ───────────────────────────────────────────────────────

const OWNER_USERNAME = "Ervszzz";

const OWNER_STYLE = {
  label: "⚔ The Architect",
  color: "#ff4444",
  glow: "rgba(255,68,68,0.5)",
  bg: "rgba(255,68,68,0.08)",
  border: "rgba(255,68,68,0.45)",
};

// Per-tier prestige styling — each tier has a distinct color identity
const PRESTIGE_STYLES: Record<number, { color: string; glow: string; bg: string; border: string; label: string }> = {
  1: { color: "#fbbf24", glow: "rgba(251,191,36,0.4)",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.5)",  label: "★" },
  2: { color: "#a78bfa", glow: "rgba(167,139,250,0.4)", bg: "rgba(124,77,255,0.12)", border: "rgba(124,77,255,0.5)",  label: "◆" },
  3: { color: "#38bdf8", glow: "rgba(56,189,248,0.4)",  bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.5)",  label: "❄" },
  4: { color: "#f87171", glow: "rgba(248,113,113,0.4)", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.5)", label: "👑" },
};
function getPrestigeStyle(tier: number) {
  return PRESTIGE_STYLES[Math.min(tier, 4)] ?? PRESTIGE_STYLES[4];
}

const RANK_STYLES: Record<Rank, { bg: string; border: string; color: string }> = {
  E: { bg: "rgba(30,41,59,0.6)", border: "#94a3b8", color: "#94a3b8" },
  D: { bg: "rgba(5,46,22,0.6)", border: "#4ade80", color: "#4ade80" },
  C: { bg: "rgba(12,26,46,0.6)", border: "#4fc3f7", color: "#4fc3f7" },
  B: { bg: "rgba(26,9,56,0.6)", border: "#7c4dff", color: "#7c4dff" },
  A: { bg: "rgba(31,21,0,0.6)", border: "#ffd54f", color: "#ffd54f" },
  S: { bg: "rgba(31,0,0,0.6)", border: "#ef4444", color: "#ef4444" },
  NATIONAL: { bg: "rgba(26,10,0,0.6)", border: "#ff9800", color: "#ff9800" },
};

const EVENT_STYLES: Record<XPEventType, { label: string; color: string }> = {
  COMMIT: { label: "Commit", color: "#4fc3f7" },
  PULL_REQUEST: { label: "PR", color: "#7c4dff" },
  ISSUE: { label: "Issue", color: "#4ade80" },
  ACTIVE_DAY: { label: "Active Day", color: "#ffd54f" },
  STAR_EARNED: { label: "Star", color: "#ffd54f" },
  REPO_CREATED: { label: "New Repo", color: "#7c4dff" },
  FOLLOWER_GAINED: { label: "Follower", color: "#4ade80" },
  FORK_EARNED: { label: "Fork", color: "#4fc3f7" },
};

function STAT_CARDS(stats: Record<string, { count: number; xp: number }>) {
  return [
    {
      label: "Commits",
      value: (stats["COMMIT"]?.count ?? 0).toLocaleString(),
      sub: `+${(stats["COMMIT"]?.xp ?? 0).toLocaleString()} XP`,
      color: "#4fc3f7",
    },
    {
      label: "Pull Requests",
      value: (stats["PULL_REQUEST"]?.count ?? 0).toLocaleString(),
      sub: `+${(stats["PULL_REQUEST"]?.xp ?? 0).toLocaleString()} XP`,
      color: "#7c4dff",
    },
    {
      label: "Issues",
      value: (stats["ISSUE"]?.count ?? 0).toLocaleString(),
      sub: `+${(stats["ISSUE"]?.xp ?? 0).toLocaleString()} XP`,
      color: "#4ade80",
    },
    {
      label: "Active Days",
      value: (stats["ACTIVE_DAY"]?.count ?? 0).toLocaleString(),
      sub: `+${(stats["ACTIVE_DAY"]?.xp ?? 0).toLocaleString()} XP`,
      color: "#ffd54f",
    },
  ];
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
