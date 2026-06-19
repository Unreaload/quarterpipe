import Link from 'next/link';
import { verifyToken, isValidEmail, addToBrevoList } from '../../lib/newsletter';

export const metadata = {
  title: 'Newsletter-Anmeldung bestätigt – Quarterpipe',
  robots: { index: false },
};

type SearchParams = Promise<{ email?: string; exp?: string; token?: string }>;

type Result = 'confirmed' | 'invalid' | 'error';

async function confirm(params: Awaited<SearchParams>): Promise<Result> {
  const email = (params.email ?? '').trim().toLowerCase();
  const exp = Number(params.exp);
  const token = params.token ?? '';

  if (!isValidEmail(email) || !verifyToken(email, exp, token)) {
    return 'invalid';
  }

  try {
    await addToBrevoList(email);
    return 'confirmed';
  } catch (err) {
    console.error('Brevo subscription failed:', err);
    return 'error';
  }
}

export default async function NewsletterConfirmPage({ searchParams }: { searchParams: SearchParams }) {
  const result = await confirm(await searchParams);

  const content = {
    confirmed: {
      tag: 'Newsletter // Anmeldung bestätigt',
      title: 'Du bist dabei.',
      body: 'Deine Anmeldung ist bestätigt. Wir melden uns mit Konzerten, Sessions und allem, was in der Quarterpipe passiert.',
    },
    invalid: {
      tag: 'Newsletter // Link ungültig',
      title: 'Link abgelaufen.',
      body: 'Dieser Bestätigungslink ist ungültig oder älter als 24 Stunden. Melde dich auf der Startseite einfach noch einmal an.',
    },
    error: {
      tag: 'Newsletter // Fehler',
      title: 'Hat nicht geklappt.',
      body: 'Bei der Bestätigung ist etwas schiefgelaufen. Bitte versuche es später noch einmal oder melde dich erneut an.',
    },
  }[result];

  return (
    <main className="w-full min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center selection:bg-white selection:text-black px-8">
      <p className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-40 mb-6 text-center">
        {content.tag}
      </p>
      <h1 className="text-6xl md:text-[9rem] font-black italic tracking-tighter leading-none text-center mb-8">
        {content.title}
      </h1>
      <p className="max-w-xl text-center text-lg md:text-xl font-bold opacity-70 leading-snug mb-12">
        {content.body}
      </p>
      <Link
        href="/"
        className="border-2 border-white px-8 py-4 font-black italic text-lg hover:bg-white hover:text-black transition-all"
      >
        Zurück zur Startseite
      </Link>
    </main>
  );
}
