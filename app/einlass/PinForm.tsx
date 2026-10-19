'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PinForm() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/einlass/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Fehler');
    } catch {
      setError('Netzwerkfehler');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md">
      <label className="flex flex-col gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">
          Einlass-PIN (steht auf der Mitgliederseite)
        </span>
        <input
          value={pin}
          onChange={e => setPin(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          required
          className="bg-transparent outline-none text-5xl font-black tracking-[0.3em] border-b-4 border-white pb-2 tabular-nums"
        />
      </label>
      {error && <p className="font-mono text-xs text-red-400 tracking-widest uppercase">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start border-4 border-white px-8 py-5 text-xl font-black italic hover:bg-white hover:text-black transition-all disabled:opacity-40"
      >
        {loading ? 'Prüfe…' : 'Los'}
      </button>
    </form>
  );
}
