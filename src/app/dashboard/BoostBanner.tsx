import { prisma } from "@/lib/prisma";

function timeLeft(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default async function BoostBanner() {
  const boost = await prisma.xPBoost.findFirst({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { multiplier: "desc" },
  });

  if (!boost) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl px-5 py-3 flex items-center justify-between gap-4"
      style={{
        background: "rgba(255,213,79,0.06)",
        border: "1px solid rgba(255,213,79,0.35)",
        boxShadow: "0 0 30px rgba(255,213,79,0.10)",
      }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,213,79,0.06) 50%, transparent 100%)",
          backgroundSize: "200% auto",
          animation: "xp-shimmer 3s linear infinite",
        }}
      />
      <div className="flex items-center gap-3 relative">
        <span className="text-xl animate-glow-pulse">⚡</span>
        <div>
          <p className="font-display font-bold text-sm tracking-wider" style={{ color: "#ffd54f" }}>
            {boost.multiplier}× XP BOOST ACTIVE — {boost.label}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            All XP gains multiplied · expires in <span className="text-slate-400 font-semibold">{timeLeft(boost.expiresAt)}</span>
          </p>
        </div>
      </div>
      <span
        className="flex-shrink-0 font-display font-black text-2xl"
        style={{ color: "#ffd54f", textShadow: "0 0 20px rgba(255,213,79,0.6)" }}
      >
        ×{boost.multiplier}
      </span>
    </div>
  );
}
