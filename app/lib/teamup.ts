export interface TeamUpEvent {
  id: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM
  title: string;
  sub: string;
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

  const events: TeamUpEvent[] = (data.events ?? []).map((e: {
    id: string;
    title: string;
    start_dt: string;
    notes?: string;
    location?: string;
  }) => {
    const dt = new Date(e.start_dt);
    return {
      id: e.id,
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().slice(0, 5),
      title: e.title,
      sub: e.location ?? e.notes?.split('\n')[0] ?? '',
    };
  });

  const filtered = events.filter(e => {
    const text = `${e.title} ${e.sub}`.toLowerCase();
    return !text.includes('vorlage veranstaltung') && !text.includes('anfrage');
  });

  filtered.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return filtered;
}
