import { NextResponse } from 'next/server';
import { addDays, berlinToday } from '../../../lib/tickets/events';
import { cleanup } from '../../../lib/tickets/store';

// Läuft täglich per Vercel Cron (vercel.json). Vercel schickt
// "Authorization: Bearer $CRON_SECRET" mit.
const RETENTION_DAYS = 30;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await cleanup(addDays(berlinToday(), -RETENTION_DAYS));
  return NextResponse.json({ ok: true, deleted });
}
