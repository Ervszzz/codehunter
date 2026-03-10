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
        <a
          href="/api/auth/signin/github"
          className="gate-btn flex items-center gap-3 px-10 py-4 rounded-lg font-display font-bold text-sm tracking-widest text-white uppercase cursor-pointer"
        >
          <GitHubIcon />
          Enter the Gate
        </a>

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

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
