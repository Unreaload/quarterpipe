'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function RegistrationForm({ eventId, maxQuantity }: { eventId: string; maxQuantity: number }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const payload = { ...Object.fromEntries(new FormData(e.currentTarget)), eventId };
    try {
      const res = await fetch('/api/tickets/register', {
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

  if (status === 'sent') {
    return (
      <div className="border-4 border-black px-6 md:px-10 py-10 md:py-12 flex flex-col gap-3">
        <p className="text-3xl md:text-5xl font-black italic tracking-tighter">Check deine Mails!</p>
        <p className="font-mono text-sm opacity-60 tracking-wide leading-relaxed max-w-xl">
          Wir haben dir einen Link geschickt. Öffne ihn innerhalb von 24 Stunden und bestätige deine
          Anmeldung – dort findest du dann auch deine Tickets. Nichts angekommen? Schau im Spam-Ordner nach.
        </p>
      </div>
    );
  }

  const field = 'bg-transparent outline-none text-2xl md:text-3xl font-black border-b-4 border-black pb-2 placeholder:opacity-20 w-full';
  const label = 'font-mono text-[10px] tracking-[0.3em] uppercase opacity-40';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <label className="flex flex-col gap-3">
        <span className={label}>Name</span>
        <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} placeholder="Vor- und Nachname" />
      </label>

      <label className="flex flex-col gap-3">
        <span className={label}>E-Mail</span>
        <input name="email" type="email" required autoComplete="email" className={field} placeholder="deine@email.de" />
      </label>

      <label className="flex flex-col gap-3">
        <span className={label}>Personen</span>
        <select name="quantity" defaultValue="1" className={`${field} cursor-pointer`}>
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n === 1 ? '1 Person' : `${n} Personen`}</option>
          ))}
        </select>
      </label>

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
          id="anmeldung-privacy"
          name="privacy"
          className="mt-1 w-5 h-5 shrink-0 cursor-pointer accent-black"
        />
        <label htmlFor="anmeldung-privacy" className="font-mono text-[10px] leading-relaxed opacity-60 cursor-pointer tracking-wide">
          Ich bin einverstanden, dass Name und E-Mail-Adresse für Anmeldung und Einlass gemäß der{' '}
          <a href="/datenschutz" className="underline hover:opacity-100">Datenschutzerklärung</a>{' '}
          gespeichert und 30 Tage nach dem Event gelöscht werden.
        </label>
      </div>

      {status === 'error' && (
        <p className="font-mono text-xs text-red-600 tracking-widest uppercase">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="self-start border-4 border-black px-8 py-5 text-xl md:text-2xl font-black italic hover:bg-black hover:text-white transition-all disabled:opacity-40"
      >
        {status === 'sending' ? 'Wird gesendet…' : 'Anmelden'}
      </button>
    </form>
  );
}
