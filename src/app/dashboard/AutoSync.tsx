"use client";

import { useEffect, useRef } from "react";
import { syncUserXP } from "@/actions/syncXP";
import { useRouter } from "next/navigation";

export default function AutoSync({ lastSyncedAt }: { lastSyncedAt: Date | null }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!lastSyncedAt || lastSyncedAt < oneHourAgo) {
      syncUserXP().then((res) => {
        if (res.success) router.refresh();
      });
    }
  }, [lastSyncedAt, router]);

  return null;
}
