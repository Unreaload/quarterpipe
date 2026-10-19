import { NextResponse } from 'next/server';
import { currentDoorEvent } from '../../../lib/tickets/door';
import { checkIn, doorStats, undoCheckIn } from '../../../lib/tickets/store';

// POST { input }        → Ticket einchecken (QR-Inhalt "QP:<token>" oder Kurz-Code)
// POST { undo: code }   → Check-in zurücknehmen
export async function POST(request: Request) {
  const eventId = await currentDoorEvent();
  if (!eventId) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const data = await request.json().catch(() => ({}));

  try {
    if (typeof data.undo === 'string') {
      const undone = await undoCheckIn(eventId, data.undo.slice(0, 20));
      return NextResponse.json({ undone, stats: await doorStats(eventId) });
    }

    const raw = typeof data.input === 'string' ? data.input.trim().slice(0, 200) : '';
    if (!raw) {
      return NextResponse.json({ error: 'Kein Code' }, { status: 400 });
    }
    const input = raw.startsWith('QP:') ? raw.slice(3) : raw;

    const result = await checkIn(eventId, input);
    return NextResponse.json({ ...result, stats: await doorStats(eventId) });
  } catch (err) {
    console.error('Check-in failed:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
