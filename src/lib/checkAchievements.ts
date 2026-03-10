import { prisma } from "@/lib/prisma";
import { calcStreak, XPEventType } from "@/lib/xp";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

/**
 * Checks every achievement definition against the user's current stats and
 * awards any that haven't been unlocked yet.
 *
 * Returns the keys of newly unlocked achievements (empty array if none).
 */
export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  // Fetch user with all XP events and already-unlocked achievements
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      xpEvents: {
        select: { eventType: true, occurredAt: true },
      },
      achievements: {
        select: { achievementKey: true },
      },
    },
  });

  if (!user) return [];

  // Build a set of already-unlocked keys for O(1) lookups
  const unlocked = new Set(user.achievements.map((a) => a.achievementKey));

  // ── Derive stats from xpEvents ─────────────────────────────────────────
  const commits = user.xpEvents.filter((e) => e.eventType === XPEventType.COMMIT).length;
  const prs = user.xpEvents.filter((e) => e.eventType === XPEventType.PULL_REQUEST).length;
  const issues = user.xpEvents.filter((e) => e.eventType === XPEventType.ISSUE).length;
  const stars = user.xpEvents.filter((e) => e.eventType === XPEventType.STAR_EARNED).length;
  const forks = user.xpEvents.filter((e) => e.eventType === XPEventType.FORK_EARNED).length;
  const followers = user.xpEvents.filter((e) => e.eventType === XPEventType.FOLLOWER_GAINED).length;

  const activeDayDates = user.xpEvents
    .filter((e) => e.eventType === XPEventType.ACTIVE_DAY)
    .map((e) => e.occurredAt);

  const currentStreak = calcStreak(activeDayDates);

  const totalXP = user.totalXP;
  const rank = user.rank;

  // ── Achievement conditions ─────────────────────────────────────────────
  const conditions: Record<string, boolean> = {
    first_commit: commits >= 1,
    commits_10: commits >= 10,
    commits_50: commits >= 50,
    commits_100: commits >= 100,
    commits_500: commits >= 500,

    first_pr: prs >= 1,
    prs_10: prs >= 10,

    first_issue: issues >= 1,

    streak_3: currentStreak >= 3,
    streak_7: currentStreak >= 7,
    streak_30: currentStreak >= 30,

    rank_d: ["D", "C", "B", "A", "S", "NATIONAL"].includes(rank),
    rank_c: ["C", "B", "A", "S", "NATIONAL"].includes(rank),
    rank_b: ["B", "A", "S", "NATIONAL"].includes(rank),
    rank_a: ["A", "S", "NATIONAL"].includes(rank),
    rank_s: ["S", "NATIONAL"].includes(rank),

    xp_1000: totalXP >= 1_000,
    xp_10000: totalXP >= 10_000,
    xp_50000: totalXP >= 50_000,

    first_star: stars >= 1,
    first_fork: forks >= 1,
    follower_10: followers >= 10,
  };

  // ── Find achievements to award ─────────────────────────────────────────
  const toAward = ACHIEVEMENT_DEFS.filter(
    (def) => !unlocked.has(def.key) && conditions[def.key] === true
  );

  if (toAward.length === 0) return [];

  // Bulk-insert, skipping any race-condition duplicates
  await prisma.achievement.createMany({
    data: toAward.map((def) => ({
      userId,
      achievementKey: def.key,
    })),
    skipDuplicates: true,
  });

  return toAward.map((def) => def.key);
}
