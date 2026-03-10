"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  opacityDelta: number;
  color: string;
}

const COLORS = [
  "rgba(79,195,247,",   // gate blue
  "rgba(124,77,255,",   // magic purple
  "rgba(79,195,247,",   // more blue (weighted)
  "rgba(56,189,248,",   // light blue
];

export default function Particles({ count = 60 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(): Particle {
      return {
        x: Math.random() * (canvas?.width ?? window.innerWidth),
        y: (canvas?.height ?? window.innerHeight) + 10,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: 0,
        opacityDelta: Math.random() * 0.008 + 0.003,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    for (let i = 0; i < count; i++) {
      const p = spawn();
      p.y = Math.random() * (canvas.height ?? window.innerHeight);
      p.opacity = Math.random() * 0.5;
      particles.push(p);
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += p.opacityDelta;

        if (p.opacity >= 0.7) p.opacityDelta = -Math.abs(p.opacityDelta);
        if (p.opacity <= 0 || p.y < -10) {
          Object.assign(p, spawn());
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity.toFixed(2)})`;
        ctx.fill();

        // Soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `${p.color}${(p.opacity * 0.3).toFixed(2)})`);
        grad.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}
