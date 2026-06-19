'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const payload = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
        setStatus('error');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      setStatus('error');
    }
  }

  return (
    <section
      id="newsletter"
      className="scroll-mt-[30vh] bg-black text-white px-8 md:px-16 py-20 md:py-32"
    >
      <div className="w-[95%] max-w-[1600px] mx-auto flex flex-col gap-10 md:gap-14">
        <header className="flex flex-col gap-4">
          <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-40">
            Newsletter
          </span>
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9]">
            Nichts verpassen.
          </h2>
          <p className="text-lg md:text-2xl font-bold opacity-70 max-w-2xl leading-snug">
            Konzerte, Sessions, Workshops – einmal im Monat per Mail. Kein Spam, jederzeit abbestellbar.
          </p>
        </header>

        {status === 'sent' ? (
          <div className="border-4 border-white/30 px-6 md:px-10 py-10 md:py-12 flex flex-col gap-3">
            <p className="text-3xl md:text-5xl font-black italic tracking-tighter">Fast geschafft!</p>
            <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">
              Wir haben dir eine Bestätigungsmail geschickt. Öffne den Link darin, um deine Anmeldung
              abzuschließen. Nichts angekommen? Schau auch im Spam-Ordner nach.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-0 md:items-end border-b-4 border-white/40 pb-2">
              <div className="flex flex-col gap-3 flex-1">
                <label htmlFor="newsletter-email" className="font-mono text-xs tracking-[0.2em] uppercase opacity-50">
                  Deine E-Mail
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="deine@email.de"
                  className="bg-transparent outline-none text-2xl md:text-4xl font-black placeholder:opacity-20 w-full"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="border-4 border-white px-8 py-4 text-xl md:text-2xl font-black italic hover:bg-white hover:text-black transition-all shrink-0 disabled:opacity-40"
              >
                {status === 'sending' ? 'Wird gesendet…' : 'Anmelden'}
              </button>
            </div>

            {/* Honeypot — hidden from humans, catches bots */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] w-px h-px opacity-0"
            />

            <div className="flex items-start gap-4 max-w-2xl">
              <input
                type="checkbox"
                required
                id="newsletter-privacy"
                name="privacy"
                className="mt-1 w-5 h-5 shrink-0 cursor-pointer accent-white"
              />
              <label htmlFor="newsletter-privacy" className="font-mono text-[10px] leading-relaxed opacity-50 cursor-pointer tracking-wide">
                Ich möchte den Newsletter abonnieren und stimme zu, dass meine E-Mail-Adresse gemäß der{' '}
                <a href="/datenschutz" className="underline hover:opacity-100">Datenschutzerklärung</a>{' '}
                verarbeitet wird. Ich kann mich jederzeit wieder abmelden.
              </label>
            </div>

            {status === 'error' && (
              <p className="font-mono text-xs text-red-400 tracking-widest uppercase">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
