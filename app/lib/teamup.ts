export interface TeamUpEvent {
  id: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM or "" for all-day
  allDay: boolean;
  title: string;
  sub: string;
  description: string;
  imageUrl: string;
}

export async function fetchEvents(): Promise<TeamUpEvent[]> {
  const calendarKey = process.env.TEAMUP_CALENDAR_KEY;
  if (!calendarKey) throw new Error('TEAMUP_CALENDAR_KEY is not set');

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  const end = new Date(now);
  end.setDate(end.getDate() + 30);

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  const url = `https://api.teamup.com/${calendarKey}/events?startDate=${startDate}&endDate=${endDate}`;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (process.env.TEAMUP_API_KEY) {
    headers['Teamup-Token'] = process.env.TEAMUP_API_KEY;
  }

  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TeamUp API error ${res.status}: ${body}`);
  }

  const data = await res.json();

  interface RawEvent {
    id: string;
    title: string;
    all_day: boolean;
    start_dt: string;
    notes?: string;
    location?: string;
    attachments?: { name?: string; mimetype?: string; link?: string; preview?: string; thumbnail?: string }[];
    custom?: { veranstalter_in?: string[] };
  }

  const rawEvents: RawEvent[] = data.events ?? [];

  const visible = rawEvents.filter(e => {
    const text = `${e.title} ${e.location ?? ''}`.toLowerCase();
    if (text.includes('vorlage veranstaltung') || text.includes('anfrage')) return false;
    const veranstalter = e.custom?.veranstalter_in ?? [];
    if (veranstalter.some(v => v.includes('geschlossen'))) return false;
    return true;
  });

  const filtered: TeamUpEvent[] = visible.map(e => {
    const allDay = !!e.all_day;
    let date: string;
    let time: string;

    if (allDay) {
      date = e.start_dt.slice(0, 10);
      time = '';
    } else {
      const dt = new Date(e.start_dt);
      date = dt.toISOString().split('T')[0];
      time = dt.toTimeString().slice(0, 5);
    }

    const notes = e.notes ?? '';
    const notesText = notes.replace(/<[^>]*>/g, '').trim();

    const imageAttachment = (e.attachments ?? []).find(
      a => a.mimetype?.startsWith('image/')
    );

    return {
      id: e.id,
      date,
      time,
      allDay,
      title: e.title,
      sub: e.location ?? notesText.split('\n')[0] ?? '',
      description: notesText,
      imageUrl: imageAttachment?.preview ?? imageAttachment?.link ?? '',
    };
  });

  filtered.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return filtered;
}
