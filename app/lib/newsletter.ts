import crypto from 'crypto';

// Double-opt-in tokens are stateless: the confirmation link carries the email,
// an expiry timestamp and an HMAC signature over both. No database needed —
// the signature proves the link came from us and hasn't been tampered with.

const TTL_MS = 24 * 60 * 60 * 1000; // links are valid for 24h

function getSecret(): string {
  const secret = process.env.NEWSLETTER_SECRET;
  if (!secret) throw new Error('NEWSLETTER_SECRET is not set');
  return secret;
}

function sign(email: string, exp: number): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(`${email.toLowerCase()}:${exp}`)
    .digest('base64url');
}

/** Create a signed confirmation token for an email. */
export function createToken(email: string): { exp: number; token: string } {
  const exp = Date.now() + TTL_MS;
  return { exp, token: sign(email, exp) };
}

/** Verify a confirmation token. Returns true only if the signature matches and the link hasn't expired. */
export function verifyToken(email: string, exp: number, token: string): boolean {
  if (!process.env.NEWSLETTER_SECRET) return false;
  if (!email || !Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = sign(email, exp);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email);
}

/** Build the absolute origin (https://host) from an incoming request, with sensible fallbacks. */
export function getBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : 'https://quarterpipe.de';
}

/**
 * Add a confirmed subscriber to the Brevo list.
 * updateEnabled lets it re-add an existing contact to the list idempotently.
 * Throws if Brevo is not configured or rejects the request.
 */
export async function addToBrevoList(email: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    throw new Error('Brevo not configured (BREVO_API_KEY / BREVO_LIST_ID missing)');
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      listIds: [Number(listId)],
      updateEnabled: true,
    }),
  });

  // 201 = created, 204 = updated. Anything else is an error.
  if (res.status !== 201 && res.status !== 204) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo responded ${res.status}: ${body}`);
  }
}
