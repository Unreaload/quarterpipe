import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatWhen, getRegistrationEvent, registrationOpen } from '../../lib/tickets/events';
import { MAX_PER_ORDER, getEvent } from '../../lib/tickets/store';
import { RegistrationForm } from './RegistrationForm';

// Freie Plätze sollen live sein, nicht aus dem Cache.
export const dynamic = 'force-dynamic';

type Params = Promise<{ eventId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { eventId } = await params;
  const event = await getRegistrationEvent(eventId).catch(() => null);
  return { title: event ? `Anmeldung: ${event.title} – Quarterpipe` : 'Anmeldung – Quarterpipe' };
}

export default async function AnmeldungPage({ params }: { params: Params }) {
  const { eventId } = await params;
  const event = await getRegistrationEvent(eventId).catch(() => null);
  if (!event) notFound();

  const stored = await getEvent(event.id);
  const free = Math.max(0, event.anmeldung - (stored?.taken ?? 0));
  const open = registrationOpen(event);

  return (
    <main className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="bg-black text-white px-8 md:px-20 py-12 md:py-16 border-b-[16px] border-white">
        <Link
          href="/#events"
          className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 hover:opacity-100 transition-opacity inline-block mb-8"
        >
          ← Programm
        </Link>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mb-4">
          Anmeldung // {formatWhen(event.date, event.time)}
        </p>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none break-words hyphens-auto">
          {event.title}
        </h1>
        <div className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mt-6 flex flex-col gap-1">
          {event.einlass && <span>Einlass {event.einlass} Uhr</span>}
          {event.sub && <span>{event.sub}</span>}
        </div>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-16 md:py-24 flex flex-col gap-10">
        {!open ? (
          <Notice title="Anmeldung geschlossen." body="Das Event hat schon angefangen oder ist vorbei." />
        ) : free === 0 ? (
          <Notice
            title="Ausgebucht."
            body="Alle Plätze sind vergeben. Schau kurz vorher nochmal vorbei – wer absagt, gibt seinen Platz wieder frei."
          />
        ) : (
          <>
            <p className="font-mono text-sm tracking-[0.2em] uppercase opacity-60">
              Eintritt frei // noch {free} von {event.anmeldung} Plätzen
            </p>
            <RegistrationForm eventId={event.id} maxQuantity={Math.min(MAX_PER_ORDER, free)} />
          </>
        )}
      </div>

      <footer className="bg-black text-white px-8 md:px-20 py-8 border-t-4 border-white/20">
        <p className="font-mono text-[10px] tracking-widest uppercase opacity-40">
          Quarterpipe Hamburg // Versmannstraße 66
        </p>
      </footer>
    </main>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-4 border-black px-6 md:px-10 py-10 md:py-12 flex flex-col gap-3">
      <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{title}</p>
      <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">{body}</p>
    </div>
  );
}
