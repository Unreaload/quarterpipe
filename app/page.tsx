import { EventList } from './components/EventList';
import { Header } from './components/Header';
import { SkaterDivider } from './components/SkaterDivider';
import { MapEmbed } from './components/MapEmbed';
import { MietenForm } from './components/MietenForm';
import { NewsletterForm } from './components/NewsletterForm';
import { ProberaumForm } from './components/ProberaumForm';
import { DiscoLights } from './components/DiscoLights';
import { Barrierefreiheit } from './components/Barrierefreiheit';
import { fetchEvents } from './lib/teamup';
import type { TeamUpEvent } from './lib/teamup';

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];


  let events: TeamUpEvent[] = [];
  let eventsError = false;
  try {
    events = await fetchEvents();
  } catch {
    eventsError = true;
  }

  return (
    <main className="w-full max-w-[100vw] bg-white text-black selection:bg-black selection:text-white overflow-clip font-sans">

      <DiscoLights />
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
                QUARTERPIPE
              </span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: events list */}
        <div className="flex flex-col min-w-0 w-full pl-4 md:pl-8 lg:pl-12 z-10 pb-32 md:pb-48">
          <section className="w-full flex flex-col items-end pt-20 pointer-events-auto">
            <header className="mb-16 md:mb-24 text-right w-full">
              <img src="/images/Programm.svg" alt="Aktuelles Programm" className="w-full max-w-[600px] ml-auto border-b-[8px] md:border-b-[16px] border-black" />
            </header>

            <div className="w-full flex flex-col items-end text-right">
              {events.length === 0 && !eventsError && (
                <p className="font-mono text-sm opacity-40 tracking-widest uppercase py-8">Keine Events gefunden.</p>
              )}
              {eventsError && (
                <p className="font-mono text-sm opacity-40 tracking-widest uppercase py-8">Programm konnte nicht geladen werden.</p>
              )}
              <EventList events={events} today={today} />
            </div>
          </section>
        </div>
      </div>

      <SkaterDivider />

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <NewsletterForm />

      <SkaterDivider female />

      {/* ── 2. MEHR ALS EIN RAUM ──────────────────────────────────────────── */}
      <section
        id="raum"
        className="scroll-mt-[30vh] split-section flex flex-col"
      >
        {/* Left: text */}
        <div className="flex-1 px-8 md:px-16 py-20 md:py-32 flex flex-col gap-10 md:gap-14">
          <img src="/images/Partylocation.svg" alt="Mehr als ein Raum" className="w-full max-w-[500px]" />
          <p className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.2] opacity-90">
            Hier treffen sich Skater*innen, Kreative, Musiker*innen und Nachbar*innen, um gemeinsam aktiv zu werden. Ob für Indoor-Skaten, Konzerte oder Workshops – die Quarterpipe steht für Austausch, Ideen und besondere Momente.
          </p>
          <Barrierefreiheit />
        </div>

        {/* Right: video */}
        <div className="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
          <video
            src="/images/Video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <SkaterDivider female />

      {/* ── 3. MIETEN ─────────────────────────────────────────────────────── */}
      <section
        id="mieten"
        className="scroll-mt-[30vh] split-section bg-white text-black flex flex-col"
      >
        <div className="flex-1 flex items-center justify-center overflow-hidden p-6 md:p-10 order-2 md:order-1">
          <img
            src="/images/Miete_Bild.jpeg"
            alt="Mieten"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col order-1 md:order-2">
          <div className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b-4 border-black">
            <img src="/images/Mieten.svg" alt="Mieten" className="w-full max-w-[400px] mb-4" />
            <p className="text-base md:text-lg font-bold opacity-60 leading-snug">
              Konzerte, Workshops, Sportkurse, Lesungen, Geburtstage – viel Platz, eine kleine Küche, eine Bar und flexible Raumgestaltung.
            </p>
          </div>
          <MietenForm />
        </div>
      </section>

      <SkaterDivider />

      {/* ── 4. PROBERAUM ──────────────────────────────────────────────────── */}
      <section
        id="proberaum"
        className="scroll-mt-[30vh] split-section bg-white text-black flex flex-col"
      >
        <div className="flex-1 flex flex-col">
          <div className="px-8 md:px-16 pt-16 md:pt-24 pb-10 border-b-4 border-black">
            <img src="/images/Proberaum.svg" alt="Proberaum" className="w-full max-w-[400px] mb-4" />
            <p className="text-base md:text-lg font-bold opacity-60 leading-snug">
              Absorber, Molton, Lamellenvorhang – alles was für eine gelungene Jam-Session nötig ist. Für Bands, Solo-Projekte, Unterricht und Workshops.
            </p>
          </div>
          <ProberaumForm />
        </div>

        <div className="flex-1">
          <img
            src="/images/Proberaum.png"
            alt="Proberaum"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <SkaterDivider female />

      {/* ── 5. ABOUT AMIGO* WOHNPROJEKT ───────────────────────────────────── */}
      <section
        id="amigo"
        className="scroll-mt-[30vh] split-section flex flex-col"
      >
        <div className="flex-1 order-2 md:order-1">
          <img
            src="/images/Wohnprojekt_Bild.jpeg"
            alt="AMiGO* Wohnprojekt"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col px-8 md:px-16 py-20 md:py-32 gap-10 md:gap-14 bg-black text-white order-1 md:order-2">
          <img src="/images/Wohnprojekt.svg" alt="AMiGO* Wohnprojekt" className="w-full max-w-[500px]" style={{ filter: 'invert(1)', mixBlendMode: 'normal' }} />
          <p className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.25] opacity-90">
            Die Quarterpipe ist Teil des AMiGO* Wohnprojekts in der Hafencity – <strong>A</strong>ktives <strong>Mi</strong>teinander in der <strong>G</strong>ro&szlig;stadt<strong>o</strong>ase. Ein gemeinschaftlicher Ort, der Wohnen, Kultur und Begegnung zusammendenkt.
          </p>
          <p className="text-base md:text-lg font-mono opacity-60 leading-relaxed tracking-wide">
            Ein Ort, an dem Nachbarschaft gelebt wird – mit gemeinsamen Räumen, geteilter Verantwortung und der Überzeugung, dass gutes Zusammenleben kein Zufall ist. Wir freuen uns, wenn du vorbeischaust.
          </p>
        </div>
      </section>

      <SkaterDivider />

      {/* ── 6. ANFAHRT ────────────────────────────────────────────────────── */}
      <section
        id="anfahrt"
        className="scroll-mt-[30vh] split-section flex flex-col"
      >
        <div className="flex-1 px-8 md:px-20 lg:px-28 py-20 md:py-32 flex flex-col gap-10">
          <img src="/images/Anfahrt.svg" alt="Anfahrt" className="w-full max-w-[500px]" />
          <img src="/images/Lageplan.png" alt="Lageplan Quarterpipe" className="w-full" />
        </div>

        <div className="split-map flex-1 flex items-center justify-center p-8 md:p-12 overflow-hidden">
          <div className="relative w-full h-0 pb-[50%] overflow-hidden">
            <MapEmbed />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-black text-white p-8 md:p-24 z-40 relative border-t border-white/20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12 md:gap-16">

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 md:mb-4">Quarterpipe</h2>
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
            <a href="/mitglieder" className="hover:opacity-100 transition-opacity">Mitglieder</a>
          </div>

        </div>
      </footer>
    </main>
  );
}
