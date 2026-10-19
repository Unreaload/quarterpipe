import crypto from 'crypto';
import { cookies } from 'next/headers';

// Zugang zum Einlass-Scanner. Jedes Event hat eine eigene 6-stellige PIN, die
// aus TICKETS_SECRET abgeleitet wird (steht auf der Mitgliederseite). Nach der
// Eingabe bekommt das Gerät ein signiertes Cookie, das nur für dieses eine
// Event und 24 Stunden gilt.

export const DOOR_COOKIE = 'qp_einlass';
const SESSION_MS = 24 * 60 * 60 * 1000;

function hmac(data: string): Buffer {
  const secret = process.env.TICKETS_SECRET;
  if (!secret) throw new Error('TICKETS_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(data).digest();
}

export function doorPin(eventId: string): string {
  return String(hmac(`einlass-pin:${eventId}`).readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

export function createDoorSession(eventId: string): string {
  const exp = Date.now() + SESSION_MS;
  const sig = hmac(`einlass-session:${eventId}:${exp}`).toString('base64url');
  return `${exp}.${sig}.${eventId}`;
}

/** Event-ID aus einem gültigen Cookie-Wert, sonst null. */
export function verifyDoorSession(value: string | undefined): string | null {
  if (!value || !process.env.TICKETS_SECRET) return null;
  const [expStr, sig, ...rest] = value.split('.');
  const eventId = rest.join('.');
  const exp = Number(expStr);
  if (!eventId || !sig || !Number.isFinite(exp) || Date.now() > exp) return null;

  const expected = hmac(`einlass-session:${eventId}:${exp}`);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return eventId;
}

/** Event-ID der Einlass-Sitzung dieses Geräts, sonst null. */
export async function currentDoorEvent(): Promise<string | null> {
  const store = await cookies();
  return verifyDoorSession(store.get(DOOR_COOKIE)?.value);
}
