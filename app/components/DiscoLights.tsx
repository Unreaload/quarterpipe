'use client';

import { useEffect, useRef } from 'react';

interface Light {
  angle: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

const LIGHT_COLORS = [
  'rgba(255, 100, 150, OPACITY)',
  'rgba(100, 180, 255, OPACITY)',
  'rgba(255, 220, 100, OPACITY)',
  'rgba(180, 100, 255, OPACITY)',
  'rgba(100, 255, 200, OPACITY)',
  'rgba(255, 150, 80, OPACITY)',
  'rgba(200, 200, 255, OPACITY)',
  'rgba(255, 255, 255, OPACITY)',
];

function createLights(count: number): Light[] {
  const lights: Light[] = [];
  for (let i = 0; i < count; i++) {
    lights.push({
      angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
      radiusX: 0.15 + Math.random() * 0.35,
      radiusY: 0.15 + Math.random() * 0.35,
      speed: 0.3 + Math.random() * 0.7,
      size: 40 + Math.random() * 120,
      color: LIGHT_COLORS[i % LIGHT_COLORS.length],
      opacity: 0.06 + Math.random() * 0.1,
    });
  }
  return lights;
}

export function DiscoLights() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightsRef = useRef<Light[]>(createLights(18));
  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onScroll() {
      scrollRef.current = window.scrollY;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollFactor = scrollRef.current * 0.002;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const light of lightsRef.current) {
        const angle = light.angle + scrollFactor * light.speed;
        const x = cx + Math.cos(angle) * light.radiusX * canvas.width;
        const y = cy + Math.sin(angle * 0.7) * light.radiusY * canvas.height;

        const colorWithOpacity = light.color.replace('OPACITY', String(light.opacity));

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, light.size);
        gradient.addColorStop(0, colorWithOpacity);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, light.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998, mixBlendMode: 'screen' }}
    />
  );
}
