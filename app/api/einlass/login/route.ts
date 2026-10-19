import { NextResponse } from 'next/server';
import { clientIp, isRateLimited } from '../../../lib/rate-limit';
import { DOOR_COOKIE, createDoorSession, doorPin } from '../../../lib/tickets/door';
import { addDays, berlinToday } from '../../../lib/tickets/events';
import { eventsBetween } from '../../../lib/tickets/store';

export async function POST(request: Request) {
  if (isRateLimited(`einlass-login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Zu viele Versuche. Bitte in 15 Minuten erneut probieren.' }, { status: 429 });
  }
  if (!process.env.TICKETS_SECRET) {
    console.error('TICKETS_SECRET is not set');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const data = await request.json().catch(() => ({}));
  const pin = typeof data.pin === 'string' ? data.pin.replace(/\D/g, '') : '';

  // Die PIN gilt ab einer Woche vorher (zum Ausprobieren) bis zum Tag nach dem Event.
  const today = berlinToday();
  const candidates = await eventsBetween(addDays(today, -1), addDays(today, 7));
  const event = pin.length === 6 ? candidates.find(e => doorPin(e.id) === pin) : undefined;

  if (!event) {
    return NextResponse.json({ error: 'Falsche PIN' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DOOR_COOKIE, createDoorSession(event.id), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
