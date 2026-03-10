"use server";

import { prisma } from "@/lib/prisma";
import { getPublicEvents, getUserProfile, getUserRepos } from "@/lib/github";
import { XP_VALUES, XPEventType, calcLevel, calcRank, getPrestigeMultiplier, getPrestigeTitle } from "@/lib/xp";
import { auth } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/checkAchievements";

interface SyncResult {
  success: boolean;
  xpGained: number;
  newLevel: number;
  newRank: string;
  levelUp: boolean;
  rankUp: boolean;
  newAchievements: string[]; // achievement keys
  lastSyncedAt: string;
  error?: string;
}

export async function syncUserXP(userId?: string): Promise<SyncResult> {
  const session = await auth();
  const targetId = userId ?? session?.user?.id;

  if (!targetId) return { success: false, xpGained: 0, newLevel: 1, newRank: "E", levelUp: false, rankUp: false, newAchievements: [], lastSyncedAt: new Date().toISOString(), error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user?.username) return { success: false, xpGained: 0, newLevel: 1, newRank: "E", levelUp: false, rankUp: false, newAchievements: [], lastSyncedAt: new Date().toISOString(), error: "User not found" };

  const oldLevel = user.level;
  const oldRank = user.rank;

  // Fetch GitHub access token
  const account = await prisma.account.findFirst({
    where: { userId: targetId, provider: "github" },
  });
  const token = account?.access_token ?? undefined;

  try {
    const [events, profile, repos] = await Promise.all([
      getPublicEvents(user.username, token),
      getUserProfile(user.username, token),
      getUserRepos(user.username, token),
    ]);

    const prestigeMultiplier = getPrestigeMultiplier(user.prestigeTier);

    // Check for active boost event (stacks multiplicatively with prestige)
    const activeBoost = await prisma.xPBoost.findFirst({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { multiplier: "desc" },
    });
    const multiplier = prestigeMultiplier * (activeBoost?.multiplier ?? 1.0);

    // Get already-processed event IDs to avoid double-counting
    const existingEventIds = await prisma.xPEvent.findMany({
      where: { userId: targetId, githubEventId: { not: null } },
      select: { githubEventId: true },
    });
    const processedIds = new Set(existingEventIds.map((e) => e.githubEventId!));

    // Track active days
    const activeDays = new Set<string>();
    const newEvents: {
      userId: string;
      eventType: XPEventType;
      xpAwarded: number;
      repoName: string | null;
      occurredAt: Date;
      githubEventId: string;
    }[] = [];
    let xpGained = 0;

    for (const event of events) {
      if (processedIds.has(event.id)) continue;

      const day = event.created_at.slice(0, 10);
      let eventType: XPEventType | null = null;

      switch (event.type) {
        case "PushEvent":
          eventType = XPEventType.COMMIT;
          activeDays.add(day);
          break;
        case "PullRequestEvent":
          if ((event.payload as { action?: string }).action === "opened") {
            eventType = XPEventType.PULL_REQUEST;
          }
          break;
        case "IssuesEvent":
          if (["opened", "closed"].includes((event.payload as { action?: string }).action ?? "")) {
            eventType = XPEventType.ISSUE;
          }
          break;
        case "CreateEvent":
          if ((event.payload as { ref_type?: string }).ref_type === "repository") {
            eventType = XPEventType.REPO_CREATED;
          }
          break;
      }

      if (eventType) {
        const base = XP_VALUES[eventType];
        const xp = Math.round(base * multiplier);
        xpGained += xp;
        newEvents.push({
          userId: targetId,
          eventType,
          xpAwarded: xp,
          repoName: event.repo.name,
          occurredAt: new Date(event.created_at),
          githubEventId: event.id,
        });
        processedIds.add(event.id);
      }
    }

    // Add active day XP for each unique coding day
    for (const day of activeDays) {
      const base = XP_VALUES[XPEventType.ACTIVE_DAY];
      const xp = Math.round(base * multiplier);
      xpGained += xp;
      newEvents.push({
        userId: targetId,
        eventType: XPEventType.ACTIVE_DAY,
        xpAwarded: xp,
        repoName: null,
        occurredAt: new Date(day),
        githubEventId: `active_day_${targetId}_${day}`,
      });
    }

    // Calculate star/fork XP from repos (diff against stored)
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    // Update followers diff (simplified: recalc on each sync)
    // For a real app you'd store previous counts; here we grant XP for net changes

    if (newEvents.length > 0) {
      await prisma.xPEvent.createMany({ data: newEvents, skipDuplicates: true });
    }

    const newTotalXP = user.totalXP + xpGained;
    const newLevel = calcLevel(newTotalXP);
    const newRank = calcRank(newTotalXP);

    await prisma.user.update({
      where: { id: targetId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        rank: newRank,
        lastSyncedAt: new Date(),
        // Update profile info from GitHub
        name: profile.name ?? user.name,
        avatarUrl: profile.avatar_url,
      },
    });

    // Check and award any newly unlocked achievements
    const newAchievements = await checkAndAwardAchievements(targetId);

    const levelUp = newLevel > oldLevel;
    const rankUp = newRank !== oldRank;

    return { success: true, xpGained, newLevel, newRank, levelUp, rankUp, newAchievements, lastSyncedAt: new Date().toISOString() };
  } catch (err) {
    console.error("XP sync error:", err);
    return { success: false, xpGained: 0, newLevel: user.level, newRank: user.rank, levelUp: false, rankUp: false, newAchievements: [], lastSyncedAt: new Date().toISOString(), error: String(err) };
  }
}

// Called by Vercel Cron — syncs all users active in last 7 days
export async function syncAllActiveUsers(): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers = await prisma.user.findMany({
    where: {
      OR: [
        { lastSyncedAt: { lt: new Date(Date.now() - 6 * 60 * 60 * 1000) } }, // not synced in 6h
        { lastSyncedAt: null },
      ],
      createdAt: { gt: sevenDaysAgo },
    },
    select: { id: true },
    take: 100,
  });

  await Promise.allSettled(activeUsers.map((u) => syncUserXP(u.id)));
}
