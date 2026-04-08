import { NextResponse } from 'next/server';
import { fetchEvents } from '../../lib/teamup';
export type { TeamUpEvent } from '../../lib/teamup';

export async function GET() {
  try {
    const events = await fetchEvents();
    return NextResponse.json(events);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('TeamUp fetch error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
