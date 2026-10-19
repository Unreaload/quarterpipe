import { NextResponse } from 'next/server';
import { clientIp, isRateLimited } from '../../../lib/rate-limit';
import { confirmOrder } from '../../../lib/tickets/store';

export async function POST(request: Request) {
  if (isRateLimited(`confirm:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  const data = await request.json().catch(() => ({}));
  const orderId = typeof data.order === 'string' ? data.order : '';
  if (!/^[A-Za-z0-9_-]{22}$/.test(orderId)) {
    return NextResponse.json({ error: 'Ungültiger Link.' }, { status: 400 });
  }

  try {
    const result = await confirmOrder(orderId);
    if (result === 'full') {
      return NextResponse.json({ error: 'Leider sind inzwischen nicht mehr genug Plätze frei.' }, { status: 409 });
    }
    if (result === 'invalid') {
      return NextResponse.json({ error: 'Diese Anmeldung ist abgelaufen oder storniert.' }, { status: 410 });
    }
  } catch (err) {
    console.error('Ticket confirmation failed:', err);
    return NextResponse.json({ error: 'Bestätigung fehlgeschlagen. Bitte versuche es erneut.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
