import { NextResponse } from "next/server";
import { syncAllActiveUsers } from "@/actions/syncXP";

// Vercel Cron: runs every 6 hours
// vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "0 */6 * * *" }] }
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await syncAllActiveUsers();
  return NextResponse.json({ ok: true });
}
