'use client';

import { useState } from 'react';
import type { TeamUpEvent } from '../lib/teamup';

export function EventList({ events, today }: { events: TeamUpEvent[]; today: string }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      {events.map((event: TeamUpEvent) => {
        const isPast = event.date < today;
        const isExpanded = expandedIds.has(event.id);

        return (
          <div
            key={event.id}
            className={`group w-full border-t-4 border-black pt-8 pb-10 md:pt-10 md:pb-14 transition-all duration-500 ${isPast ? 'opacity-20 grayscale' : 'opacity-100'}`}
          >
            <div className="flex items-baseline justify-end gap-3 md:gap-4 mb-3 md:mb-4">
              <span className="text-xl md:text-2xl font-black tracking-tighter tabular-nums">
                {event.date.split('-').reverse().slice(0, 2).join('.')}
              </span>
              {event.date === today && (
                <span className="bg-black text-white text-[8px] md:text-xs px-2 md:px-3 py-1 font-mono animate-pulse uppercase shrink-0">Heute</span>
              )}
            </div>
            <h3
              className="text-xl sm:text-xl md:text-2xl lg:text-[2.5rem] font-black leading-[0.88] tracking-tighter hover:opacity-40 transition-opacity break-words hyphens-auto w-full mb-3 md:mb-4 cursor-pointer"
              onClick={() => toggleExpanded(event.id)}
            >
              {event.title}
            </h3>
            <div className="flex flex-col items-end gap-1">
              {event.time && (
                <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">
                  {event.endTime && event.endTime !== event.time
                    ? `${event.time} – ${event.endTime} Uhr`
                    : `${event.time} Uhr`}
                </span>
              )}
              {event.einlass && (
                <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">Einlass {event.einlass} Uhr</span>
              )}
              {event.sub && (
                <span className="font-mono text-sm md:text-base tracking-[0.2em] uppercase opacity-50">{event.sub}</span>
              )}
              {isExpanded && event.description && (
                event.description.split('\n').map((line, i) => (
                  <span key={i} className="font-mono text-sm md:text-base tracking-[0.2em] opacity-80">{line}</span>
                ))
              )}
              {isExpanded && event.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full max-w-md h-auto object-cover mt-3"
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
