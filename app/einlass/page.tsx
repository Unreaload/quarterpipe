import { currentDoorEvent } from '../lib/tickets/door';
import { formatWhen } from '../lib/tickets/events';
import { doorStats, getEvent, guestList } from '../lib/tickets/store';
import { DoorApp } from './DoorApp';
import { PinForm } from './PinForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Einlass – Quarterpipe',
  robots: { index: false, follow: false },
};

export default async function EinlassPage() {
  const eventId = await currentDoorEvent();
  const event = eventId ? await getEvent(eventId) : null;

  if (!event) {
    return (
      <main className="w-full min-h-screen bg-black text-white font-sans px-6 py-12 md:px-20 md:py-16 flex flex-col gap-12">
        <header>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 mb-6">Quarterpipe // Einlass</p>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">Einlass</h1>
        </header>
        <PinForm />
      </main>
    );
  }

  const [guests, stats] = await Promise.all([guestList(event.id), doorStats(event.id)]);
  return (
    <DoorApp
      title={event.title}
      when={formatWhen(event.event_date, event.event_time)}
      initialGuests={guests}
      initialStats={stats}
    />
  );
}
