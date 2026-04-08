import { Header } from './components/Header';
import { MietenForm } from './components/MietenForm';
import { ProberaumForm } from './components/ProberaumForm';
import { fetchEvents } from './lib/teamup';
import type { TeamUpEvent } from './lib/teamup';

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toLocaleDateString('de-DE', { month: 'long' });

  let events: TeamUpEvent[] = [];
  let eventsError = false;
  try {
    events = await fetchEvents();
  } catch {
    eventsError = true;
  }

  return (
    <main className="w-full max-w-[100vw] bg-white text-black selection:bg-black selection:text-white overflow-clip font-sans">

      <Header />

      {/* Hero Spacer */}
      <div className="w-full h-[100vh]" />

      {/* ── 1. EVENTS ─────────────────────────────────────────────────────── */}
      <div
        id="events"
        className="scroll-mt-[30vh] grid grid-cols-[25%_75%] md:grid-cols-[35%_65%] lg:grid-cols-[40%_60%] w-[95%] max-w-[1600px] mx-auto bg-white relative"
      >
        {/* LEFT COLUMN: ramp graphic */}
        <aside className="w-full h-full relative z-0">
          <div className="sticky top-[35vh] w-full h-[65vh]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-black">
              <path d="M 0,0 L 25,0 L 25,60 Q 25,100 100,100 L 0,100 Z" />
            </svg>
            <div className="absolute top-0 left-0 w-[25%] h-full flex items-center justify-center">
              <span className="[writing-mode:vertical-lr] rotate-180 text-white font-bold tracking-[1em] uppercase opacity-30 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">
                QUARTERPIPE // THE SPACE
              </span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: events list */}
        <div className="flex flex-col min-w-0 w-full pl-4 md:pl-8 lg:pl-12 z-10 pb-32 md:pb-48">
          <section className="w-full flex flex-col items-end pt-20 pointer-events-auto">
            <header className="mb-16 md:mb-24 text-right w-full">
              <h2 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black italic leading-[0.8] tracking-tighter flyer-text border-b-[8px] md:border-b-[16px] border-black inline-block pb-2 md:pb-4 break-words pl-2 pr-4 md:pr-8">
                {currentMonth}
              </h2>
            </header>

            <div className="w-full flex flex-col items-end text-right">
              {events.length === 0 && !eventsError && (
                <p className="font-mono text-sm opacity-40 tracking-widest uppercase py-8">Keine Events gefunden.</p>
              )}
              {eventsError && (
                <p className="font-mono text-sm opacity-40 tracking-widest uppercase py-8">Programm konnte nicht geladen werden.</p>
              )}
              {events.map((event: TeamUpEvent) => {
                const isPast = event.date < today;
                return (
                  <div
                    key={event.id}
                    className={`group w-full border-t-4 border-black pt-8 pb-10 md:pt-10 md:pb-14 transition-all duration-500 ${isPast ? 'opacity-20 grayscale' : 'opacity-100'}`}
                  >
                    <h3 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.88] tracking-tighter hover:opacity-40 transition-opacity break-words hyphens-auto w-full mb-3 md:mb-4">
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
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ── 2. MEHR ALS EIN RAUM ──────────────────────────────────────────── */}
      <section
        id="raum"
        className="scroll-mt-[30vh] split-section flex flex-col"
      >
        {/* Left: text */}
        <div className="flex-1 px-8 md:px-16 py-20 md:py-32 flex flex-col gap-10 md:gap-14">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic leading-[1] tracking-tighter">
            Die Quarterpipe ist mehr als ein Raum – sie ist ein Ort voller Möglichkeiten!
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.2] opacity-90">
            Hier treffen sich Skater*innen, Kreative, Musiker*innen und Nachbar*innen, um gemeinsam aktiv zu werden. Ob für Indoor-Skaten, Konzerte oder Workshops – die Quarterpipe steht für Austausch, Ideen und besondere Momente.
          </p>
          <div className="bg-black text-white p-6 md:p-8">
            <h4 className="font-black italic text-xl md:text-3xl mb-4 tracking-tighter">
              Hinweis zur Barrierefreiheit
            </h4>
            <p className="font-mono text-xs md:text-sm tracking-widest leading-relaxed opacity-80">
              Die Quarterpipe ist aktuell leider (noch) nicht barrierearm. Wenn du Fragen zur Zugänglichkeit hast, melde dich gerne direkt bei uns und wir suchen gemeinsam nach einer Lösung.
            </p>
          </div>
        </div>

        {/* Right: video placeholder */}
        <div className="flex-1 bg-neutral-900 relative flex items-center justify-center min-h-[60vw] overflow-hidden group">
          <div className="absolute z-20 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/50 group-hover:scale-110 group-hover:bg-white transition-all duration-300 cursor-pointer">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-2 group-hover:border-l-black transition-colors"></div>
          </div>
          <span className="relative z-10 font-black italic text-3xl md:text-5xl text-white opacity-20 group-hover:opacity-0 transition-opacity duration-500 text-center px-4 uppercase">
            [Video Drop]
          </span>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* ── 3. MIETEN ─────────────────────────────────────────────────────── */}
      <section
        id="mieten"
        className="scroll-mt-[30vh] split-section bg-white text-black flex flex-col"
      >
        <div className="flex-1 bg-neutral-100 relative flex items-center justify-center min-h-[60vw]">
          <span className="font-black italic text-4xl md:text-6xl opacity-10 uppercase tracking-tighter">[Foto]</span>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b-4 border-black">
            <h2 className="text-4xl md:text-6xl font-black italic leading-none tracking-tighter mb-4">
              Mieten
            </h2>
            <p className="text-base md:text-lg font-bold opacity-60 leading-snug">
              Konzerte, Workshops, Sportkurse, Lesungen, Geburtstage – viel Platz, eine kleine Küche, eine Bar und flexible Raumgestaltung.
            </p>
          </div>
          <MietenForm />
        </div>
      </section>

      {/* ── 4. PROBERAUM ──────────────────────────────────────────────────── */}
      <section
        id="proberaum"
        className="scroll-mt-[30vh] split-section bg-white text-black flex flex-col"
      >
        <div className="flex-1 flex flex-col">
          <div className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b-4 border-black">
            <h2 className="text-4xl md:text-6xl font-black italic leading-none tracking-tighter mb-4">
              Proberaum
            </h2>
            <p className="text-base md:text-lg font-bold opacity-60 leading-snug">
              Absorber, Molton, Lamellenvorhang – alles was für eine gelungene Jam-Session nötig ist. Für Bands, Solo-Projekte, Unterricht und Workshops.
            </p>
          </div>
          <ProberaumForm />
        </div>

        <div className="flex-1 bg-neutral-100 relative flex items-center justify-center min-h-[60vw]">
          <span className="font-black italic text-4xl md:text-6xl opacity-10 uppercase tracking-tighter">[Foto]</span>
        </div>
      </section>

      {/* ── 5. ABOUT AMIGO* WOHNPROJEKT ───────────────────────────────────── */}
      <section
        id="amigo"
        className="scroll-mt-[30vh] bg-black text-white"
      >
        <div className="w-[95%] max-w-[1600px] mx-auto py-24 md:py-40 flex flex-col gap-12 md:gap-16">
          <div className="flex flex-col gap-6">
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">Das Projekt dahinter</p>
            <h2 className="text-4xl md:text-6xl lg:text-[5rem] font-black italic leading-[0.9] tracking-tighter flyer-text">
              Amigo*<br />Wohnprojekt
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.25] opacity-90">
              Die Quarterpipe ist Teil des Amigo* Wohnprojekts in der Hafencity – einem gemeinschaftlichen Ort, der Wohnen, Kultur und Begegnung zusammendenkt.
            </p>
            <p className="text-base md:text-lg font-mono opacity-60 leading-relaxed tracking-wide">
              [Placeholder – hier folgt mehr über das Wohnprojekt, seine Geschichte, seine Menschen und seine Werte. Wir freuen uns, wenn du vorbeischaust.]
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. ANFAHRT ────────────────────────────────────────────────────── */}
      <section
        id="anfahrt"
        className="scroll-mt-[30vh] split-section flex flex-col"
        style={{ minHeight: '400px' }}
      >
        <div className="flex-1 px-8 md:px-20 lg:px-28 py-20 md:py-32 flex flex-col gap-10">
          <h2 className="text-5xl md:text-[5rem] lg:text-[6rem] font-black italic leading-none tracking-tighter flyer-text">
            Anfahrt
          </h2>
          <div className="flex flex-col gap-3">
            <p className="text-2xl md:text-3xl font-black tracking-tight">Versmannstraße 66</p>
            <p className="text-2xl md:text-3xl font-black tracking-tight">20457 Hamburg</p>
            <p className="text-base md:text-lg font-mono opacity-60 mt-2">Zugang über die Promenade</p>
          </div>
        </div>

        <div className="split-map flex-1 relative min-h-[300px] overflow-hidden">
          <iframe
            src="https://www.google.com/maps?q=Versmannstraße+66,+20457+Hamburg&output=embed"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Quarterpipe Hamburg"
          />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-black text-white p-8 md:p-24 z-40 relative border-t border-white/20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12 md:gap-16">

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 md:mb-4">The Space</h2>
              <p className="opacity-60 tracking-widest text-[10px] md:text-sm font-mono uppercase">
                Versmannstraße 66 // 20457 Hamburg
              </p>
            </div>
            <div className="flex flex-row gap-6 items-center">
              <a href="https://www.instagram.com/quarterpipe.hh" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@quarterpipe.hh" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex gap-6 opacity-40 text-[10px] md:text-xs font-mono uppercase tracking-widest border-t border-white/20 pt-8">
            <a href="/impressum" className="hover:opacity-100 transition-opacity">Impressum</a>
            <a href="/datenschutz" className="hover:opacity-100 transition-opacity">Datenschutz</a>
          </div>

        </div>
      </footer>
    </main>
  );
}
