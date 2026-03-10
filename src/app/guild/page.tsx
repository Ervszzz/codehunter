import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GuildRank } from "@prisma/client";
import { Rank } from "@/lib/xp";
import LeaveGuildButton from "./LeaveGuildButton";
import JoinGuildButton from "./JoinGuildButton";
import CreateGuildForm from "./CreateGuildForm";

export default async function GuildPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      guildMember: {
        include: {
          guild: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, username: true, name: true, avatarUrl: true, totalXP: true, rank: true, level: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const guild = user.guildMember?.guild ?? null;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#050810", color: "#e2e8f0" }}>
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
          href="/dashboard"
          className="font-display font-bold tracking-widest text-lg"
          style={{ color: "#4fc3f7", textShadow: "0 0 30px rgba(79,195,247,0.6)" }}
        >
          CODE<span className="text-white">HUNTER</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all"
            style={{ color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)", background: "rgba(148,163,184,0.04)" }}
          >
            Dashboard
          </Link>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider"
            style={{ color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.4)", background: "rgba(79,195,247,0.08)" }}
          >
            Guild
          </span>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-10 space-y-8" style={{ zIndex: 1 }}>
        {/* ── Page header ── */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(79,195,247,0.3), transparent)" }} />
          <h1 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4fc3f7" }}>
            Guild System
          </h1>
          <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, rgba(79,195,247,0.3), transparent)" }} />
        </div>

        {guild ? (
          <GuildDashboard guild={guild} currentUserId={user.id} />
        ) : (
          <GuildLobby userId={user.id} />
        )}
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GuildWithMembers = {
  id: string;
  githubOrgLogin: string;
  name: string;
  avatarUrl: string | null;
  totalXP: number;
  rank: GuildRank;
  members: {
    user: {
      id: string;
      username: string | null;
      name: string | null;
      avatarUrl: string | null;
      totalXP: number;
      rank: Rank;
      level: number;
    };
  }[];
};

// ── Guild Dashboard (user is in a guild) ─────────────────────────────────────

function GuildDashboard({ guild, currentUserId }: { guild: GuildWithMembers; currentUserId: string }) {
  const rankStyle = GUILD_RANK_STYLES[guild.rank];
  const rankProgress = guildXPToNextRank(guild.totalXP);
  const sortedMembers = [...guild.members].sort((a, b) => b.user.totalXP - a.user.totalXP);

  return (
    <div className="space-y-6">
      {/* ── Guild Card ── */}
      <div
        className="rounded-2xl p-px"
        style={{
          background: `linear-gradient(135deg, ${rankStyle.border}ff 0%, ${rankStyle.border}60 40%, ${rankStyle.border}20 70%, ${rankStyle.border}80 100%)`,
          boxShadow: `0 0 0 1px ${rankStyle.border}30, 0 0 30px ${rankStyle.border}30, 0 0 80px ${rankStyle.border}15`,
        }}
      >
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{ background: "rgba(6,10,20,0.97)" }}
        >
          {/* Org Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="rounded-xl p-px"
              style={{
                background: `linear-gradient(135deg, ${rankStyle.border}ff, ${rankStyle.border}50, ${rankStyle.border}ff)`,
                boxShadow: `0 0 16px ${rankStyle.border}60, 0 0 32px ${rankStyle.border}30`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guild.avatarUrl ?? `https://github.com/${guild.githubOrgLogin}.png`}
                alt={guild.name}
                className="w-20 h-20 rounded-xl object-cover block"
              />
            </div>
            {/* Guild rank badge */}
            <span
              className="absolute -bottom-2 -right-2 text-xs font-display font-bold px-2 py-0.5 rounded-full"
              style={{
                background: rankStyle.bg,
                border: `1px solid ${rankStyle.border}cc`,
                color: rankStyle.color,
                boxShadow: `0 0 10px ${rankStyle.border}70`,
              }}
            >
              {guild.rank}
            </span>
          </div>

          {/* Guild info */}
          <div className="flex-1 min-w-0">
            <h2
              className="text-2xl font-display font-bold text-white truncate mb-0.5"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.15)" }}
            >
              {guild.name}
            </h2>
            <p className="text-slate-500 text-sm mb-3">@{guild.githubOrgLogin}</p>
            <div className="flex flex-wrap gap-3 items-center">
              <span
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  background: rankStyle.bg,
                  border: `1px solid ${rankStyle.border}60`,
                  color: rankStyle.color,
                  boxShadow: `0 0 12px ${rankStyle.border}30`,
                }}
              >
                {guild.rank} Guild
              </span>
              <span className="text-slate-400 text-sm">
                <span className="font-bold text-white">{guild.members.length}</span> member{guild.members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Total XP */}
          <div className="text-right flex-shrink-0">
            <div
              className="font-display font-black"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: rankStyle.color,
                textShadow: `0 0 30px ${rankStyle.border}70, 0 0 60px ${rankStyle.border}25`,
                letterSpacing: "-0.02em",
              }}
            >
              {guild.totalXP.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 tracking-widest uppercase mt-0.5">Guild XP</div>
          </div>
        </div>
      </div>

      {/* ── Guild Rank Progress ── */}
      {rankProgress ? (
        <div
          className="rounded-xl p-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${rankStyle.border}20`,
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold tracking-wider" style={{ color: "rgba(226,232,240,0.7)" }}>
              Progress to{" "}
              <span className="font-bold" style={{ color: GUILD_RANK_STYLES[rankProgress.rank].color }}>
                {rankProgress.rank}
              </span>{" "}
              Guild
            </span>
            <span className="text-sm font-bold" style={{ color: rankStyle.color }}>
              {rankProgress.needed.toLocaleString()} XP left
            </span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "rgba(10,14,26,0.9)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${rankProgress.progress}%`,
                background: rankStyle.border,
                boxShadow: `0 0 10px ${rankStyle.border}80`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            <span>{GUILD_RANK_XP[guild.rank].toLocaleString()} XP</span>
            <span style={{ color: rankStyle.color }}>{rankProgress.progress.toFixed(1)}%</span>
            <span>{GUILD_RANK_XP[rankProgress.rank].toLocaleString()} XP</span>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 text-center"
          style={{
            background: "rgba(124,77,255,0.04)",
            border: "1px solid rgba(124,77,255,0.35)",
            boxShadow: "0 0 30px rgba(124,77,255,0.10)",
          }}
        >
          <p className="font-display font-bold text-lg" style={{ color: "#7c4dff" }}>
            ★ SHADOW GUILD — MAXIMUM RANK ACHIEVED ★
          </p>
          <p className="text-slate-400 text-sm mt-1">Your guild stands at the pinnacle of all hunters.</p>
        </div>
      )}

      {/* ── Members Table ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(79,195,247,0.3), transparent)" }} />
          <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4fc3f7" }}>
            Members — {guild.members.length}
          </h3>
          <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, rgba(79,195,247,0.3), transparent)" }} />
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {sortedMembers.map((m, i) => {
            const hunterRankStyle = HUNTER_RANK_STYLES[m.user.rank];
            const isYou = m.user.id === currentUserId;
            return (
              <div
                key={m.user.id}
                className="flex items-center gap-4 px-5 py-3"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.2)",
                  borderBottom: i < sortedMembers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  borderLeft: `3px solid ${hunterRankStyle.border}50`,
                }}
              >
                {/* Rank number */}
                <span
                  className="text-xs font-bold w-6 text-center flex-shrink-0"
                  style={{ color: i === 0 ? "#ffd54f" : "rgba(148,163,184,0.4)" }}
                >
                  {i + 1}
                </span>

                {/* Avatar */}
                {m.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.user.avatarUrl}
                    alt={m.user.username ?? "hunter"}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    style={{ border: `1px solid ${hunterRankStyle.border}50` }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: hunterRankStyle.bg, color: hunterRankStyle.color }}
                  >
                    {(m.user.username ?? "?")[0].toUpperCase()}
                  </div>
                )}

                {/* Name + username */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white truncate">
                      {m.user.name ?? m.user.username}
                    </span>
                    {isYou && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(79,195,247,0.12)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.25)" }}>
                        you
                      </span>
                    )}
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: hunterRankStyle.bg,
                        border: `1px solid ${hunterRankStyle.border}50`,
                        color: hunterRankStyle.color,
                      }}
                    >
                      {m.user.rank}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">@{m.user.username}</span>
                </div>

                {/* Level */}
                <div className="text-center flex-shrink-0 hidden sm:block" style={{ minWidth: 48 }}>
                  <div className="text-sm font-bold text-white">Lv.{m.user.level}</div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm" style={{ color: hunterRankStyle.color }}>
                    {m.user.totalXP.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Leave Guild ── */}
      <div className="flex justify-end pt-2">
        <LeaveGuildButton />
      </div>
    </div>
  );
}

// ── Guild Lobby (user has no guild) ──────────────────────────────────────────

async function GuildLobby({ userId }: { userId: string }) {
  const guilds = await prisma.guild.findMany({
    orderBy: { totalXP: "desc" },
    take: 20,
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Create Guild ── */}
        <div
          className="rounded-xl p-6 flex flex-col gap-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Section header */}
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-1">Create a Guild</h2>
            <p className="text-sm text-slate-400">
              Link your GitHub organization to create a guild. Your org&apos;s members can join to pool XP.
            </p>
          </div>

          <CreateGuildForm />
        </div>

        {/* ── Join a Guild ── */}
        <div
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-1">Join a Guild</h2>
            <p className="text-sm text-slate-400">Browse active guilds and join one to pool XP with other hunters.</p>
          </div>

          {guilds.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center rounded-lg p-8 text-center"
              style={{ border: "1px dashed rgba(79,195,247,0.15)" }}
            >
              <div>
                <p className="text-slate-400 text-sm">No guilds yet.</p>
                <p className="text-slate-600 text-xs mt-1">Be the first to create one!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 380 }}>
              {guilds.map((g, i) => {
                const rs = GUILD_RANK_STYLES[g.rank];
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.15)",
                      border: `1px solid ${rs.border}20`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://github.com/${g.githubOrgLogin}.png`}
                      alt={g.name}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      style={{ border: `1px solid ${rs.border}40` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white truncate">{g.name}</span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: rs.bg, border: `1px solid ${rs.border}50`, color: rs.color }}
                        >
                          {g.rank}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">@{g.githubOrgLogin}</span>
                        <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                        <span className="text-xs text-slate-500">{g._count.members} member{g._count.members !== 1 ? "s" : ""}</span>
                        <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                        <span className="text-xs font-semibold" style={{ color: rs.color }}>{g.totalXP.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <JoinGuildButton guildId={g.id} />
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

// ── Constants ─────────────────────────────────────────────────────────────────

const GUILD_RANK_XP: Record<GuildRank, number> = {
  BRONZE: 0,
  SILVER: 50_000,
  GOLD: 200_000,
  SHADOW: 500_000,
};

const GUILD_RANK_STYLES: Record<GuildRank, { bg: string; border: string; color: string }> = {
  BRONZE: { bg: "rgba(205,127,50,0.12)", border: "#cd7f32", color: "#cd7f32" },
  SILVER: { bg: "rgba(192,192,192,0.10)", border: "#c0c0c0", color: "#c0c0c0" },
  GOLD:   { bg: "rgba(255,213,79,0.10)",  border: "#ffd54f", color: "#ffd54f" },
  SHADOW: { bg: "rgba(124,77,255,0.12)",  border: "#7c4dff", color: "#7c4dff" },
};

const HUNTER_RANK_STYLES: Record<Rank, { bg: string; border: string; color: string }> = {
  E:        { bg: "rgba(30,41,59,0.6)",  border: "#94a3b8", color: "#94a3b8" },
  D:        { bg: "rgba(5,46,22,0.6)",   border: "#4ade80", color: "#4ade80" },
  C:        { bg: "rgba(12,26,46,0.6)",  border: "#4fc3f7", color: "#4fc3f7" },
  B:        { bg: "rgba(26,9,56,0.6)",   border: "#7c4dff", color: "#7c4dff" },
  A:        { bg: "rgba(31,21,0,0.6)",   border: "#ffd54f", color: "#ffd54f" },
  S:        { bg: "rgba(31,0,0,0.6)",    border: "#ef4444", color: "#ef4444" },
  NATIONAL: { bg: "rgba(26,10,0,0.6)",   border: "#ff9800", color: "#ff9800" },
};

function guildXPToNextRank(totalXP: number): { rank: GuildRank; needed: number; progress: number } | null {
  const tiers: GuildRank[] = ["BRONZE", "SILVER", "GOLD", "SHADOW"];
  const thresholds = GUILD_RANK_XP;

  let currentTier: GuildRank = "BRONZE";
  for (const tier of tiers) {
    if (totalXP >= thresholds[tier]) currentTier = tier;
  }

  const currentIdx = tiers.indexOf(currentTier);
  if (currentIdx === tiers.length - 1) return null;

  const nextTier = tiers[currentIdx + 1];
  const nextThreshold = thresholds[nextTier];
  const currentThreshold = thresholds[currentTier];
  const needed = nextThreshold - totalXP;
  const progress = ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return { rank: nextTier, needed, progress: Math.min(Math.max(progress, 0), 100) };
}
