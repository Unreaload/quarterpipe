import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createToken, isValidEmail, getBaseUrl } from '../../../lib/newsletter';

const rateLimit = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) ?? [];
  const recent = timestamps.filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields, humans don't. Pretend success, send nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass || !process.env.NEWSLETTER_SECRET) {
    console.error('Newsletter not configured. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, NEWSLETTER_SECRET');
    return NextResponse.json({ error: 'Server not configured for newsletter' }, { status: 503 });
  }

  const { exp, token } = createToken(email);
  const confirmUrl = `${getBaseUrl(request)}/newsletter/bestaetigt?email=${encodeURIComponent(email)}&exp=${exp}&token=${encodeURIComponent(token)}`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser, pass: smtpPass },
    tls: { servername: process.env.SMTP_TLS_SERVERNAME || undefined },
  });

  const text = [
    'Fast geschafft!',
    '',
    'Bestätige deine Anmeldung zum Quarterpipe-Newsletter, indem du diesen Link öffnest:',
    '',
    confirmUrl,
    '',
    'Der Link ist 24 Stunden gültig.',
    '',
    'Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – ohne Bestätigung passiert nichts.',
    '',
    'Quarterpipe // Versmannstraße 66 // 20457 Hamburg',
  ].join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `Quarterpipe <${smtpUser}>`,
      to: email,
      subject: 'Bestätige deine Newsletter-Anmeldung',
      text,
      html: confirmationEmailHtml(confirmUrl),
    });
  } catch (err) {
    console.error('Newsletter confirmation mail failed:', err);
    return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function confirmationEmailHtml(confirmUrl: string): string {
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border:3px solid #000;">
        <tr><td style="background:#000;color:#fff;padding:28px 28px;font-family:'Arial Black',Helvetica,Arial,sans-serif;font-weight:900;font-style:italic;font-size:34px;letter-spacing:-1px;">
          QUARTERPIPE
        </td></tr>
        <tr><td style="padding:32px 28px;font-family:Helvetica,Arial,sans-serif;color:#000;">
          <p style="margin:0 0 8px;font-size:24px;font-weight:900;font-style:italic;letter-spacing:-0.5px;">Fast geschafft.</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">Bestätige deine Anmeldung zum Newsletter mit einem Klick:</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#000;">
            <a href="${confirmUrl}" style="display:inline-block;padding:16px 28px;font-family:'Arial Black',Helvetica,Arial,sans-serif;font-weight:900;font-style:italic;font-size:18px;color:#fff;text-decoration:none;border:3px solid #000;">
              ANMELDUNG BESTÄTIGEN →
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#666;">Der Link ist 24 Stunden gültig. Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – ohne Bestätigung passiert nichts.</p>
        </td></tr>
        <tr><td style="border-top:3px solid #000;padding:16px 28px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">
          Versmannstraße 66 // 20457 Hamburg
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
