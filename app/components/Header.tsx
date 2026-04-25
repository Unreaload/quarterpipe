'use client';

import { useEffect, useRef, useState } from 'react';

const navLinks = [
  { href: '#events',    label: 'Events',    num: '01' },
  { href: '#raum',      label: 'Der Raum',  num: '02' },
  { href: '#mieten',    label: 'Mieten',    num: '03' },
  { href: '#proberaum', label: 'Proberaum', num: '04' },
  { href: '#amigo',     label: 'Amigo*',    num: '05' },
  { href: '#anfahrt',   label: 'Anfahrt',   num: '06' },
];

export function Header() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const targetRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const next = current + (target - current) * 0.12;
      if (Math.abs(target - next) < 0.0005) {
        currentRef.current = target;
        setScrollProgress(target);
        rafId = 0;
        return;
      }
      currentRef.current = next;
      setScrollProgress(next);
      rafId = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      targetRef.current = Math.min(window.scrollY / 500, 1);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // smoothstep easing: 3t² − 2t³
  const eased = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
  const scale = 1 - eased * 0.75;
  const burgerOpacity = eased > 0.7 ? (eased - 0.7) / 0.3 : 0;

  return (
    <>
      {/* FIXED HEADER — collapses on scroll */}
      <header
        className="fixed top-0 left-0 w-full bg-black text-white z-50 flex items-center justify-center overflow-hidden will-change-[height]"
        style={{ height: `${100 - eased * 85}vh` }}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          className="flex flex-col items-center w-full px-4"
        >
          <p className="text-[10px] md:text-sm font-mono tracking-[0.6em] uppercase opacity-60 mb-4 md:mb-8 text-center">
            Hamburg // Hafencity
          </p>
          <img
            src="/images/QP_Schriftzug.svg"
            alt="Quarterpipe"
            className="w-[90vw] md:w-[80vw] max-w-[1200px] h-auto"
            style={{ transform: 'rotate(-1.5deg) skewX(-2deg)' }}
          />
        </div>
      </header>

      {/* BURGER BUTTON — fades in as header collapses */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 right-6 md:top-8 md:right-10 z-[60] flex flex-col justify-center items-center gap-[6px] w-10 h-10"
        style={{
          opacity: burgerOpacity,
          transition: 'opacity 0.2s ease',
          pointerEvents: burgerOpacity < 0.1 ? 'none' : 'auto',
        }}
        aria-label="Menü öffnen"
        aria-expanded={menuOpen}
        aria-controls="nav-overlay"
      >
        <span className="block w-7 h-[2px] bg-white" />
        <span className="block w-7 h-[2px] bg-white" />
        <span className="block w-5 h-[2px] bg-white" />
      </button>

      {/* FULL-SCREEN MENU OVERLAY */}
      <div
        id="nav-overlay"
        className="fixed inset-0 bg-black text-white z-[100] flex flex-col transition-opacity duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        aria-hidden={!menuOpen}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Menü schließen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>

        <nav className="flex flex-col justify-center h-full px-10 md:px-20 gap-0">
          {navLinks.map(({ href, label, num }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="group flex items-baseline gap-6 py-4 md:py-5 border-b border-white/10 hover:border-white/40 transition-colors"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] opacity-30 shrink-0">{num}</span>
              <span className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-none group-hover:opacity-60 transition-opacity" style={{ display: 'inline-block', transform: `rotate(${Number(num) % 2 === 0 ? '0.8' : '-0.6'}deg)` }}>
                {label}
              </span>
            </a>
          ))}
        </nav>

        <p className="absolute bottom-8 left-10 md:left-20 font-mono text-[10px] tracking-[0.4em] uppercase opacity-20">
          Hamburg // Hafencity
        </p>
      </div>
    </>
  );
}
