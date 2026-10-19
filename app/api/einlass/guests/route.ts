import { NextResponse } from 'next/server';
import { currentDoorEvent } from '../../../lib/tickets/door';
import { doorStats, guestList } from '../../../lib/tickets/store';

export async function GET() {
  const eventId = await currentDoorEvent();
  if (!eventId) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  try {
    const [guests, stats] = await Promise.all([guestList(eventId), doorStats(eventId)]);
    return NextResponse.json({ guests, stats }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('Guest list failed:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
