import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { formatWhen, registrationOpen } from '../../lib/tickets/events';
import { getOrder } from '../../lib/tickets/store';
import { CancelButton, ConfirmButton } from './OrderActions';

export const dynamic = 'force-dynamic';

// Der Link ist das Ticket: nicht indexieren und beim Klick auf andere Seiten
// nicht als Referrer weitergeben.
export const metadata = {
  title: 'Dein Ticket – Quarterpipe',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

type Params = Promise<{ orderId: string }>;

export default async function TicketPage({ params }: { params: Params }) {
  const { orderId } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  const { event } = order;
  const when = formatWhen(event.event_date, event.event_time);
  const upcoming = registrationOpen({ date: event.event_date, time: event.event_time });
  const anyCheckedIn = order.tickets.some(t => t.checkedInAt);

  const qrCodes = order.status === 'confirmed'
    ? await Promise.all(
        order.tickets.map(t =>
          QRCode.toString(`QP:${t.token}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' }),
        ),
      )
    : [];

  return (
    <main className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="bg-black text-white px-8 md:px-20 py-12 md:py-16 border-b-[16px] border-white">
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mb-4">
          {when}{" // "}{order.quantity === 1 ? '1 Person' : `${order.quantity} Personen`}
        </p>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none break-words hyphens-auto">
          {event.title}
        </h1>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-50 mt-6">
          Angemeldet: {order.name}
        </p>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-16 md:py-24 flex flex-col gap-12">
        {order.status === 'pending' && !order.expired && (
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">Fast geschafft.</p>
              <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">
                Bestätige deine Anmeldung, dann sind die Plätze für dich reserviert und du bekommst hier deine Tickets.
              </p>
            </div>
            <ConfirmButton orderId={order.id} />
          </section>
        )}

        {order.status === 'pending' && order.expired && (
          <Notice
            title="Link abgelaufen."
            body="Diese Anmeldung wurde nicht innerhalb von 24 Stunden bestätigt. Melde dich einfach neu an."
            href={upcoming ? `/anmeldung/${event.id}` : undefined}
          />
        )}

        {order.status === 'cancelled' && (
          <Notice
            title="Abgesagt."
            body="Diese Anmeldung ist storniert, die Plätze sind wieder frei."
            href={upcoming ? `/anmeldung/${event.id}` : undefined}
          />
        )}

        {order.status === 'confirmed' && (
          <>
            <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">
              Zeig am Einlass den QR-Code – Bildschirm hell stellen, ein Screenshot geht auch.
              {order.quantity > 1 && ' Jeder Code gilt für eine Person.'}
            </p>

            <div className="grid gap-8 sm:grid-cols-2">
              {order.tickets.map((t, i) => (
                <article key={t.code} className="border-4 border-black p-6 flex flex-col gap-4">
                  <div
                    className={`w-full aspect-square [&>svg]:w-full [&>svg]:h-full ${t.checkedInAt ? 'opacity-15' : ''}`}
                    dangerouslySetInnerHTML={{ __html: qrCodes[i] }}
                  />
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-2xl font-bold tracking-[0.2em]">QP-{t.code}</span>
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">
                      Ticket {t.position}/{order.quantity}
                    </span>
                  </div>
                  {t.checkedInAt && (
                    <span className="bg-black text-white font-mono text-xs tracking-[0.3em] uppercase px-3 py-2 self-start">
                      Eingecheckt
                    </span>
                  )}
                </article>
              ))}
            </div>

            {upcoming && !anyCheckedIn && (
              <div className="border-t-4 border-black pt-10 flex flex-col gap-4">
                <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">
                  Kannst du doch nicht? Sag ab, dann kriegt jemand anderes deinen Platz.
                </p>
                <CancelButton orderId={order.id} />
              </div>
            )}
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

function Notice({ title, body, href }: { title: string; body: string; href?: string }) {
  return (
    <div className="border-4 border-black px-6 md:px-10 py-10 md:py-12 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{title}</p>
        <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">{body}</p>
      </div>
      {href && (
        <a href={href} className="self-start border-4 border-black px-6 py-4 font-black italic text-lg hover:bg-black hover:text-white transition-all">
          Neu anmelden
        </a>
      )}
    </div>
  );
}
