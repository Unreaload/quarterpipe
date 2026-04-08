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

  const data = await request.json() as Record<string, string>;

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

  const { formType, name, email, subject, ...rest } = data;

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
