'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const progress = Math.min(position / 400, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scale = 1 - (scrollProgress * 0.6); 
  const today = "2026-03-18";

  const PROGRAM_DATA = [
    { date: "2026-03-16", time: "18:00", title: "Skate Session", sub: "PAST" },
    { date: "2026-03-19", time: "18:00", title: "Französisch Stammtisch", sub: "+ Quarterpipe Bar" },
    { date: "2026-03-21", time: "19:00", title: "Karaoke", sub: "Kein Talent, Kein Problem" },
    { date: "2026-03-22", time: "14:00", title: "6. TTTT", sub: "Turn Table Tennis Turnierchen" },
    { date: "2026-03-26", time: "19:00", title: "Küche für Alle", sub: "+ Quarterpipe Bar" },
    { date: "2026-03-29", time: "11:00", title: "Flohmarkt", sub: "" },
    { date: "2026-03-30", time: "18:00", title: "Skate Session", sub: "" },
  ];

  return (
    <main className="w-full max-w-[100vw] bg-white text-black selection:bg-black selection:text-white overflow-clip font-sans">
      
      {/* 1. HEADER */}
      <header 
        className="fixed top-0 left-0 w-full bg-black text-white z-50 flex flex-col items-center justify-center transition-all ease-out overflow-hidden"
        style={{ height: `${100 - (scrollProgress * 70)}vh` }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} className="flex flex-col items-center w-full px-4">
          <p className="text-[10px] md:text-sm font-mono tracking-[0.6em] uppercase opacity-60 mb-4 md:mb-8 text-center">
            Hamburg // HafenCity // Amigo* Haus
          </p>
          <h1 className="text-[12vw] sm:text-[14vw] md:text-[16vw] font-black uppercase tracking-tighter leading-none flyer-text text-center w-full whitespace-nowrap">
            Quarter<span className="opacity-40">pipe</span>
          </h1>
        </div>
      </header>

      {/* Hero Spacer */}
      <div className="w-full h-[100vh]" />

      {/* 2. LAYOUT: LAYERED BACKGROUND RAMP + FULL WIDTH TEXT */}
      <div className="relative w-full max-w-[1600px] mx-auto bg-white min-h-screen">
        
        {/* LAYER 1: THE BACKGROUND RAMP (z-0) */}
        <aside className="absolute top-0 left-0 w-20 sm:w-32 md:w-64 lg:w-80 h-full z-0 pointer-events-none">
          <div className="sticky top-[35vh] w-full h-[65vh]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-black">
              <path d="M 0,0 L 25,0 L 25,60 Q 25,100 100,100 L 0,100 Z" />
            </svg>
            <div className="absolute top-0 left-0 w-[25%] h-full flex items-center justify-center">
              <span className="[writing-mode:vertical-lr] rotate-180 text-white font-bold tracking-[1em] uppercase opacity-30 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
                MÄRZ PROGRAMM
              </span>
            </div>
          </div>
        </aside>

        {/* LAYER 2: THE EVENTS (z-10) */}
        <section className="relative z-10 w-full flex flex-col items-end pr-4 sm:pr-8 md:pr-16 lg:pr-32 py-16 pointer-events-auto">
          
          {/* HEADER: Scaled down by half (8rem on desktop) but kept the left nudge */}
          <header className="mb-16 md:mb-24 text-right w-full pr-4 md:pr-12 lg:pr-24">
            <h2 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black uppercase italic leading-[0.8] tracking-tighter flyer-text border-b-[8px] md:border-b-[16px] border-black inline-block pb-2 md:pb-4 break-words bg-white/40 backdrop-blur-sm px-2">
              März
            </h2>
          </header>

          <div className="w-full flex flex-col gap-14 md:gap-24 items-end text-right">
            {PROGRAM_DATA.map((event, index) => {
              const isPast = event.date < today;
              return (
                <div 
                  key={index} 
                  className={`group flex flex-col items-end transition-all duration-500 w-full max-w-full lg:max-w-5xl ${isPast ? 'opacity-20 grayscale' : 'opacity-100'}`}
                >
                  <div className="flex flex-wrap justify-end items-center gap-2 md:gap-4 mb-2 md:mb-4 max-w-full">
                    {event.date === today && (
                      <span className="bg-black text-white text-[8px] md:text-xs px-2 py-1 font-mono animate-pulse uppercase shrink-0">Heute</span>
                    )}
                    <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-none bg-white/40 backdrop-blur-[2px]">
                      {event.date.split('-').reverse().slice(0, 2).join('.')}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] hover:bg-black hover:text-white px-2 transition-colors break-words hyphens-auto text-right max-w-full w-full">
                    <span className="bg-white/40 hover:bg-transparent backdrop-blur-[2px] box-decoration-clone leading-[1.1]">
                      {event.title}
                    </span>
                  </h3>
                  
                  <div className="mt-2 md:mt-4 uppercase font-bold tracking-widest text-[10px] md:text-sm opacity-60 break-words max-w-full text-right inline-block bg-white/40 backdrop-blur-[2px] px-1">
                    {event.time} UHR {event.sub && `// ${event.sub}`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 3. FOOTER */}
      <footer className="bg-black text-white p-8 md:p-24 mt-20 md:mt-40 z-40 relative">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-center md:text-left">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 md:mb-4">The Space</h2>
            <p className="opacity-60 uppercase tracking-widest text-[10px] md:text-sm font-mono">
              Versmannstraße 66 // HafenCity
            </p>
          </div>
          <button className="border-4 border-white px-6 md:px-8 py-4 md:py-6 text-lg md:text-2xl font-black uppercase italic hover:bg-white hover:text-black transition-all">
            Anfrage Senden
          </button>
        </div>
      </footer>
    </main>
  );
}