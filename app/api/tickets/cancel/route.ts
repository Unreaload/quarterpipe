import { NextResponse } from 'next/server';
import { clientIp, isRateLimited } from '../../../lib/rate-limit';
import { registrationOpen } from '../../../lib/tickets/events';
import { cancelOrder, getOrder } from '../../../lib/tickets/store';

export async function POST(request: Request) {
  if (isRateLimited(`cancel:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  const data = await request.json().catch(() => ({}));
  const orderId = typeof data.order === 'string' ? data.order : '';
  if (!/^[A-Za-z0-9_-]{22}$/.test(orderId)) {
    return NextResponse.json({ error: 'Ungültiger Link.' }, { status: 400 });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Anmeldung nicht gefunden.' }, { status: 404 });
    }
    if (!registrationOpen({ date: order.event.event_date, time: order.event.event_time })) {
      return NextResponse.json({ error: 'Das Event hat schon angefangen.' }, { status: 400 });
    }
    if (!(await cancelOrder(orderId))) {
      return NextResponse.json({ error: 'Diese Anmeldung kann nicht mehr storniert werden.' }, { status: 409 });
    }
  } catch (err) {
    console.error('Ticket cancellation failed:', err);
    return NextResponse.json({ error: 'Absage fehlgeschlagen. Bitte versuche es erneut.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
