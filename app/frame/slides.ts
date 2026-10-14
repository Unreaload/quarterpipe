import QRCode from 'qrcode';
import { fetchEvents, type TeamUpEvent } from '@/app/lib/teamup';

type QrItem = { type: 'qr'; url: string; title?: string; caption?: string; duration?: number };

// Einträge in content/frame.json
export type FrameItem =
  | { type: 'image'; src: string; duration?: number }
  | { type: 'video'; src: string; duration?: number } // ohne duration: bis Videoende
  | { type: 'page'; src: string; duration?: number } // eigene Route als iframe
  | { type: 'text'; text: string; duration?: number }
  | QrItem // QR-Code zu url, mit Überschrift und Untertitel
  | { type: 'program'; duration?: number; days?: number } // Programmübersicht aus Teamup
  | { type: 'highlights'; duration?: number; days?: number }; // je Event mit Flyer eine Seite

export interface FrameEvent {
  date: string; // YYYY-MM-DD
  time: string;
  endTime: string;
  einlass: string;
  title: string;
  sub: string;
  lines: string[];
  imageUrl: string;
}

// Fertig aufgelöste Slides, die an den Client gehen
export type FrameSlide =
  | Exclude<FrameItem, { type: 'program' } | { type: 'highlights' } | QrItem>
  | (QrItem & { qr: string }) // qr: SVG als data-URI
  | { type: 'program'; duration?: number; from: string; to: string; today: string; events: FrameEvent[] }
  | { type: 'highlight'; duration?: number; today: string; event: FrameEvent };

const DEFAULT_DAYS = 28;
const MAX_LINES = 8;

function berlinToday(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const LINK = /\[([^\]]*)\]\([^)]+\)/g;

// Teamup-Notes für den Bildschirm: Links auf ihr Label reduzieren, nackte URLs weg,
// aufeinanderfolgende reine Link-Zeilen (Bandnamen) zu "A · B · C" zusammenfassen.
function toLines(description: string): string[] {
  const out: string[] = [];
  let linkRun: string[] = [];
  const flushLinks = () => {
    if (linkRun.length) out.push(linkRun.join(' · '));
    linkRun = [];
  };

  for (const raw of description.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.replace(LINK, '').trim() === '') {
      linkRun.push(...[...line.matchAll(LINK)].map((m) => m[1]));
      continue;
    }
    flushLinks();
    const text = line
      .replace(LINK, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (text) out.push(text);
  }
  flushLinks();
  return out.slice(0, MAX_LINES);
}

function toFrameEvent(e: TeamUpEvent): FrameEvent {
  return {
    date: e.date,
    time: e.time,
    endTime: e.endTime,
    einlass: e.einlass,
    title: e.title,
    sub: e.sub,
    lines: toLines(e.description),
    imageUrl: e.imageUrl,
  };
}

// Ersetzt die Teamup-Platzhalter durch echte Slides. Ist Teamup nicht erreichbar,
// fallen diese Slides weg und der Rest der Playlist läuft normal.
export async function resolveSlides(items: FrameItem[]): Promise<FrameSlide[]> {
  const needsEvents = items.some((i) => i.type === 'program' || i.type === 'highlights');
  let events: TeamUpEvent[] = [];
  if (needsEvents) {
    try {
      events = await fetchEvents();
    } catch (err) {
      console.error('frame: Teamup nicht erreichbar', err);
    }
  }

  const today = berlinToday();
  const upcoming = (days = DEFAULT_DAYS) => {
    const to = addDays(today, days - 1);
    return { to, events: events.filter((e) => e.date >= today && e.date <= to) };
  };

  const slides = await Promise.all(items.map(async (item): Promise<FrameSlide[]> => {
    if (item.type === 'qr') {
      // Schwarz auf Weiß mit Ruhezone, damit Handykameras zuverlässig scannen
      const svg = await QRCode.toString(item.url, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' });
      return [{ ...item, qr: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }];
    }
    if (item.type === 'program') {
      const { to, events: list } = upcoming(item.days);
      if (!list.length) return [];
      return [{ type: 'program', duration: item.duration, from: today, to, today, events: list.map(toFrameEvent) }];
    }
    if (item.type === 'highlights') {
      const seen = new Set<string>();
      return upcoming(item.days)
        .events.filter((e) => e.imageUrl)
        // mehrtägige Events nur einmal zeigen
        .filter((e) => !seen.has(e.title) && !!seen.add(e.title))
        .map((e) => ({ type: 'highlight', duration: item.duration, today, event: toFrameEvent(e) }));
    }
    return [item];
  }));
  return slides.flat();
}
