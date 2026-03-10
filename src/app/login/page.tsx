import { SignInButton } from "./SignInButton";

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#050810" }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(79,195,247,0.07) 0%, rgba(124,77,255,0.05) 40%, transparent 70%)",
        }}
      />

      {/* Spinning rings */}
      <div
        className="absolute rounded-full border border-[#4fc3f7]/10 animate-ring-spin pointer-events-none"
        style={{ width: 640, height: 640 }}
      />
      <div
        className="absolute rounded-full border border-[#7c4dff]/10 animate-ring-spin-reverse pointer-events-none"
        style={{ width: 440, height: 440 }}
      />
      <div
        className="absolute rounded-full border border-[#4fc3f7]/05 animate-ring-spin pointer-events-none"
        style={{ width: 820, height: 820, animationDuration: "24s" }}
      />

      {/* Floating rank letters */}
      {(["E", "D", "C", "B", "A", "S"] as const).map((rank, i) => (
        <span
          key={rank}
          className="absolute text-xs font-display font-bold select-none pointer-events-none animate-float"
          style={{
            color: RANK_FLOAT_COLORS[rank],
            opacity: 0.2,
            top: `${15 + i * 12}%`,
            left: `${8 + i * 14}%`,
            animationDelay: `${i * 0.9}s`,
          }}
        >
          {rank}
        </span>
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        {/* Logo */}
        <div className="mb-2">
          <span
            className="text-xs tracking-[0.5em] text-[#4fc3f7]/60 font-rajdhani font-semibold uppercase"
          >
            system online
          </span>
        </div>

        <h1
          className="font-display font-black tracking-widest text-white mb-1"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            textShadow: "0 0 40px rgba(79,195,247,0.5), 0 0 80px rgba(79,195,247,0.2)",
          }}
        >
          CODE
          <span style={{ color: "#4fc3f7" }}>HUNTER</span>
        </h1>

        <p
          className="text-sm tracking-[0.3em] mb-3 font-semibold uppercase"
          style={{ color: "#7c4dff" }}
        >
          Solo Leveling for Developers
        </p>

        <p className="text-slate-400 text-sm mb-10 max-w-xs leading-relaxed">
          Your GitHub activity becomes XP. Level up. Earn your rank.
          <br />
          <span className="text-slate-500 text-xs italic">
            &quot;We count your battles, not your secrets.&quot;
          </span>
        </p>

        {/* XP preview chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {XP_PREVIEW.map(({ label, xp, color }) => (
            <span
              key={label}
              className="text-xs px-3 py-1 rounded-full border font-semibold"
              style={{ borderColor: `${color}40`, color, background: `${color}10` }}
            >
              {label} +{xp}XP
            </span>
          ))}
        </div>

        {/* Sign in button */}
        <SignInButton />

        {/* Privacy note */}
        <p className="mt-6 text-xs text-slate-600 max-w-xs">
          Only public GitHub data is read.{" "}
          <span className="text-slate-500">read:user · read:org</span>
        </p>
      </div>
    </main>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

const RANK_FLOAT_COLORS: Record<string, string> = {
  E: "#94a3b8",
  D: "#4ade80",
  C: "#4fc3f7",
  B: "#7c4dff",
  A: "#ffd54f",
  S: "#ef4444",
};

const XP_PREVIEW = [
  { label: "Commit", xp: 15, color: "#4fc3f7" },
  { label: "PR", xp: 80, color: "#7c4dff" },
  { label: "Issue", xp: 30, color: "#4ade80" },
  { label: "Active Day", xp: 25, color: "#ffd54f" },
];

