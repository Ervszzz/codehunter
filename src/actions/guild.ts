"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GuildRank } from "@prisma/client";

// ── Guild rank thresholds ────────────────────────────────────────────────────

const GUILD_RANK_THRESHOLDS: Record<GuildRank, number> = {
  BRONZE: 0,
  SILVER: 50_000,
  GOLD: 200_000,
  SHADOW: 500_000,
};

function getGuildRank(totalXP: number): GuildRank {
  const tiers: GuildRank[] = ["SHADOW", "GOLD", "SILVER", "BRONZE"];
  for (const tier of tiers) {
    if (totalXP >= GUILD_RANK_THRESHOLDS[tier]) return tier;
  }
  return "BRONZE";
}

// ── Sync guild XP from member totals ─────────────────────────────────────────

export async function syncGuildXP(guildId: string): Promise<void> {
  const members = await prisma.guildMember.findMany({
    where: { guildId },
    include: { user: { select: { totalXP: true } } },
  });
  const totalXP = members.reduce((sum, m) => sum + m.user.totalXP, 0);
  await prisma.guild.update({
    where: { id: guildId },
    data: { totalXP, rank: getGuildRank(totalXP) },
  });
}

// ── createGuild ───────────────────────────────────────────────────────────────

export async function createGuild(formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const githubOrgLogin = (formData.get("githubOrgLogin") as string | null)?.trim();
  const name = (formData.get("name") as string | null)?.trim();

  if (!githubOrgLogin || !name) {
    return { error: "Both GitHub org login and display name are required." };
  }

  // Check user is not already in a guild
  const existing = await prisma.guildMember.findUnique({ where: { userId } });
  if (existing) {
    return { error: "You are already a member of a guild. Leave it first." };
  }

  // Check org login not already taken
  const orgTaken = await prisma.guild.findUnique({ where: { githubOrgLogin } });
  if (orgTaken) {
    return { error: "A guild with that GitHub org already exists." };
  }

  // Get creator's XP for initial guild total
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalXP: true } });
  const creatorXP = user?.totalXP ?? 0;
  const initialRank = getGuildRank(creatorXP);

  const guild = await prisma.guild.create({
    data: {
      githubOrgLogin,
      name,
      avatarUrl: `https://github.com/${githubOrgLogin}.png`,
      totalXP: creatorXP,
      rank: initialRank,
    },
  });

  await prisma.guildMember.create({
    data: { userId, guildId: guild.id },
  });

  redirect("/guild");
}

// ── joinGuild ─────────────────────────────────────────────────────────────────

export async function joinGuild(guildId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Check user is not already in a guild
  const existing = await prisma.guildMember.findUnique({ where: { userId } });
  if (existing) {
    return { error: "You are already a member of a guild. Leave it first." };
  }

  // Check guild exists
  const guild = await prisma.guild.findUnique({ where: { id: guildId } });
  if (!guild) {
    return { error: "Guild not found." };
  }

  await prisma.guildMember.create({
    data: { userId, guildId },
  });

  await syncGuildXP(guildId);

  redirect("/guild");
}

// ── leaveGuild ────────────────────────────────────────────────────────────────

export async function leaveGuild(): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const membership = await prisma.guildMember.findUnique({ where: { userId } });
  if (!membership) {
    return { error: "You are not in a guild." };
  }

  const guildId = membership.guildId;

  await prisma.guildMember.delete({ where: { userId } });

  // Check if guild is now empty — if so, delete it
  const remainingCount = await prisma.guildMember.count({ where: { guildId } });
  if (remainingCount === 0) {
    await prisma.guild.delete({ where: { id: guildId } });
  } else {
    await syncGuildXP(guildId);
  }

  redirect("/guild");
}
