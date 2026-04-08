'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollProgress(Math.min(window.scrollY / 400, 1));
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scale = 1 - scrollProgress * 0.6;
  const burgerOpacity = scrollProgress > 0.7 ? (scrollProgress - 0.7) / 0.3 : 0;

  return (
    <>
      {/* FIXED HEADER — collapses on scroll */}
      <header
        className="fixed top-0 left-0 w-full bg-black text-white z-50 flex items-center justify-center transition-all ease-out overflow-hidden"
        style={{ height: `${100 - scrollProgress * 70}vh` }}
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          className="flex flex-col items-center w-full px-4"
        >
          <p className="text-[10px] md:text-sm font-mono tracking-[0.6em] uppercase opacity-60 mb-4 md:mb-8 text-center">
            Hamburg // Hafencity
          </p>
          <h1 className="text-[12vw] sm:text-[14vw] md:text-[16vw] font-black uppercase tracking-tighter leading-none flyer-text text-center w-full whitespace-nowrap">
            Quarter<span className="opacity-40">pipe</span>
          </h1>
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
              <span className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-none group-hover:opacity-60 transition-opacity">
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
