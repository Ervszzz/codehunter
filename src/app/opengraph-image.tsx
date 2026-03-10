import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,195,247,0.12) 0%, rgba(124,77,255,0.06) 50%, transparent 70%)',
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #4fc3f7, #7c4dff, transparent)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative' }}>
          <div style={{ color: '#4fc3f7', fontSize: 20, letterSpacing: '0.6em', textTransform: 'uppercase', fontWeight: 600 }}>
            ◆ Level Up Your GitHub ◆
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <span style={{ color: '#4fc3f7', fontSize: 96, fontWeight: 900, letterSpacing: '-0.02em' }}>CODE</span>
            <span style={{ color: 'white', fontSize: 96, fontWeight: 900, letterSpacing: '-0.02em' }}>HUNTER</span>
          </div>
          <div style={{ color: '#475569', fontSize: 28, textAlign: 'center', maxWidth: 700 }}>
            Turn your GitHub commits into XP. Rise through the ranks. Become a legend.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
