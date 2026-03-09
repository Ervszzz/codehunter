import { Rank, XPEventType } from "@prisma/client";

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
  NATIONAL: 100, // TEMP: lowered for testing
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
  return Rank.E;
}

export function getPrestigeMultiplier(prestigeTier: number): number {
  return PRESTIGE_MULTIPLIERS[Math.min(prestigeTier, 3)] ?? 2.0;
}

export function getPrestigeTitle(prestigeTier: number): string | null {
  if (prestigeTier === 0) return null;
  return PRESTIGE_TITLES[prestigeTier - 1] ?? PRESTIGE_TITLES[PRESTIGE_TITLES.length - 1];
}

export function xpToNextRank(totalXP: number): { rank: Rank; needed: number; progress: number } | null {
  const ranks: Rank[] = ["E", "D", "C", "B", "A", "S", "NATIONAL"];
  const currentRank = calcRank(totalXP);
  const currentIdx = ranks.indexOf(currentRank);

  if (currentIdx === ranks.length - 1) return null; // Already at NATIONAL

  const nextRank = ranks[currentIdx + 1];
  const nextThreshold = RANK_THRESHOLDS[nextRank];
  const currentThreshold = RANK_THRESHOLDS[currentRank];
  const needed = nextThreshold - totalXP;
  const progress = ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return { rank: nextRank, needed, progress: Math.min(progress, 100) };
}
