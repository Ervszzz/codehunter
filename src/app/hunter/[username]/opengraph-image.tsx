import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true, totalXP: true, rank: true, level: true, avatarUrl: true, prestigeTier: true },
  }).catch(() => null);

  const rankColors: Record<string, string> = {
    E: '#94a3b8', D: '#4ade80', C: '#4fc3f7', B: '#7c4dff',
    A: '#ffd54f', S: '#ef4444', NATIONAL: '#ff9800',
  };
  const rankColor = rankColors[user?.rank ?? 'E'] ?? '#94a3b8';
  const isOwner = user?.username === 'Ervszzz';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: '#050810',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${isOwner ? 'rgba(255,68,68,0.15)' : 'rgba(79,195,247,0.1)'} 0%, transparent 70%)`,
        }} />

        {/* Rank color bar at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, transparent, ${isOwner ? '#ff4444' : rankColor}, transparent)`,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>
          {user?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              width={120} height={120}
              style={{ borderRadius: '50%', border: `3px solid ${isOwner ? '#ff4444' : rankColor}` }}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ color: isOwner ? '#ff6666' : 'white', fontSize: 56, fontWeight: 900 }}>
              {user?.name ?? user?.username ?? 'Unknown Hunter'}
            </div>
            {isOwner && (
              <div style={{ color: '#ff4444', fontSize: 24, fontWeight: 700 }}>
                ⚔ The Architect
              </div>
            )}
            <div style={{ color: '#64748b', fontSize: 24 }}>@{user?.username}</div>
          </div>

          <div style={{ display: 'flex', gap: 48, marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ color: isOwner ? '#ff4444' : rankColor, fontSize: 40, fontWeight: 900 }}>
                {user?.totalXP.toLocaleString() ?? '0'}
              </div>
              <div style={{ color: '#475569', fontSize: 18 }}>TOTAL XP</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ color: 'white', fontSize: 40, fontWeight: 900 }}>Lv.{user?.level ?? 1}</div>
              <div style={{ color: '#475569', fontSize: 18 }}>LEVEL</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ color: isOwner ? '#ff4444' : rankColor, fontSize: 40, fontWeight: 900 }}>
                {user?.rank ?? 'E'}
              </div>
              <div style={{ color: '#475569', fontSize: 18 }}>RANK</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 24,
          color: '#1e293b', fontSize: 18, letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          CODEHUNTER
        </div>
      </div>
    ),
    { ...size }
  );
}
