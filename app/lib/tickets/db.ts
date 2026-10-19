import { neon } from '@neondatabase/serverless';

// Alle Statements sind einzelne SQL-Anweisungen ohne offene Transaktion, damit
// sie über Neons HTTP-Treiber laufen. Wo zwei Tabellen zusammen geändert
// werden, passiert das in einem Statement mit CTEs (atomar).

export type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ticket_events (
    id         text PRIMARY KEY,           -- Teamup-Event-ID
    title      text NOT NULL,
    event_date text NOT NULL,              -- YYYY-MM-DD (Berlin)
    event_time text NOT NULL DEFAULT '',   -- HH:MM oder ''
    capacity   integer NOT NULL,
    taken      integer NOT NULL DEFAULT 0  -- Plätze aus bestätigten Anmeldungen
  )`,
  `CREATE TABLE IF NOT EXISTS ticket_orders (
    id           text PRIMARY KEY,         -- zufällig, steckt im Ticket-Link
    event_id     text NOT NULL REFERENCES ticket_events(id) ON DELETE CASCADE,
    name         text NOT NULL,
    email        text NOT NULL,
    quantity     integer NOT NULL,
    status       text NOT NULL DEFAULT 'pending', -- pending | confirmed | cancelled
    created_at   timestamptz NOT NULL DEFAULT now(),
    confirmed_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS ticket_orders_event_email ON ticket_orders (event_id, email)`,
  `CREATE TABLE IF NOT EXISTS tickets (
    token         text PRIMARY KEY,        -- steckt im QR-Code
    code          text NOT NULL,           -- kurzer Code zum Eintippen am Einlass
    order_id      text NOT NULL REFERENCES ticket_orders(id) ON DELETE CASCADE,
    event_id      text NOT NULL,
    position      integer NOT NULL,        -- Ticket 1, 2, … innerhalb der Anmeldung
    checked_in_at timestamptz,
    UNIQUE (event_id, code)
  )`,
];

async function connect(): Promise<Query> {
  let query: Query;
  const url = process.env.DATABASE_URL;

  if (url) {
    const sql = neon(url);
    query = (text, params = []) => sql.query(text, params) as never;
  } else if (process.env.NODE_ENV !== 'production') {
    // Lokal ohne Datenbank-Account: eingebettetes Postgres unter .data/pglite.
    // Der Import ist absichtlich nicht statisch, damit PGlite nicht ins
    // Production-Bundle wandert.
    const specifier = '@electric-sql/pglite';
    const { PGlite } = await import(/* webpackIgnore: true */ specifier);
    const { mkdirSync } = await import('fs');
    mkdirSync('.data', { recursive: true });
    const db = new PGlite('.data/pglite');
    query = async (text, params = []) => (await db.query(text, params)).rows as never;
  } else {
    throw new Error('DATABASE_URL is not set');
  }

  for (const statement of SCHEMA) await query(statement);
  return query;
}

// Auf globalThis, damit Next im Dev-Modus beim Hot Reload keine zweite
// Verbindung (bzw. zweite PGlite-Instanz auf demselben Ordner) öffnet.
const globalForDb = globalThis as { ticketDb?: Promise<Query> };

export function db(): Promise<Query> {
  if (!globalForDb.ticketDb) {
    globalForDb.ticketDb = connect().catch(err => {
      globalForDb.ticketDb = undefined;
      throw err;
    });
  }
  return globalForDb.ticketDb;
}
