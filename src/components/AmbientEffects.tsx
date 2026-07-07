import React, { useEffect, useRef } from 'react';

export default function AmbientEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // ----------------------------------------------------
    // 1. AMBIENT BACKGROUND NETWORK (CANVAS) - BRIGHTER & BOLDER
    // ----------------------------------------------------
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Slightly higher density for more beautiful connection patterns (reduced on mobile)
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 15 : 80;
    const particleCount = Math.min(maxParticles, Math.floor((width * height) / (isMobile ? 35000 : 18000)));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.5 + 1.2, // Made dots larger and bolder (1.2px - 3.7px)
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const drawNetwork = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw brighter background grid indicators
      ctx.strokeStyle = 'rgba(164, 147, 247, 0.04)'; // Increased visibility from 0.01 to 0.04
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce with padding to prevent sticking
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Vibrant glowing fill
        ctx.fillStyle = 'rgba(164, 147, 247, 0.55)'; // Increased opacity from 0.18 to 0.55
        ctx.fill();

        // Subtle outer particle glow for the bolder look
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(164, 147, 247, 0.15)';
        ctx.fill();
      });

      // Draw lines between nearby particles (skip on mobile for performance)
      if (!isMobile) {
        ctx.lineWidth = 0.9; // Increased line width from 0.5 to 0.9
        const connectionDistance = 150; // Increased distance from 120 to 150 to form richer lattices

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              // Enhanced line opacity multiplier (from 0.08 to 0.28)
              const alpha = (1 - dist / connectionDistance) * 0.28;
              ctx.strokeStyle = `rgba(164, 147, 247, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      if (!isMobile) {
        animationFrameId = requestAnimationFrame(drawNetwork);
      }
    };

    drawNetwork();

    // ----------------------------------------------------
    // 2. GLOBAL GLOW TRACKING AND PARALLAX TILT EFFECTS
    // ----------------------------------------------------
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const elements = document.querySelectorAll('.tilt-card, .glow-card');
      
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 350) {
          if (el.classList.contains('tilt-card')) {
            (el as HTMLElement).style.setProperty('--rotate-x', '0deg');
            (el as HTMLElement).style.setProperty('--rotate-y', '0deg');
          }
          return;
        }

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        (el as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (el as HTMLElement).style.setProperty('--mouse-y', `${y}px`);

        if (el.classList.contains('tilt-card')) {
          const px = (x / rect.width) - 0.5;
          const py = (y / rect.height) - 0.5;
          
          const rotateY = px * 12;
          const rotateX = -py * 12;
          
          (el as HTMLElement).style.setProperty('--rotate-x', `${rotateX}deg`);
          (el as HTMLElement).style.setProperty('--rotate-y', `${rotateY}deg`);
        }
      });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }} // Increased canvas base opacity for a stronger presentation
    />
  );
}
