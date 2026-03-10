export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── Commits ──────────────────────────────────────────────────────────────
  {
    key: "first_commit",
    name: "First Blood",
    description: "Made your first commit",
    icon: "⚔️",
    rarity: "common",
  },
  {
    key: "commits_10",
    name: "Apprentice Coder",
    description: "10 commits tracked",
    icon: "💻",
    rarity: "common",
  },
  {
    key: "commits_50",
    name: "Battle-Hardened",
    description: "50 commits tracked",
    icon: "🔥",
    rarity: "rare",
  },
  {
    key: "commits_100",
    name: "Code Warrior",
    description: "100 commits tracked",
    icon: "⚡",
    rarity: "epic",
  },
  {
    key: "commits_500",
    name: "Legendary Committer",
    description: "500 commits tracked",
    icon: "👑",
    rarity: "legendary",
  },

  // ── Pull Requests ─────────────────────────────────────────────────────────
  {
    key: "first_pr",
    name: "Pull Requester",
    description: "Opened your first PR",
    icon: "🔀",
    rarity: "common",
  },
  {
    key: "prs_10",
    name: "Merge Master",
    description: "10 pull requests",
    icon: "🔀",
    rarity: "rare",
  },

  // ── Issues ────────────────────────────────────────────────────────────────
  {
    key: "first_issue",
    name: "Bug Hunter",
    description: "Filed your first issue",
    icon: "🐛",
    rarity: "common",
  },

  // ── Streaks ───────────────────────────────────────────────────────────────
  {
    key: "streak_3",
    name: "On a Roll",
    description: "3-day active streak",
    icon: "🌟",
    rarity: "common",
  },
  {
    key: "streak_7",
    name: "Weekly Warrior",
    description: "7-day active streak",
    icon: "🔥",
    rarity: "rare",
  },
  {
    key: "streak_30",
    name: "Unstoppable",
    description: "30-day active streak",
    icon: "⚡",
    rarity: "epic",
  },

  // ── Ranks ─────────────────────────────────────────────────────────────────
  {
    key: "rank_d",
    name: "Rising Hunter",
    description: "Reached Rank D",
    icon: "🏅",
    rarity: "common",
  },
  {
    key: "rank_c",
    name: "Skilled Hunter",
    description: "Reached Rank C",
    icon: "🏅",
    rarity: "rare",
  },
  {
    key: "rank_b",
    name: "Advanced Hunter",
    description: "Reached Rank B",
    icon: "🏅",
    rarity: "epic",
  },
  {
    key: "rank_a",
    name: "Elite Programmer",
    description: "Reached Rank A",
    icon: "🏆",
    rarity: "legendary",
  },
  {
    key: "rank_s",
    name: "Shadow Monarch",
    description: "Reached Rank S",
    icon: "👑",
    rarity: "legendary",
  },

  // ── XP milestones ─────────────────────────────────────────────────────────
  {
    key: "xp_1000",
    name: "Power Rising",
    description: "1,000 total XP",
    icon: "⭐",
    rarity: "common",
  },
  {
    key: "xp_10000",
    name: "High-Level Hunter",
    description: "10,000 total XP",
    icon: "⭐",
    rarity: "rare",
  },
  {
    key: "xp_50000",
    name: "Apex Hunter",
    description: "50,000 total XP",
    icon: "⭐",
    rarity: "legendary",
  },

  // ── Social ────────────────────────────────────────────────────────────────
  {
    key: "first_star",
    name: "Star Collector",
    description: "Earned your first repo star",
    icon: "⭐",
    rarity: "common",
  },
  {
    key: "first_fork",
    name: "Forked",
    description: "Someone forked your repo",
    icon: "🍴",
    rarity: "common",
  },
  {
    key: "follower_10",
    name: "Rising Fame",
    description: "10 followers gained",
    icon: "👥",
    rarity: "rare",
  },
];

/** O(1) lookup by key */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENT_DEFS.map((a) => [a.key, a])
);

/** Returns the display name and icon for a given achievement key, or null if not found. */
export function getAchievementInfo(key: string): { name: string; icon: string } | null {
  const def = ACHIEVEMENT_MAP[key];
  if (!def) return null;
  return { name: def.name, icon: def.icon };
}
