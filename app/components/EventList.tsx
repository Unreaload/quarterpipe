'use client';

import { useState } from 'react';
import type { TeamUpEvent } from '../lib/teamup';

export function EventList({ events, today }: { events: TeamUpEvent[]; today: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      {events.map((event: TeamUpEvent) => {
        const isPast = event.date < today;
        const isExpanded = expandedId === event.id;

        return (
          <div
            key={event.id}
            className={`group w-full border-t-4 border-black pt-8 pb-10 md:pt-10 md:pb-14 transition-all duration-500 ${isPast ? 'opacity-20 grayscale' : 'opacity-100'}`}
          >
            <h3
              className="text-xl sm:text-xl md:text-2xl lg:text-[2.5rem] font-black leading-[0.88] tracking-tighter hover:opacity-40 transition-opacity break-words hyphens-auto w-full mb-3 md:mb-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
            >
              {event.title}
            </h3>
            <div className="flex flex-wrap justify-end items-center gap-2 md:gap-3">
              <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">
                {event.date.split('-').reverse().slice(0, 2).join('.')}
              </span>
              <span className="font-mono text-sm md:text-base opacity-30">—</span>
              <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">
                {event.time} Uhr
              </span>
              {event.sub && <>
                <span className="font-mono text-sm md:text-base opacity-30">—</span>
                <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">{event.sub}</span>
              </>}
              {event.date === today && (
                <span className="bg-black text-white text-[8px] md:text-xs px-2 md:px-3 py-1 font-mono animate-pulse uppercase shrink-0 ml-1">Heute</span>
              )}
            </div>

            {isExpanded && event.description && (
              <div className="mt-6 font-mono text-sm md:text-base leading-relaxed opacity-70 whitespace-pre-line text-right">
                {event.description}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
