'use client';

import { useEffect, useRef, useState } from 'react';

export function SkaterDivider({ female = false }: { female?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    let current = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const target = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);

      current += (target - current) * 0.08;
      setProgress(current);
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Skater position: rolls across the full width
  const xPercent = 5 + progress * 90; // 5% to 95%
  const wheelAngle = progress * 720;
  const bob = Math.sin(progress * Math.PI * 6) * 2;
  const kneePhase = Math.sin(progress * Math.PI * 6) * 3;

  return (
    <div ref={ref} className="py-[15rem] relative">
      <hr className="border-t-4 border-black w-[90%] mx-auto" />
      {/* Skater rides on top of the line */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${xPercent}%`,
          top: '50%',
          transform: `translateX(-50%) translateY(calc(-100% + ${bob}px))`,
          width: '80px',
          height: '120px',
          opacity: Math.min(progress * 5, 1, (1 - progress) * 5),
        }}
      >
        <svg viewBox="-25 -40 50 60" className="w-full h-full overflow-visible">
          {/* Skateboard deck */}
          <path d="M-14,12 Q-17,10 -14,8 L14,8 Q17,10 14,12 Z" fill="black" />
          {/* Grip tape lines */}
          <line x1="-9" y1="10" x2="-6" y2="10" stroke="white" strokeWidth="0.5" />
          <line x1="-3" y1="10" x2="0" y2="10" stroke="white" strokeWidth="0.5" />
          <line x1="3" y1="10" x2="6" y2="10" stroke="white" strokeWidth="0.5" />

          {/* Trucks */}
          <rect x="-11" y="12" width="6" height="2" rx="0.5" fill="black" opacity="0.5" />
          <rect x="5" y="12" width="6" height="2" rx="0.5" fill="black" opacity="0.5" />

          {/* Wheels */}
          <circle cx="-9" cy="16" r="3" fill="none" stroke="black" strokeWidth="1.5" />
          <circle cx="-9" cy="16" r="1" fill="black" />
          <line x1="-9" y1="13.5" x2="-9" y2="18.5" stroke="black" strokeWidth="0.6" transform={`rotate(${wheelAngle}, -9, 16)`} />
          <line x1="-11.5" y1="16" x2="-6.5" y2="16" stroke="black" strokeWidth="0.6" transform={`rotate(${wheelAngle}, -9, 16)`} />

          <circle cx="9" cy="16" r="3" fill="none" stroke="black" strokeWidth="1.5" />
          <circle cx="9" cy="16" r="1" fill="black" />
          <line x1="9" y1="13.5" x2="9" y2="18.5" stroke="black" strokeWidth="0.6" transform={`rotate(${wheelAngle}, 9, 16)`} />
          <line x1="6.5" y1="16" x2="11.5" y2="16" stroke="black" strokeWidth="0.6" transform={`rotate(${wheelAngle}, 9, 16)`} />

          {/* === BODY === */}
          {/* Shoes */}
          <path d="M-7,6 L-3,6 L-2,8 L-8,8 Z" fill="black" />
          <path d="M3,6 L7,6 L8,8 L2,8 Z" fill="black" />

          {/* Legs - shins */}
          <line x1="-5" y1="6" x2={-6 + kneePhase * 0.3} y2="-1" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="5" y1="6" x2={4 - kneePhase * 0.3} y2="-1" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          {/* Legs - thighs */}
          <line x1="-6" y1="-1" x2="-2" y2="-7" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="4" y1="-1" x2="1" y2="-7" stroke="black" strokeWidth="2.2" strokeLinecap="round" />

          {/* Hips */}
          <line x1="-2" y1="-7" x2="1" y2="-7" stroke="black" strokeWidth="2.2" strokeLinecap="round" />

          {/* Torso */}
          <line x1="0" y1="-7" x2="-1" y2="-18" stroke="black" strokeWidth="2.5" strokeLinecap="round" />

          {/* Shoulders */}
          <line x1="-5" y1="-17" x2="3" y2="-17" stroke="black" strokeWidth="2.2" strokeLinecap="round" />

          {/* Back arm: upper + forearm */}
          <line x1="-5" y1="-17" x2="-10" y2="-12" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <line x1="-10" y1="-12" x2="-11" y2="-8" stroke="black" strokeWidth="2" strokeLinecap="round" />

          {/* Front arm: upper + forearm */}
          <line x1="3" y1="-17" x2="8" y2="-13" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="-13" x2="7" y2="-9" stroke="black" strokeWidth="2" strokeLinecap="round" />

          {/* Neck */}
          <line x1="-1" y1="-18" x2="-1" y2="-21" stroke="black" strokeWidth="2" strokeLinecap="round" />

          {/* Head */}
          <circle cx="-1" cy="-26" r="5.5" fill="none" stroke="black" strokeWidth="2" />

          {female ? (
            <>
              {/* Long hair */}
              <path d="M-6.5,-27 Q-8,-24 -9,-18" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M-5.5,-29 Q-9,-26 -10,-20" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M-4,-30 Q-8,-28 -8,-22" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4,-28 Q6,-24 5,-18" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M3,-30 Q7,-26 6,-20" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Cap */}
              <path d="M-7,-28 Q-1,-32 5,-28" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="5" y1="-28" x2="9" y2="-29" stroke="black" strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* Eye */}
          <circle cx="2" cy="-26" r="1" fill="black" />
          {/* Mouth - slight smile */}
          <path d="M0,-23 Q2,-22 3,-23" stroke="black" strokeWidth="0.8" fill="none" />
        </svg>
      </div>
    </div>
  );
}
