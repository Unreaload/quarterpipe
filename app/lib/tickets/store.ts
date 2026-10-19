import crypto from 'crypto';
import { db } from './db';

export const MAX_PER_ORDER = 4;

// Ohne 0/O und 1/I, damit sich der Code am Einlass nicht vertippen lässt.
// 32 Zeichen, also ist `byte % 32` gleichverteilt.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 128 Bit Zufall, nicht erratbar. Für Ticket-Links und QR-Codes. */
export function randomToken(): string {
  return crypto.randomBytes(16).toString('base64url');
}

function randomCode(): string {
  return Array.from(crypto.randomBytes(4), b => CODE_ALPHABET[b % 32]).join('');
}

/** "qp-7k3m", "QP 7K3M" oder "7k3m" → "7K3M" */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/^QP[-\s]*/, '').replace(/[^A-Z0-9]/g, '');
}

function toIso(value: unknown): string | null {
  return value == null ? null : new Date(value as string).toISOString();
}

export interface TicketEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  capacity: number;
  taken: number;
}

export interface Ticket {
  code: string;
  token: string;
  position: number;
  checkedInAt: string | null;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  expired: boolean;
  event: Pick<TicketEvent, 'id' | 'title' | 'event_date' | 'event_time'>;
  tickets: Ticket[];
}

// ---------------------------------------------------------------- Events

export async function upsertEvent(e: {
  id: string;
  title: string;
  date: string;
  time: string;
  capacity: number;
}): Promise<TicketEvent> {
  const q = await db();
  const [row] = await q<TicketEvent>(
    `INSERT INTO ticket_events (id, title, event_date, event_time, capacity)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       event_date = EXCLUDED.event_date,
       event_time = EXCLUDED.event_time,
       capacity = EXCLUDED.capacity
     RETURNING *`,
    [e.id, e.title, e.date, e.time, e.capacity],
  );
  return row;
}

export async function getEvent(id: string): Promise<TicketEvent | null> {
  const q = await db();
  const [row] = await q<TicketEvent>('SELECT * FROM ticket_events WHERE id = $1', [id]);
  return row ?? null;
}

export async function eventsBetween(from: string, to: string): Promise<TicketEvent[]> {
  const q = await db();
  return q<TicketEvent>(
    'SELECT * FROM ticket_events WHERE event_date BETWEEN $1 AND $2 ORDER BY event_date, event_time',
    [from, to],
  );
}

/** Für die Mitgliederseite: Anmeldungen und Check-ins pro Event ab `from`. */
export async function eventStats(from: string): Promise<Map<string, { taken: number; checkedIn: number }>> {
  const q = await db();
  const rows = await q<{ id: string; taken: number; checked_in: number }>(
    `SELECT e.id, e.taken, count(t.checked_in_at)::int AS checked_in
     FROM ticket_events e
     LEFT JOIN tickets t ON t.event_id = e.id
     WHERE e.event_date >= $1
     GROUP BY e.id`,
    [from],
  );
  return new Map(rows.map(r => [r.id, { taken: r.taken, checkedIn: r.checked_in }]));
}

// ---------------------------------------------------------------- Anmeldungen

/** Offene oder bestätigte Anmeldung derselben Adresse für dieses Event, falls vorhanden. */
export async function findOpenOrder(eventId: string, email: string): Promise<string | null> {
  const q = await db();
  const [row] = await q<{ id: string }>(
    `SELECT id FROM ticket_orders
     WHERE event_id = $1 AND email = $2
       AND (status = 'confirmed' OR (status = 'pending' AND created_at > now() - interval '24 hours'))
     ORDER BY created_at DESC
     LIMIT 1`,
    [eventId, email],
  );
  return row?.id ?? null;
}

/**
 * Legt eine unbestätigte Anmeldung samt Tickets an. Plätze werden erst bei der
 * Bestätigung belegt, damit Fake-Adressen kein Kontingent blockieren.
 */
export async function createOrder(o: {
  eventId: string;
  name: string;
  email: string;
  quantity: number;
}): Promise<string> {
  const q = await db();

  // Kollidiert ein Kurz-Code mit einem bestehenden Ticket des Events,
  // scheitert das ganze Statement und wir würfeln neu.
  for (let attempt = 0; ; attempt++) {
    const id = randomToken();
    const params: unknown[] = [id, o.eventId, o.name, o.email, o.quantity];
    const values: string[] = [];
    for (let position = 1; position <= o.quantity; position++) {
      params.push(randomToken(), randomCode());
      values.push(`($${params.length - 1}, $${params.length}, ${position})`);
    }

    try {
      await q(
        `WITH o AS (
           INSERT INTO ticket_orders (id, event_id, name, email, quantity)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, event_id
         )
         INSERT INTO tickets (token, code, position, order_id, event_id)
         SELECT v.token, v.code, v.position, o.id, o.event_id
         FROM o, (VALUES ${values.join(', ')}) AS v (token, code, position)`,
        params,
      );
      return id;
    } catch (err) {
      if ((err as { code?: string }).code !== '23505' || attempt >= 4) throw err;
    }
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const q = await db();
  const [row] = await q<{
    id: string; name: string; email: string; quantity: number; status: Order['status']; expired: boolean;
    event_id: string; title: string; event_date: string; event_time: string;
  }>(
    `SELECT o.id, o.name, o.email, o.quantity, o.status,
            (o.status = 'pending' AND o.created_at < now() - interval '24 hours') AS expired,
            e.id AS event_id, e.title, e.event_date, e.event_time
     FROM ticket_orders o
     JOIN ticket_events e ON e.id = o.event_id
     WHERE o.id = $1`,
    [id],
  );
  if (!row) return null;

  const tickets = await q<{ code: string; token: string; position: number; checked_in_at: unknown }>(
    'SELECT code, token, position, checked_in_at FROM tickets WHERE order_id = $1 ORDER BY position',
    [id],
  );

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    quantity: row.quantity,
    status: row.status,
    expired: row.expired,
    event: { id: row.event_id, title: row.title, event_date: row.event_date, event_time: row.event_time },
    tickets: tickets.map(t => ({
      code: t.code,
      token: t.token,
      position: t.position,
      checkedInAt: toIso(t.checked_in_at),
    })),
  };
}

/**
 * Bestätigt eine Anmeldung und belegt die Plätze – nur wenn noch genug frei
 * sind. Ein Statement: FOR UPDATE sperrt die Anmeldung (Doppelklick zählt
 * nicht doppelt), das UPDATE auf ticket_events sperrt die Event-Zeile, sodass
 * gleichzeitige Bestätigungen das Kontingent nacheinander prüfen.
 */
export async function confirmOrder(id: string): Promise<'confirmed' | 'full' | 'invalid'> {
  const q = await db();
  const updated = await q(
    `WITH o AS (
       SELECT id, event_id, quantity FROM ticket_orders
       WHERE id = $1 AND status = 'pending' AND created_at > now() - interval '24 hours'
       FOR UPDATE
     ), e AS (
       UPDATE ticket_events ev SET taken = ev.taken + o.quantity
       FROM o
       WHERE ev.id = o.event_id AND ev.taken + o.quantity <= ev.capacity
       RETURNING ev.id
     )
     UPDATE ticket_orders SET status = 'confirmed', confirmed_at = now()
     WHERE id IN (SELECT id FROM o) AND EXISTS (SELECT 1 FROM e)
     RETURNING id`,
    [id],
  );
  if (updated.length) return 'confirmed';

  const order = await getOrder(id);
  if (order?.status === 'confirmed') return 'confirmed';
  if (order?.status === 'pending' && !order.expired) return 'full';
  return 'invalid';
}

/** Storniert eine Anmeldung und gibt ihre Plätze frei. Nicht mehr möglich, sobald ein Ticket eingecheckt ist. */
export async function cancelOrder(id: string): Promise<boolean> {
  const q = await db();
  const updated = await q(
    `WITH o AS (
       SELECT id, event_id, quantity, status FROM ticket_orders
       WHERE id = $1 AND status IN ('pending', 'confirmed')
         AND NOT EXISTS (SELECT 1 FROM tickets WHERE order_id = $1 AND checked_in_at IS NOT NULL)
       FOR UPDATE
     ), e AS (
       UPDATE ticket_events ev SET taken = ev.taken - o.quantity
       FROM o
       WHERE ev.id = o.event_id AND o.status = 'confirmed'
       RETURNING ev.id
     )
     UPDATE ticket_orders SET status = 'cancelled'
     WHERE id IN (SELECT id FROM o)
     RETURNING id`,
    [id],
  );
  return updated.length > 0;
}

// ---------------------------------------------------------------- Einlass

export type CheckInResult =
  | { result: 'ok'; name: string; code: string; position: number; quantity: number }
  | { result: 'already'; name: string; code: string; position: number; quantity: number; checkedInAt: string }
  | { result: 'not_confirmed'; name: string }
  | { result: 'wrong_event' }
  | { result: 'invalid' };

/** `input` ist entweder der Token aus dem QR-Code oder der Kurz-Code. */
export async function checkIn(eventId: string, input: string): Promise<CheckInResult> {
  const q = await db();
  const code = normalizeCode(input);

  // Gleichzeitige Scans desselben Tickets: der zweite wartet auf die
  // Zeilensperre, prüft `checked_in_at IS NULL` danach erneut und geht leer aus.
  const [hit] = await q<{ name: string; code: string; position: number; quantity: number }>(
    `UPDATE tickets t SET checked_in_at = now()
     FROM ticket_orders o
     WHERE o.id = t.order_id AND o.status = 'confirmed'
       AND t.event_id = $1 AND (t.token = $2 OR t.code = $3)
       AND t.checked_in_at IS NULL
     RETURNING o.name, t.code, t.position, o.quantity`,
    [eventId, input, code],
  );
  if (hit) return { result: 'ok', ...hit };

  const [known] = await q<{
    name: string; code: string; position: number; quantity: number;
    status: string; event_id: string; checked_in_at: unknown;
  }>(
    `SELECT o.name, t.code, t.position, o.quantity, o.status, t.event_id, t.checked_in_at
     FROM tickets t
     JOIN ticket_orders o ON o.id = t.order_id
     WHERE t.token = $2 OR (t.event_id = $1 AND t.code = $3)
     LIMIT 1`,
    [eventId, input, code],
  );
  if (!known) return { result: 'invalid' };
  if (known.event_id !== eventId) return { result: 'wrong_event' };
  if (known.status !== 'confirmed') return { result: 'not_confirmed', name: known.name };
  return {
    result: 'already',
    name: known.name,
    code: known.code,
    position: known.position,
    quantity: known.quantity,
    checkedInAt: toIso(known.checked_in_at)!,
  };
}

export async function undoCheckIn(eventId: string, code: string): Promise<boolean> {
  const q = await db();
  const rows = await q(
    'UPDATE tickets SET checked_in_at = NULL WHERE event_id = $1 AND code = $2 RETURNING code',
    [eventId, normalizeCode(code)],
  );
  return rows.length > 0;
}

export async function doorStats(eventId: string): Promise<{ total: number; checkedIn: number }> {
  const q = await db();
  const [row] = await q<{ total: number; checked_in: number }>(
    `SELECT count(*)::int AS total, count(t.checked_in_at)::int AS checked_in
     FROM tickets t
     JOIN ticket_orders o ON o.id = t.order_id
     WHERE t.event_id = $1 AND o.status = 'confirmed'`,
    [eventId],
  );
  return { total: row.total, checkedIn: row.checked_in };
}

export interface Guest {
  key: string; // nur zum Gruppieren – nicht der Ticket-Link
  name: string;
  tickets: { code: string; position: number; checkedInAt: string | null }[];
}

/** Gästeliste für den Einlass. Enthält bewusst weder Ticket-Links noch QR-Tokens. */
export async function guestList(eventId: string): Promise<Guest[]> {
  const q = await db();
  const rows = await q<{ key: string; name: string; code: string; position: number; checked_in_at: unknown }>(
    `SELECT md5(o.id) AS key, o.name, t.code, t.position, t.checked_in_at
     FROM ticket_orders o
     JOIN tickets t ON t.order_id = o.id
     WHERE o.event_id = $1 AND o.status = 'confirmed'
     ORDER BY lower(o.name), o.id, t.position`,
    [eventId],
  );

  const guests = new Map<string, Guest>();
  for (const r of rows) {
    const guest = guests.get(r.key) ?? { key: r.key, name: r.name, tickets: [] };
    guest.tickets.push({ code: r.code, position: r.position, checkedInAt: toIso(r.checked_in_at) });
    guests.set(r.key, guest);
  }
  return [...guests.values()];
}

// ---------------------------------------------------------------- Aufräumen

/**
 * Löscht alle Daten zu Events vor `cutoffDate` sowie unbestätigte und
 * stornierte Anmeldungen, die älter als eine Woche sind.
 */
export async function cleanup(cutoffDate: string): Promise<{ events: number; orders: number }> {
  const q = await db();
  const events = await q('DELETE FROM ticket_events WHERE event_date < $1 RETURNING id', [cutoffDate]);
  const orders = await q(
    `DELETE FROM ticket_orders
     WHERE status <> 'confirmed' AND created_at < now() - interval '7 days'
     RETURNING id`,
  );
  return { events: events.length, orders: orders.length };
}
