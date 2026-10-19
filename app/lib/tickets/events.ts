import { fetchEvents, type TeamUpEvent } from '../teamup';

const TZ = 'Europe/Berlin';

/** Aktuelle Berliner Uhrzeit als "YYYY-MM-DD HH:MM" – vergleichbar mit Event-Datum + Uhrzeit. */
export function berlinNow(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date());
}

export function berlinToday(): string {
  return berlinNow().slice(0, 10);
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "2026-11-15", "20:00" → "Sa 15.11.2026 · 20:00 Uhr" */
export function formatWhen(date: string, time: string): string {
  const weekday = new Date(date + 'T12:00:00Z')
    .toLocaleDateString('de-DE', { weekday: 'short', timeZone: 'UTC' })
    .replace('.', '');
  const day = date.split('-').reverse().join('.');
  return time ? `${weekday} ${day} · ${time} Uhr` : `${weekday} ${day}`;
}

/** Anmeldung ist bis zum Beginn des Events möglich (ganztägig: bis Tagesende). */
export function registrationOpen(e: { date: string; time: string }): boolean {
  return `${e.date} ${e.time || '23:59'}` > berlinNow();
}

/** Teamup-Event mit freigeschalteter Anmeldung ("Anmeldung: 80" in den Notizen), sonst null. */
export async function getRegistrationEvent(id: string): Promise<TeamUpEvent | null> {
  const events = await fetchEvents();
  return events.find(e => e.id === id && e.anmeldung > 0) ?? null;
}
