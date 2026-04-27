import React, { useEffect, useRef } from 'react';

export default function AnimatedBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    let time = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const COLORS = ['124,106,247', '34,211,238', '167,139,250', '244,114,182', '74,222,128'];
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Enhanced Orbs with pulsing
    const orbs = [
      { x: W * 0.15, y: H * 0.2, r: 400, color: '124,106,247', alpha: 0.09, vx: 0.2, vy: 0.1, pulse: 0 },
      { x: W * 0.8,  y: H * 0.7, r: 320, color: '34,211,238',  alpha: 0.07, vx: -0.15, vy: 0.15, pulse: Math.PI },
      { x: W * 0.5,  y: H * 0.5, r: 250, color: '167,139,250', alpha: 0.06, vx: 0.1, vy: -0.12, pulse: Math.PI / 2 },
      { x: W * 0.3,  y: H * 0.8, r: 280, color: '244,114,182', alpha: 0.05, vx: 0.12, vy: -0.08, pulse: Math.PI * 1.5 },
    ];

    // Mouse
    let mx = W / 2, my = H / 2;
    let targetMx = mx, targetMy = my;
    const onMouse = (e) => { targetMx = e.clientX; targetMy = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    // Waves
    const waves = [
      { y: H * 0.3, amplitude: 30, frequency: 0.002, speed: 0.01, color: '124,106,247', alpha: 0.03 },
      { y: H * 0.6, amplitude: 40, frequency: 0.0015, speed: 0.015, color: '34,211,238', alpha: 0.025 },
      { y: H * 0.8, amplitude: 25, frequency: 0.0025, speed: 0.008, color: '167,139,250', alpha: 0.02 },
    ];

    const draw = () => {
      // Fade effect instead of clear for trail
      ctx.fillStyle = 'rgba(3,3,10,0.05)';
      ctx.fillRect(0, 0, W, H);

      time += 0.01;

      // Smooth mouse follow
      mx += (targetMx - mx) * 0.05;
      my += (targetMy - my) * 0.05;

      // Animated waves
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);
        for (let x = 0; x <= W; x += 5) {
          const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(${wave.color},${wave.alpha})`;
        ctx.fill();
      });

      // Pulsing Orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r || o.x > W + o.r) o.vx *= -1;
        if (o.y < -o.r || o.y > H + o.r) o.vy *= -1;
        
        const pulseScale = 1 + Math.sin(time * 2 + o.pulse) * 0.1;
        const currentR = o.r * pulseScale;
        
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, currentR);
        g.addColorStop(0, `rgba(${o.color},${o.alpha * (1 + Math.sin(time * 2 + o.pulse) * 0.3)})`);
        g.addColorStop(0.5, `rgba(${o.color},${o.alpha * 0.5})`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, currentR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enhanced mouse glow with ripple
      const rippleSize = 250 + Math.sin(time * 3) * 30;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, rippleSize);
      mg.addColorStop(0, 'rgba(124,106,247,0.08)');
      mg.addColorStop(0.5, 'rgba(34,211,238,0.04)');
      mg.addColorStop(1, 'rgba(124,106,247,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, rippleSize, 0, Math.PI * 2);
      ctx.fill();

      // Particles + connections with pulsing
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Pulse effect
        const pulseAlpha = p.alpha * (1 + Math.sin(time * 3 + p.pulse) * 0.3);
        const pulseR = p.r * (1 + Math.sin(time * 2 + p.pulse) * 0.2);

        // Glow around particle
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * 3);
        pg.addColorStop(0, `rgba(${p.color},${pulseAlpha * 0.3})`);
        pg.addColorStop(1, `rgba(${p.color},0)`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR * 3, 0, Math.PI * 2);
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${pulseAlpha})`;
        ctx.fill();

        // Connect nearby particles with gradient lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            const gradient = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            gradient.addColorStop(0, `rgba(${p.color},${0.1 * (1 - d / 150)})`);
            gradient.addColorStop(1, `rgba(${q.color},${0.1 * (1 - d / 150)})`);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      // Animated grid with perspective
      ctx.strokeStyle = 'rgba(124,106,247,0.03)';
      ctx.lineWidth = 0.5;
      const gs = 80;
      const offset = (time * 20) % gs;
      
      for (let x = -offset; x < W + gs; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + H * 0.1, H);
        ctx.stroke();
      }
      for (let y = -offset; y < H + gs; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y + W * 0.05);
        ctx.stroke();
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
