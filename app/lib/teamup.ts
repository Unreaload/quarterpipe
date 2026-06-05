export interface TeamUpEvent {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // "HH:MM" or "" for all-day
  endTime: string;    // "HH:MM" or ""
  einlass: string;    // "HH:MM" or ""
  allDay: boolean;
  title: string;
  sub: string;
  description: string;
  imageUrl: string;
}

function toDateStr(dt: Date): string {
  return dt.toISOString().split('T')[0];
}

function toTimeStr(dt: Date): string {
  return dt.toTimeString().slice(0, 5);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

interface DayEntry {
  date: string;
  time: string;
  endDate: string;
  endTime: string;
}

interface ParsedNotes {
  titel?: string;
  days: DayEntry[];
  einlass?: string;
  location?: string;
  notes?: string;
}

// "20.06.2026, 20:00" → { date: "2026-06-20", time: "20:00" }
// "19.30" or "19:30" or "19.00 Uhr" → { date: "", time: "19:30" }
function parseGermanDateTime(str: string): { date: string; time: string } | null {
  const full = str.match(/(\d{2})\.(\d{2})\.(\d{4}),?\s*(\d{2}[.:]\d{2})/);
  if (full) return { date: `${full[3]}-${full[2]}-${full[1]}`, time: full[4].replace('.', ':') };
  const timeOnly = str.match(/(\d{2})[.:](\d{2})/);
  if (timeOnly) return { date: '', time: `${timeOnly[1]}:${timeOnly[2]}` };
  return null;
}

function parseStructuredNotes(notesText: string): ParsedNotes | null {
  if (!notesText.includes('Titel:')) return null;

  const result: ParsedNotes = { days: [] };
  const lines = notesText.split('\n');
  let currentKey = '';
  let currentValue = '';
  let pendingStart: { date: string; time: string } | null = null;

  function flush() {
    if (!currentKey) return;
    const val = currentValue.trim();
    if (currentKey === 'titel') result.titel = val;
    else if (currentKey === 'einlass') result.einlass = val.replace(/\s*uhr\s*$/i, '');
    else if (currentKey === 'location') result.location = val;
    else if (currentKey === 'notes') result.notes = val;
    else if (currentKey === 'start') {
      pendingStart = parseGermanDateTime(val);
    } else if (currentKey === 'ende') {
      const ende = parseGermanDateTime(val);
      if (pendingStart) {
        result.days.push({
          date: pendingStart.date || (ende ? ende.date : ''),
          time: pendingStart.time,
          endDate: ende ? (ende.date || pendingStart.date) : pendingStart.date,
          endTime: ende ? ende.time : '',
        });
        pendingStart = null;
      }
    }
  }

  const freeText: string[] = [];

  for (const line of lines) {
    if (line.startsWith('*')) break;
    if (line.startsWith('--')) continue;

    const match = line.match(/^(Titel|Start|Ende|Einlass|Location|Notes|Anhang):\s*(.*)/i);
    if (match) {
      flush();
      currentKey = match[1].toLowerCase();
      currentValue = match[2];
    } else if (currentKey && /^\s/.test(line)) {
      currentValue += '\n' + line.trim();
    } else if (line.trim()) {
      flush();
      currentKey = '';
      freeText.push(line.trim());
    }
  }
  flush();

  const leftover = pendingStart as { date: string; time: string } | null;
  if (leftover) {
    result.days.push({
      date: leftover.date,
      time: leftover.time,
      endDate: leftover.date,
      endTime: '',
    });
  }

  if (freeText.length) {
    result.notes = [result.notes, ...freeText].filter(Boolean).join('\n');
  }

  return result.titel ? result : null;
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

  const res = await fetch(url, { headers, next: { revalidate: 900 } });
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
    end_dt: string;
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

  const expanded: TeamUpEvent[] = [];

  for (const e of visible) {
    const allDay = !!e.all_day;
    const notes = e.notes ?? '';
    const notesText = notes
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();

    const parsed = parseStructuredNotes(notesText);
    const imageAttachment = (e.attachments ?? []).find(
      a => a.mimetype?.startsWith('image/')
    );
    const imageUrl = imageAttachment?.preview ?? imageAttachment?.link ?? '';

    const title = parsed?.titel || e.title;
    const einlass = parsed?.einlass || '';
    const sub = parsed?.location || e.location || '';
    const description = parsed?.notes || (parsed ? '' : notesText);

    // Structured notes with per-day Start/Ende pairs
    if (parsed && parsed.days.length > 0) {
      const apiDate = allDay ? e.start_dt.slice(0, 10) : toDateStr(new Date(e.start_dt));
      for (const day of parsed.days) {
        const date = day.date || apiDate;
        expanded.push({
          id: parsed.days.indexOf(day) === 0 ? String(e.id) : `${e.id}-${date}`,
          date,
          time: day.time,
          endTime: day.endTime,
          allDay: false,
          einlass,
          title,
          sub,
          description,
          imageUrl,
        });
      }
      continue;
    }

    // Fallback: use API start/end times
    const startDt = new Date(e.start_dt);
    const endDt = new Date(e.end_dt);
    const startDateStr = allDay ? e.start_dt.slice(0, 10) : toDateStr(startDt);
    const endDateStr = allDay ? e.end_dt.slice(0, 10) : toDateStr(endDt);
    const startTime = allDay ? '' : toTimeStr(startDt);
    const endTime = allDay ? '' : toTimeStr(endDt);

    if (startDateStr === endDateStr) {
      expanded.push({
        id: String(e.id),
        date: startDateStr,
        time: startTime,
        endTime,
        allDay,
        title,
        sub,
        description,
        imageUrl,
      });
    } else {
      let d = startDateStr;
      while (d <= endDateStr) {
        expanded.push({
          id: d === startDateStr ? String(e.id) : `${e.id}-${d}`,
          date: d,
          time: startTime,
          endTime,
          allDay,
          einlass,
          title,
          sub,
          description,
          imageUrl,
        });
        d = addDays(d, 1);
      }
    }
  }

  expanded.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return expanded;
}
