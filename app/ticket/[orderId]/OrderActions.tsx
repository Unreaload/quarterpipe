'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function useOrderAction(path: string, orderId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderId }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    }
    setLoading(false);
  }

  return { run, loading, error };
}

export function ConfirmButton({ orderId }: { orderId: string }) {
  const { run, loading, error } = useOrderAction('/api/tickets/confirm', orderId);
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={run}
        disabled={loading}
        className="self-start bg-black text-white border-4 border-black px-8 py-5 text-xl md:text-2xl font-black italic hover:bg-white hover:text-black transition-all disabled:opacity-40"
      >
        {loading ? 'Bestätige…' : 'Anmeldung bestätigen'}
      </button>
      {error && <p className="font-mono text-xs text-red-600 tracking-widest uppercase">{error}</p>}
    </div>
  );
}

export function CancelButton({ orderId }: { orderId: string }) {
  const { run, loading, error } = useOrderAction('/api/tickets/cancel', orderId);
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => {
          if (confirm('Anmeldung wirklich absagen? Deine Tickets werden damit ungültig.')) run();
        }}
        disabled={loading}
        className="self-start border-4 border-black px-6 py-3 text-lg font-black italic hover:bg-black hover:text-white transition-all disabled:opacity-40"
      >
        {loading ? 'Sage ab…' : 'Absagen'}
      </button>
      {error && <p className="font-mono text-xs text-red-600 tracking-widest uppercase">{error}</p>}
    </div>
  );
}
