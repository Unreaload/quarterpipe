'use client';

import { useState } from 'react';

export function MapEmbed() {
  const [accepted, setAccepted] = useState(false);

  if (!accepted) {
    return (
      <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-mono text-xs md:text-sm tracking-widest uppercase opacity-60 text-white max-w-md leading-relaxed">
          Zum Anzeigen der Karte wird Google Maps geladen. Dabei werden Daten an Google übertragen.
        </p>
        <button
          onClick={() => setAccepted(true)}
          className="border-2 border-white text-white px-6 py-3 font-black italic text-lg hover:bg-white hover:text-black transition-all"
        >
          Karte laden
        </button>
        <a
          href="https://www.google.com/maps?q=Versmannstraße+66,+20457+Hamburg"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] tracking-widest uppercase opacity-30 text-white hover:opacity-60 transition-opacity underline"
        >
          Oder in Google Maps öffnen
        </a>
      </div>
    );
  }

  return (
    <iframe
      src="https://www.google.com/maps?q=Versmannstraße+66,+20457+Hamburg&output=embed"
      className="absolute inset-0 w-full h-full"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Quarterpipe Hamburg"
    />
  );
}
