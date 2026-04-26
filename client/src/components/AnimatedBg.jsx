import React, { useEffect, useRef } from 'react';

export default function AnimatedBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const COLORS = ['124,106,247', '34,211,238', '167,139,250', '244,114,182'];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
    }));

    // Orbs
    const orbs = [
      { x: W * 0.15, y: H * 0.2, r: 350, color: '124,106,247', alpha: 0.07, vx: 0.15, vy: 0.08 },
      { x: W * 0.8,  y: H * 0.7, r: 280, color: '34,211,238',  alpha: 0.05, vx: -0.1, vy: 0.12 },
      { x: W * 0.5,  y: H * 0.5, r: 200, color: '167,139,250', alpha: 0.04, vx: 0.08, vy: -0.1 },
    ];

    // Mouse
    let mx = W / 2, my = H / 2;
    const onMouse = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r || o.x > W + o.r) o.vx *= -1;
        if (o.y < -o.r || o.y > H + o.r) o.vy *= -1;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.color},${o.alpha})`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse glow
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
      mg.addColorStop(0, 'rgba(124,106,247,0.04)');
      mg.addColorStop(1, 'rgba(124,106,247,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, 200, 0, Math.PI * 2);
      ctx.fill();

      // Particles + connections
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(124,106,247,${0.06 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Grid
      ctx.strokeStyle = 'rgba(124,106,247,0.025)';
      ctx.lineWidth = 0.5;
      const gs = 70;
      for (let x = 0; x < W; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 1 }}
    />
  );
}
