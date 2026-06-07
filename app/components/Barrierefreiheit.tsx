'use client';

import { useState } from 'react';

export function Barrierefreiheit() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-black text-white p-6 md:p-8 border-4 border-dashed border-white/30" style={{ transform: 'rotate(0.6deg)' }}>
      <h4 className="font-black italic text-xl md:text-3xl mb-4 tracking-tighter">
        Hinweis zur Barrierefreiheit
      </h4>
      <p className="font-mono text-xs md:text-sm tracking-widest leading-relaxed opacity-80">
        Wir wünschen uns, dass alle Menschen an unseren Veranstaltungen teilhaben können. Leider sind unsere Räumlichkeiten derzeit (noch) nicht barrierearm und daher für manche Personen – zum Beispiel Menschen, die einen Rollstuhl oder andere Mobilitätshilfen nutzen – nur eingeschränkt zugänglich. Wenn du Fragen zur Zugänglichkeit hast, melde dich gerne vorab bei uns unter <a href="mailto:moin@wirsindamigo.de" className="underline hover:opacity-60 transition-opacity">moin@wirsindamigo.de</a>. Wir bemühen uns, gemeinsam mit dir eine passende Lösung zu finden.
      </p>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 font-mono text-xs md:text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
        aria-expanded={open}
      >
        <span className={`inline-block transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>&#9654;</span>
        Weitere Infos
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="font-mono text-xs md:text-sm tracking-widest leading-relaxed opacity-80 space-y-4">
            <div>
              <p className="font-bold opacity-100 mb-1">Zugang</p>
              <p>Der obere Bereich des Quarterpipe ist über den Eingang erreichbar. An den Eingangstüren befinden sich Schwellen von ca. 4&nbsp;cm bis 5,5&nbsp;cm Höhe. Der untere Bereich ist derzeit nur über eine Treppe zugänglich.</p>
            </div>

            <div>
              <p className="font-bold opacity-100 mb-1">Toilette</p>
              <p>Die Toilette ist nicht vollständig barrierefrei. Stützklappgriffe am WC sind nicht vorhanden. Links neben dem WC stehen ca. 50&nbsp;cm, rechts ca. 60&nbsp;cm Platz zur Verfügung. Die Bewegungsfläche beträgt ca. 150&nbsp;×&nbsp;120&nbsp;cm.</p>
            </div>

            <div>
              <p className="font-bold opacity-100 mb-1">Leitsystem</p>
              <p>Ein taktiles Leitsystem ist derzeit nicht vorhanden.</p>
            </div>

            <div>
              <p className="font-bold opacity-100 mb-1">Anfahrt</p>
              <p>Die nächstgelegenen barrierefrei erreichbaren Bahnstationen sind HafenCity Universität und Elbbrücken. Beide Stationen verfügen über Aufzüge.</p>
            </div>

            <div className="border-t border-white/20 pt-4">
              <p>Wir arbeiten aktiv daran, die Barrierefreiheit unserer Räume zu verbessern. Es ist uns wichtig, dass möglichst viele Menschen an unseren Angeboten teilhaben können. Wenn ihr Fragen oder Wünsche habt, meldet euch gerne. Wir sind bemüht, eine Lösung zu finden.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
