import { fetchEvents, type TeamUpEvent } from '../lib/teamup';
import { doorPin } from '../lib/tickets/door';
import { berlinToday, formatWhen } from '../lib/tickets/events';
import { eventStats } from '../lib/tickets/store';

export const dynamic = 'force-dynamic';

const links: { label: string; url: string; description?: string }[] = [
  // TODO: hier die internen Links eintragen
  // { label: 'Beispiel-Ressource', url: 'https://...', description: 'Kurze Beschreibung' },
];

async function loadAnmeldungen() {
  const today = berlinToday();
  try {
    const [events, stats] = await Promise.all([fetchEvents(), eventStats(today)]);
    return events
      .filter((e: TeamUpEvent) => e.anmeldung > 0 && e.date >= today)
      .map(e => ({
        event: e,
        taken: stats.get(e.id)?.taken ?? 0,
        checkedIn: stats.get(e.id)?.checkedIn ?? 0,
        pin: process.env.TICKETS_SECRET ? doorPin(e.id) : '––––––',
      }));
  } catch (err) {
    console.error('Anmeldungen laden fehlgeschlagen:', err);
    return null;
  }
}

export default async function MitgliederPage() {
  const anmeldungen = await loadAnmeldungen();

  return (
    <main className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="bg-black text-white px-8 md:px-20 py-12 md:py-16 border-b-[16px] border-white">
        <a
          href="/"
          className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 hover:opacity-100 transition-opacity inline-block mb-8"
        >
          ← Zurück
        </a>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
          Mitglieder
        </h1>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mt-6">
          Interne Ressourcen
        </p>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-20 md:py-32 flex flex-col gap-12">
        <section className="flex flex-col gap-8 border-b-4 border-black pb-12">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none">Anmeldungen</h2>
            <p className="font-mono text-sm opacity-60 leading-relaxed">
              Freischalten: In Teamup in die Notizen des Events eine Zeile{' '}
              <code className="bg-black text-white px-1">Anmeldung: 80</code> schreiben (Zahl = Plätze).
              Am Abend <a href="/einlass" className="underline">/einlass</a> auf dem Handy öffnen und die PIN eingeben.
            </p>
          </div>

          {anmeldungen === null && (
            <p className="font-mono text-sm text-red-600 tracking-widest uppercase">Konnte nicht geladen werden.</p>
          )}
          {anmeldungen?.length === 0 && (
            <p className="font-mono text-sm opacity-50 tracking-widest uppercase">Gerade keine Events mit Anmeldung.</p>
          )}
          {anmeldungen?.map(({ event, taken, checkedIn, pin }) => (
            <div key={event.id} className="flex flex-col gap-2 border-t-2 border-black/20 pt-6">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">
                {formatWhen(event.date, event.time)}
              </span>
              <a href={`/anmeldung/${event.id}`} className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none hover:opacity-60">
                {event.title}
              </a>
              <span className="font-mono text-sm">
                {taken} / {event.anmeldung} angemeldet{checkedIn > 0 && ` · ${checkedIn} eingecheckt`}
              </span>
              <span className="font-mono text-sm">
                Einlass-PIN: <strong className="tracking-[0.2em]">{pin}</strong>
              </span>
            </div>
          ))}
        </section>

        {links.length === 0 && (
          <p className="font-mono text-sm opacity-50 tracking-widest uppercase">
            Noch keine Links hinterlegt.
          </p>
        )}

        {links.map(({ label, url, description }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 border-b-4 border-black pb-8 hover:opacity-60 transition-opacity"
          >
            <span className="text-2xl md:text-4xl font-black italic tracking-tighter leading-none">
              {label}
            </span>
            {description && (
              <span className="font-mono text-sm opacity-60 leading-relaxed">{description}</span>
            )}
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40 mt-2">
              {new URL(url).hostname} ↗
            </span>
          </a>
        ))}

        <form action="/api/mitglieder/logout" method="POST" className="pt-12">
          <button
            type="submit"
            className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity"
          >
            Ausloggen
          </button>
        </form>
      </div>

      <footer className="bg-black text-white px-8 md:px-20 py-8 border-t-4 border-white/20">
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40">
          Quarterpipe Hamburg // Versmannstraße 66
        </p>
      </footer>
    </main>
  );
}
