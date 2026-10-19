import { NextResponse } from 'next/server';
import { getBaseUrl, isValidEmail } from '../../../lib/newsletter';
import { clientIp, isRateLimited } from '../../../lib/rate-limit';
import { formatWhen, getRegistrationEvent, registrationOpen } from '../../../lib/tickets/events';
import { sendOrderMail } from '../../../lib/tickets/mail';
import { MAX_PER_ORDER, createOrder, findOpenOrder, getOrder, upsertEvent } from '../../../lib/tickets/store';

const MINUTE = 60 * 1000;

export async function POST(request: Request) {
  if (isRateLimited(`register:${clientIp(request)}`, 5, 15 * MINUTE)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields, humans don't. Pretend success, send nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const eventId = typeof data.eventId === 'string' ? data.eventId : '';
  const name = typeof data.name === 'string'
    ? data.name.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 100)
    : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const quantity = Number(data.quantity);

  if (name.length < 2) {
    return NextResponse.json({ error: 'Bitte gib deinen Namen an.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_ORDER) {
    return NextResponse.json({ error: `Maximal ${MAX_PER_ORDER} Plätze pro Anmeldung.` }, { status: 400 });
  }
  if (!data.privacy) {
    return NextResponse.json({ error: 'Bitte stimme der Datenschutzerklärung zu.' }, { status: 400 });
  }

  const event = await getRegistrationEvent(eventId).catch(() => null);
  if (!event) {
    return NextResponse.json({ error: 'Für dieses Event gibt es keine Anmeldung.' }, { status: 404 });
  }
  if (!registrationOpen(event)) {
    return NextResponse.json({ error: 'Die Anmeldung ist geschlossen.' }, { status: 400 });
  }

  // Dieselbe Adresse nicht beliebig oft anschreiben lassen.
  if (isRateLimited(`register-mail:${email}`, 3, 60 * MINUTE)) {
    return NextResponse.json({ error: 'Zu viele Anfragen für diese Adresse. Bitte später erneut versuchen.' }, { status: 429 });
  }

  try {
    const stored = await upsertEvent({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      capacity: event.anmeldung,
    });

    // Schon angemeldet (z. B. Mail verloren)? Dann denselben Link noch einmal
    // schicken statt eine zweite Anmeldung anzulegen. Die Antwort ist dieselbe
    // wie bei einer neuen Anmeldung, damit niemand abfragen kann, wer angemeldet ist.
    let orderId = await findOpenOrder(event.id, email);
    let mailName = name;
    let mailQuantity = quantity;

    if (orderId) {
      const existing = await getOrder(orderId);
      if (existing) {
        mailName = existing.name;
        mailQuantity = existing.quantity;
      }
    } else {
      const free = stored.capacity - stored.taken;
      if (free <= 0) {
        return NextResponse.json({ error: 'Leider schon ausgebucht.' }, { status: 409 });
      }
      if (quantity > free) {
        return NextResponse.json(
          { error: `Nur noch ${free} ${free === 1 ? 'Platz' : 'Plätze'} frei.` },
          { status: 409 },
        );
      }
      orderId = await createOrder({ eventId: event.id, name, email, quantity });
    }

    await sendOrderMail({
      to: email,
      name: mailName,
      eventTitle: event.title,
      when: formatWhen(event.date, event.time),
      quantity: mailQuantity,
      url: `${getBaseUrl(request)}/ticket/${orderId}`,
    });
  } catch (err) {
    console.error('Ticket registration failed:', err);
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen. Bitte versuche es später erneut.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
