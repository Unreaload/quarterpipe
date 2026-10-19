'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type QrScannerType from 'qr-scanner';
import type { CheckInResult, Guest } from '../lib/tickets/store';

type Stats = { total: number; checkedIn: number };
type Feedback = { tone: 'ok' | 'bad'; title: string; detail?: string };
type CheckInBody = { input: string } | { undo: string };

// ---------------------------------------------------------------- Ton & Vibration

// Der AudioContext darf erst nach einer Nutzeraktion starten (Kamera-Knopf,
// Code-Eingabe), danach piept jeder Scan.
let audio: AudioContext | null = null;

function unlockAudio() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    // kein Ton, Vibration und Farbe reichen auch
  }
}

function signal(ok: boolean) {
  navigator.vibrate?.(ok ? 80 : [200, 100, 200]);
  if (!audio) return;
  const ctx = audio;
  const tone = (freq: number, at: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + duration);
  };
  if (ok) tone(1320, 0, 0.12);
  else {
    tone(220, 0, 0.18);
    tone(220, 0.25, 0.18);
  }
}

// ---------------------------------------------------------------- Texte

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}

function describe(r: CheckInResult): Feedback {
  switch (r.result) {
    case 'ok':
      return { tone: 'ok', title: 'Rein ✓', detail: `${r.name} · Ticket ${r.position}/${r.quantity} · QP-${r.code}` };
    case 'already':
      return { tone: 'bad', title: 'Schon drin', detail: `${r.name} · QP-${r.code} · seit ${clock(r.checkedInAt)} Uhr` };
    case 'not_confirmed':
      return { tone: 'bad', title: 'Nicht gültig', detail: `${r.name} · Anmeldung nicht bestätigt oder abgesagt` };
    case 'wrong_event':
      return { tone: 'bad', title: 'Falsches Event', detail: 'Das Ticket gilt für eine andere Veranstaltung' };
    default:
      return { tone: 'bad', title: 'Unbekannt', detail: 'Kein Ticket von uns' };
  }
}

// ---------------------------------------------------------------- App

export function DoorApp({
  title,
  when,
  initialGuests,
  initialStats,
}: {
  title: string;
  when: string;
  initialGuests: Guest[];
  initialStats: Stats;
}) {
  const [tab, setTab] = useState<'scan' | 'list'>('scan');
  const [stats, setStats] = useState<Stats>(initialStats);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((f: Feedback) => {
    setFeedback(f);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), f.tone === 'ok' ? 3000 : 6000);
  }, []);

  const loadGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/einlass/guests', { cache: 'no-store' });
      if (res.status === 401) return location.reload();
      if (!res.ok) return;
      const data = await res.json();
      setGuests(data.guests);
      setStats(data.stats);
    } catch {
      // nächster Versuch beim nächsten Intervall
    }
  }, []);

  // Mehrere Geräte am Einlass: die Liste regelmäßig nachladen.
  useEffect(() => {
    if (tab !== 'list') return;
    const id = setInterval(loadGuests, 15_000);
    return () => clearInterval(id);
  }, [tab, loadGuests]);

  const submit = useCallback(async (body: CheckInBody) => {
    try {
      const res = await fetch('/api/einlass/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 401) return location.reload();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        signal(false);
        show({ tone: 'bad', title: 'Fehler', detail: data.error ?? 'Bitte nochmal versuchen' });
        return;
      }
      if (data.stats) setStats(data.stats);
      if ('undo' in body) {
        show({ tone: 'ok', title: 'Zurückgenommen', detail: `QP-${body.undo} ist wieder offen` });
      } else {
        const f = describe(data as CheckInResult);
        signal(f.tone === 'ok');
        show(f);
      }
    } catch {
      signal(false);
      show({ tone: 'bad', title: 'Kein Netz', detail: 'Bitte nochmal scannen' });
    }
  }, [show]);

  return (
    <main className="w-full min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="px-4 pt-5 pb-4 border-b-4 border-white/20 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50 truncate">Einlass // {when}</p>
          <h1 className="text-2xl font-black italic tracking-tighter leading-tight truncate">{title}</h1>
        </div>
        <div className="text-right shrink-0">
          <p className="text-4xl font-black tabular-nums leading-none">
            {stats.checkedIn}
            <span className="opacity-40">/{stats.total}</span>
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">drin</p>
        </div>
      </header>

      <nav className="grid grid-cols-2 border-b-4 border-white/20">
        {(['scan', 'list'] as const).map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === 'list') void loadGuests();
            }}
            className={`py-3 font-black italic text-lg ${tab === t ? 'bg-white text-black' : 'opacity-60'}`}
          >
            {t === 'scan' ? 'Scannen' : 'Gästeliste'}
          </button>
        ))}
      </nav>

      {feedback && (
        <div
          role="status"
          className={`px-4 py-5 ${feedback.tone === 'ok' ? 'bg-green-600' : 'bg-red-600'} text-white`}
        >
          <p className="text-4xl font-black italic tracking-tighter uppercase leading-none">{feedback.title}</p>
          {feedback.detail && <p className="font-mono text-sm mt-2 leading-snug">{feedback.detail}</p>}
        </div>
      )}

      <div className="flex-1 px-4 py-6">
        {/* Scanner bleibt gemountet, damit die Kamera beim Tab-Wechsel nicht neu startet */}
        <div className={tab === 'scan' ? 'flex flex-col gap-6' : 'hidden'}>
          <Scanner onCode={data => submit({ input: data })} />
          <ManualEntry onSubmit={code => submit({ input: code })} />
        </div>
        {tab === 'list' && (
          <GuestList
            guests={guests}
            onCheckIn={async code => { await submit({ input: code }); await loadGuests(); }}
            onUndo={async code => { await submit({ undo: code }); await loadGuests(); }}
          />
        )}
      </div>

      <form action="/api/einlass/logout" method="POST" className="px-4 pb-8">
        <button type="submit" className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-40 hover:opacity-100">
          Ausloggen
        </button>
      </form>
    </main>
  );
}

// ---------------------------------------------------------------- Kamera

function Scanner({ onCode }: { onCode: (data: string) => Promise<void> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const onCodeRef = useRef(onCode);
  const busy = useRef(false);
  const last = useRef({ data: '', at: 0 });
  const [state, setState] = useState<'idle' | 'starting' | 'running' | 'error'>('idle');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    onCodeRef.current = onCode;
  });

  useEffect(() => () => scannerRef.current?.destroy(), []);

  async function start() {
    unlockAudio();
    setState('starting');
    try {
      const { default: QrScanner } = await import('qr-scanner');
      const scanner = new QrScanner(
        videoRef.current!,
        async result => {
          // Derselbe Code hält oft noch Sekunden vor der Kamera – nicht als
          // "schon drin" melden. Während eine Prüfung läuft, nichts Neues annehmen.
          const now = Date.now();
          if (busy.current) return;
          if (result.data === last.current.data && now - last.current.at < 10_000) return;
          last.current = { data: result.data, at: now };
          busy.current = true;
          try {
            await onCodeRef.current(result.data);
          } finally {
            busy.current = false;
          }
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 8,
          returnDetailedScanResult: true,
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setHasFlash(await scanner.hasFlash());
      setState('running');
    } catch (err) {
      console.error('Camera start failed:', err);
      scannerRef.current?.destroy();
      scannerRef.current = null;
      setState('error');
    }
  }

  async function toggleFlash() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    await scanner.toggleFlash();
    setFlashOn(scanner.isFlashOn());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square bg-white/5 overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {state !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            {state === 'error' && (
              <p className="font-mono text-xs tracking-wide opacity-70 leading-relaxed">
                Kamera nicht verfügbar. Kamera-Zugriff für diese Seite erlauben – oder Code eintippen bzw. die Gästeliste nutzen.
              </p>
            )}
            <button
              onClick={start}
              disabled={state === 'starting'}
              className="border-4 border-white px-8 py-5 text-xl font-black italic hover:bg-white hover:text-black transition-all disabled:opacity-40"
            >
              {state === 'starting' ? 'Starte…' : 'Kamera starten'}
            </button>
          </div>
        )}
      </div>
      {state === 'running' && hasFlash && (
        <button
          onClick={toggleFlash}
          className={`self-start border-4 border-white px-5 py-3 font-black italic ${flashOn ? 'bg-white text-black' : ''}`}
        >
          Licht {flashOn ? 'aus' : 'an'}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Code eintippen

function ManualEntry({ onSubmit }: { onSubmit: (code: string) => Promise<void> }) {
  const [code, setCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    unlockAudio();
    await onSubmit(code);
    setCode('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4 border-b-4 border-white/40 pb-2">
      <label className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">Code eintippen</span>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="QP-7K3M"
          autoCapitalize="characters"
          autoComplete="off"
          className="bg-transparent outline-none text-3xl font-black uppercase tracking-[0.15em] placeholder:opacity-20 w-full"
        />
      </label>
      <button type="submit" className="border-4 border-white px-5 py-3 font-black italic shrink-0">
        Prüfen
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- Gästeliste

function GuestList({
  guests,
  onCheckIn,
  onUndo,
}: {
  guests: Guest[];
  onCheckIn: (code: string) => Promise<void>;
  onUndo: (code: string) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const codeQuery = q.toUpperCase().replace(/^QP[-\s]*/, '');
  const filtered = q
    ? guests.filter(g => g.name.toLowerCase().includes(q) || g.tickets.some(t => t.code.includes(codeQuery)))
    : guests;

  return (
    <div className="flex flex-col gap-6">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Name oder Code suchen"
        className="bg-transparent outline-none text-2xl font-black border-b-4 border-white/40 pb-2 placeholder:opacity-30 w-full"
      />
      {filtered.length === 0 && (
        <p className="font-mono text-xs tracking-widest uppercase opacity-50">
          {guests.length === 0 ? 'Noch keine bestätigten Anmeldungen.' : 'Niemand gefunden.'}
        </p>
      )}
      <ul className="flex flex-col">
        {filtered.map(g => (
          <li key={g.key} className="border-t-2 border-white/15 py-4 flex flex-col gap-3">
            <span className="text-xl font-black leading-tight break-words">{g.name}</span>
            <div className="flex flex-wrap gap-2">
              {g.tickets.map(t => (
                <button
                  key={t.code}
                  onClick={() => {
                    if (!t.checkedInAt) void onCheckIn(t.code);
                    else if (confirm(`Check-in von QP-${t.code} zurücknehmen?`)) void onUndo(t.code);
                  }}
                  className={`font-mono text-sm px-3 py-2 border-2 ${t.checkedInAt ? 'border-green-500 text-green-400' : 'border-white'}`}
                >
                  QP-{t.code} · {t.checkedInAt ? `✓ ${clock(t.checkedInAt)}` : 'Rein'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
