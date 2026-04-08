'use client';

import { useEffect, useRef, useState } from 'react';

export function ScrollZoomImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress 0 when entering viewport, 1 when fully visible/past
        const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        setScale(1 + progress * 0.1);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease-out' }}
    />
  );
}
