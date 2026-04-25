'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const fieldClass = 'bg-transparent outline-none text-2xl md:text-3xl font-black placeholder:opacity-20 w-full';
const labelClass = 'font-mono text-[10px] tracking-[0.3em] uppercase opacity-40';

export function ProberaumForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const payload = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'Proberaum-Anfrage', ...payload }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (!open) {
    return (
      <div className="px-8 md:px-16 py-16 flex justify-start">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-4 border-black px-8 py-5 text-xl md:text-2xl font-black italic hover:bg-black hover:text-white transition-all"
        >
          Anfrageformular öffnen
        </button>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="px-8 md:px-16 py-24 flex flex-col gap-4">
        <p className="text-3xl md:text-5xl font-black italic tracking-tighter">Anfrage erhalten!</p>
        <p className="font-mono text-sm opacity-50 tracking-widest uppercase">Wir melden uns bald bei dir.</p>
      </div>
    );
  }

  return (
    <form className="px-8 md:px-16 py-10 flex flex-col gap-0" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-black">
        <div className="flex flex-col gap-3 py-8 md:py-10 md:pr-12 border-b-4 md:border-b-0 md:border-r-4 border-black">
          <span className={labelClass}>01 — Name *</span>
          <input name="name" type="text" required placeholder="Vor- und Nachname" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-3 py-8 md:py-10 md:pl-12">
          <span className={labelClass}>02 — E-Mail *</span>
          <input name="email" type="email" required placeholder="deine@email.de" className={fieldClass} />
        </div>
      </div>

      <div className="flex flex-col gap-3 py-8 md:py-10 border-b-4 border-black">
        <span className={labelClass}>03 — Betreff *</span>
        <input name="subject" type="text" required placeholder="Worum geht es?" className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-black">
        <div className="flex flex-col gap-3 py-8 md:py-10 md:pr-12 border-b-4 md:border-b-0 md:border-r-4 border-black">
          <span className={labelClass}>04 — Nutzungsart</span>
          <select name="usageType" className="bg-transparent outline-none text-2xl md:text-3xl font-black appearance-none cursor-pointer w-full">
            <option value="">Bitte wählen</option>
            <option>Bandprobe</option>
            <option>Unterricht</option>
            <option>Sonstiges</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 py-8 md:py-10 md:pl-12">
          <span className={labelClass}>05 — Anzahl Personen</span>
          <select name="personCount" className="bg-transparent outline-none text-2xl md:text-3xl font-black appearance-none cursor-pointer w-full">
            <option value="">Bitte wählen</option>
            <option>1–2</option>
            <option>3–5</option>
            <option>6–10</option>
            <option>10+</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 py-8 md:py-10 border-b-4 border-black">
        <span className={labelClass}>06 — Wunschtermin (Tag, Uhrzeit, Häufigkeit) *</span>
        <input name="schedule" type="text" required placeholder="z.B. Dienstags 18–21 Uhr, wöchentlich" className={fieldClass} />
      </div>

      <div className="flex flex-col gap-3 py-8 md:py-10 border-b-4 border-black">
        <span className={labelClass}>07 — Detaillierte Mietanfrage *</span>
        <textarea name="details" rows={3} required placeholder="Erzähl uns mehr über dein Projekt…"
          className="bg-transparent outline-none text-2xl md:text-3xl font-black placeholder:opacity-20 resize-none w-full" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-12 pb-16">
        <div className="flex items-start gap-4 max-w-lg">
          <input type="checkbox" required id="datenschutz-probe" name="privacy" className="mt-1 w-5 h-5 shrink-0 cursor-pointer accent-black" />
          <label htmlFor="datenschutz-probe" className="font-mono text-[10px] leading-relaxed opacity-50 cursor-pointer tracking-wide">
            Ich stimme zu, dass meine Angaben zur Beantwortung meiner Anfrage gemäß der{' '}
            <a href="/datenschutz" className="underline hover:opacity-100">Datenschutzerklärung</a>{' '}
            verarbeitet werden. Meine Einwilligung kann ich jederzeit per E-Mail widerrufen.
          </label>
        </div>
        <div className="flex flex-col items-end gap-3">
          {status === 'error' && (
            <p className="font-mono text-xs text-red-600 tracking-widest uppercase">Fehler beim Senden. Bitte erneut versuchen.</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="border-4 border-black px-8 py-5 text-xl md:text-2xl font-black italic hover:bg-black hover:text-white transition-all shrink-0 disabled:opacity-40"
          >
            {status === 'sending' ? 'Wird gesendet…' : 'Anfrage senden'}
          </button>
        </div>
      </div>
    </form>
  );
}
