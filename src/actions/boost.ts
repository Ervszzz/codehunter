"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const OWNER_USERNAME = "Ervszzz";

async function assertOwner() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } });
  if (user?.username !== OWNER_USERNAME) throw new Error("Forbidden");
  return session.user.id;
}

export async function createBoost(formData: FormData) {
  await assertOwner();

  const label = String(formData.get("label") || "XP Boost Event");
  const multiplier = parseFloat(String(formData.get("multiplier") || "2"));
  const durationMs = parseInt(String(formData.get("durationMs") || "3600000"), 10);

  if (isNaN(multiplier) || multiplier < 1.1 || multiplier > 10) throw new Error("Invalid multiplier");
  if (isNaN(durationMs) || durationMs < 60_000) throw new Error("Invalid duration");

  // Cancel all existing boosts before creating new one
  await prisma.xPBoost.deleteMany({ where: { expiresAt: { gt: new Date() } } });

  await prisma.xPBoost.create({
    data: {
      label,
      multiplier,
      expiresAt: new Date(Date.now() + durationMs),
    },
  });

  revalidatePath("/dashboard");
}

export async function cancelBoost(id: string) {
  await assertOwner();
  await prisma.xPBoost.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function getActiveBoost() {
  return prisma.xPBoost.findFirst({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { multiplier: "desc" },
  });
}
