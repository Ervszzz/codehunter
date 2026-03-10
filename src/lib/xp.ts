// Define locally to avoid build-time dependency on Prisma-generated client
export type Rank = "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL";

export const XPEventType = {
  COMMIT: "COMMIT",
  PULL_REQUEST: "PULL_REQUEST",
  ISSUE: "ISSUE",
  ACTIVE_DAY: "ACTIVE_DAY",
  STAR_EARNED: "STAR_EARNED",
  REPO_CREATED: "REPO_CREATED",
  FOLLOWER_GAINED: "FOLLOWER_GAINED",
  FORK_EARNED: "FORK_EARNED",
} as const;
export type XPEventType = typeof XPEventType[keyof typeof XPEventType];

// XP values per event type
export const XP_VALUES: Record<XPEventType, number> = {
  COMMIT: 15,
  PULL_REQUEST: 80,
  ISSUE: 30,
  ACTIVE_DAY: 25,
  STAR_EARNED: 10,
  REPO_CREATED: 20,
  FOLLOWER_GAINED: 50,
  FORK_EARNED: 12,
};

// Rank XP thresholds
export const RANK_THRESHOLDS: Record<Rank, number> = {
  E: 0,
  D: 2000,
  C: 8000,
  B: 20000,
  A: 50000,
  S: 120000,
  NATIONAL: 300000,
};

export const RANK_TITLES: Record<Rank, string> = {
  E: "Novice Coder",
  D: "Apprentice Developer",
  C: "Competent Engineer",
  B: "Advanced Hunter",
  A: "Elite Programmer",
  S: "Shadow Monarch Coder",
  NATIONAL: "The One Who Stands Alone",
};

export const PRESTIGE_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.2,
  2: 1.5,
  3: 2.0,
};

export const PRESTIGE_TITLES = [
  "The Architect",
  "Void Walker",
  "One Who Returned",
  "Monarch's Shadow",
  "The Eternal",
];

export function calcLevel(totalXP: number): number {
  return Math.floor(1 + Math.sqrt(totalXP / 80));
}

export function calcRank(totalXP: number): Rank {
  const thresholds = Object.entries(RANK_THRESHOLDS)
    .sort(([, a], [, b]) => b - a) as [Rank, number][];

  for (const [rank, threshold] of thresholds) {
    if (totalXP >= threshold) return rank;
  }
  return "E";
}

export function getPrestigeMultiplier(prestigeTier: number): number {
  return PRESTIGE_MULTIPLIERS[Math.min(prestigeTier, 3)] ?? 2.0;
}

export function getPrestigeTitle(prestigeTier: number): string | null {
  if (prestigeTier === 0) return null;
  return PRESTIGE_TITLES[prestigeTier - 1] ?? PRESTIGE_TITLES[PRESTIGE_TITLES.length - 1];
}

/**
 * Given an array of dates on which the user had an ACTIVE_DAY event,
 * returns the current consecutive-day streak ending today (or yesterday
 * if the user already coded today — streaks count full calendar days).
 *
 * The array does NOT need to be pre-sorted; the function sorts internally.
 */
export function calcStreak(activeDays: Date[]): number {
  if (activeDays.length === 0) return 0;

  // Normalise to UTC date strings "YYYY-MM-DD" and deduplicate
  const daySet = new Set(activeDays.map((d) => d.toISOString().slice(0, 10)));
  const days = Array.from(daySet).sort().reverse(); // most-recent first

  // "Today" in UTC
  const todayStr = new Date().toISOString().slice(0, 10);

  // Streak must start from today or yesterday (we allow today to count)
  if (days[0] !== todayStr) {
    // Check if the most recent day was yesterday
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    if (days[0] !== yesterday) return 0;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns the all-time longest consecutive-day streak from the activity history.
 */
export function calcLongestStreak(activeDays: Date[]): number {
  if (activeDays.length === 0) return 0;

  const daySet = new Set(activeDays.map((d) => d.toISOString().slice(0, 10)));
  const days = Array.from(daySet).sort(); // oldest first

  let longest = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function xpToNextRank(totalXP: number): { rank: Rank; needed: number; progress: number } | null {
  const ranks: Rank[] = ["E", "D", "C", "B", "A", "S", "NATIONAL"];
  const currentRank = calcRank(totalXP);
  const currentIdx = ranks.indexOf(currentRank);

  if (currentIdx === ranks.length - 1) return null;

  const nextRank = ranks[currentIdx + 1];
  const nextThreshold = RANK_THRESHOLDS[nextRank];
  const currentThreshold = RANK_THRESHOLDS[currentRank];
  const needed = nextThreshold - totalXP;
  const progress = ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return { rank: nextRank, needed, progress: Math.min(progress, 100) };
}
