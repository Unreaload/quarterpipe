import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const sanitize = (s: unknown): string =>
    String(s ?? '').slice(0, 1000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Sanitize all values
  for (const key of Object.keys(data)) {
    data[key] = sanitize(data[key]);
  }

  // Validate required fields
  const { name, email, subject } = data;
  if (!name || !email || !subject) {
    return NextResponse.json({ error: 'Name, E-Mail und Betreff sind erforderlich.' }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !contactEmail) {
    console.error('Missing SMTP env vars. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_EMAIL');
    return NextResponse.json({ error: 'Server not configured for email' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const { formType, ...rest } = data;

  const fields = Object.entries(rest)
    .filter(([key, val]) => key !== 'privacy' && val)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');

  const text = [
    `Neue ${formType ?? 'Anfrage'} von quarterpipe.de`,
    '',
    `Name:    ${name}`,
    `E-Mail:  ${email}`,
    `Betreff: ${subject}`,
    '',
    fields,
  ].join('\n');

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `Quarterpipe Website <${smtpUser}>`,
    to: contactEmail,
    replyTo: email,
    subject: `[Quarterpipe] ${formType ?? 'Anfrage'}: ${subject}`,
    text,
  });

  return NextResponse.json({ ok: true });
}
