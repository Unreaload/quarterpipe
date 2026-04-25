'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/mitglieder';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mitglieder/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler');
        setLoading(false);
      }
    } catch {
      setError('Netzwerkfehler');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md">
      <label className="flex flex-col gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40">
          Passwort
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="bg-transparent outline-none text-2xl md:text-3xl font-black border-b-4 border-black pb-2"
        />
      </label>
      {error && (
        <p className="font-mono text-xs text-red-600 tracking-widest uppercase">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="self-start border-4 border-black px-8 py-5 text-xl md:text-2xl font-black italic hover:bg-black hover:text-white transition-all disabled:opacity-40"
      >
        {loading ? 'Prüfe…' : 'Einloggen'}
      </button>
    </form>
  );
}

export default function MitgliederLogin() {
  return (
    <main className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="bg-black text-white px-8 md:px-20 py-12 md:py-16 border-b-[16px] border-white">
        <a
          href="/"
          className="font-mono text-[10px] tracking-[0.4em] uppercase opacity-50 hover:opacity-100 transition-opacity inline-block mb-8"
        >
          ← Zurück
        </a>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
          Mitglieder
        </h1>
      </header>

      <div className="w-[95%] max-w-[800px] mx-auto py-20 md:py-32">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
