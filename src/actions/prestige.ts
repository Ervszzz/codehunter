"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeMultiplier, getPrestigeTitle, PRESTIGE_TITLES } from "@/lib/xp";
import { Rank } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface PrestigeResult {
  success: boolean;
  error?: string;
  newTier?: number;
  newTitle?: string;
  newMultiplier?: number;
}

export async function enterTheVoid(): Promise<PrestigeResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "User not found" };

  if (user.rank !== Rank.NATIONAL) {
    return { success: false, error: "You must reach National Level to prestige" };
  }

  const newTier = user.prestigeTier + 1;
  const newMultiplier = getPrestigeMultiplier(newTier);
  const newTitle = getPrestigeTitle(newTier) ?? PRESTIGE_TITLES[PRESTIGE_TITLES.length - 1];

  await prisma.user.update({
    where: { id: user.id },
    data: {
      prestigeTier: newTier,
      prestigeTitle: newTitle,
      xpMultiplier: newMultiplier,
      totalXP: 0,
      level: 1,
      rank: Rank.E,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/prestige");

  return { success: true, newTier, newTitle, newMultiplier };
}
