'use client';

import { useEffect, useState } from 'react';
import type { FrameSlide } from './slides';
import { HighlightSlide, ProgramSlide } from './EventSlides';

const VERSION_POLL_MS = 60_000;
// Nach einem kompletten Durchlauf neu laden, wenn die Seite älter ist – holt frische Teamup-Daten.
const DATA_REFRESH_MS = 30 * 60_000;
// Sicherheitsnetz, falls ein Video ohne duration hängt und nie "ended" feuert.
const MAX_VIDEO_MS = 10 * 60_000;

// Gibt den Video-Decoder beim Slide-Wechsel sofort frei (wichtig bei Tagen Laufzeit auf dem Pi).
function releaseVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  return () => {
    // Erst nach dem Commit prüfen: StrictMode hängt Refs testweise ab, ohne das Element zu entfernen.
    queueMicrotask(() => {
      if (el.isConnected) return;
      el.removeAttribute('src');
      el.load();
    });
  };
}

// Scrollbar der eingebetteten Seite ausblenden (nur same-origin möglich).
function hideScrollbar(e: React.SyntheticEvent<HTMLIFrameElement>) {
  const root = e.currentTarget.contentDocument?.documentElement;
  if (root) root.style.scrollbarWidth = 'none';
}

export default function FrameSlideshow({
  items,
  defaultDuration,
  version,
}: {
  items: FrameSlide[];
  defaultDuration: number;
  version: string;
}) {
  // Laufender Zähler statt Index, damit sich der key auch bei nur einem Eintrag ändert.
  const [step, setStep] = useState(0);
  const count = items.length;
  const item = count > 0 ? items[step % count] : undefined;
  const advance = () => setStep((s) => s + 1);

  useEffect(() => {
    if (!item || count === 1) return;
    const ms =
      item.type === 'video' && !item.duration
        ? MAX_VIDEO_MS
        : (item.duration ?? defaultDuration) * 1000;
    const id = setTimeout(() => setStep((s) => s + 1), ms);
    return () => clearTimeout(id);
  }, [step, item, count, defaultDuration]);

  // Nächstes Bild bzw. nächsten Flyer vorladen
  useEffect(() => {
    if (count < 2) return;
    const upcoming = items[(step + 1) % count];
    if (upcoming.type === 'image') new Image().src = upcoming.src;
    if (upcoming.type === 'highlight' && upcoming.event.imageUrl) new Image().src = upcoming.event.imageUrl;
  }, [step, items, count]);

  // Durchlauf beendet und Daten alt → neu laden, aber nur wenn der Server erreichbar ist
  // (ein Reload ohne Netz bliebe auf Chromiums Fehlerseite hängen).
  useEffect(() => {
    if (step === 0 || step % count !== 0 || performance.now() < DATA_REFRESH_MS) return;
    fetch(location.href, { method: 'HEAD', cache: 'no-store' })
      .then((res) => res.ok && location.reload())
      .catch(() => {
        /* offline: weiterlaufen */
      });
  }, [step, count]);

  // Neuer Deploy → Reload
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/frame-version', { cache: 'no-store' });
        if (!res.ok) return;
        const { version: live } = await res.json();
        if (live && live !== version) location.reload();
      } catch {
        /* offline: weiterlaufen */
      }
    }, VERSION_POLL_MS);
    return () => clearInterval(id);
  }, [version]);

  return (
    <div className="frame-stage" style={styles.stage}>
      {item && (
        <div key={step} style={styles.slide}>
          {item.type === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt="" style={styles.media} onError={advance} />
          )}
          {item.type === 'video' && (
            <video
              ref={releaseVideo}
              src={item.src}
              style={styles.media}
              autoPlay
              muted
              playsInline
              loop={count === 1 || !!item.duration}
              onEnded={advance}
              onError={advance}
            />
          )}
          {item.type === 'page' && (
            <iframe src={item.src} title="" style={styles.iframe} onLoad={hideScrollbar} />
          )}
          {item.type === 'text' && <p style={styles.text}>{item.text}</p>}
          {item.type === 'program' && <ProgramSlide {...item} />}
          {item.type === 'highlight' && <HighlightSlide event={item.event} today={item.today} />}
        </div>
      )}
      <style>{`
        @keyframes frameFade { from { opacity: 0 } to { opacity: 1 } }
        html, body { cursor: none; overflow: hidden; background: #000; }
        body::before { display: none; }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  stage: { position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' },
  slide: {
    position: 'absolute',
    inset: 0,
    // Flex statt Grid: nur so greift height: 100% und Hochkant-Medien werden eingepasst statt beschnitten
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'frameFade 800ms ease',
  },
  // filter/mixBlendMode heben den Xerox-Look aus globals.css auf (multiply auf Schwarz = schwarzes Bild)
  media: { width: '100%', height: '100%', objectFit: 'contain', filter: 'none', mixBlendMode: 'normal' },
  // pointer-events: none hält den Cursor auch über dem iframe unsichtbar
  iframe: { width: '100%', height: '100%', border: 0, background: '#fff', pointerEvents: 'none' },
  text: {
    color: '#fff',
    fontFamily: 'var(--font-anton), sans-serif',
    fontSize: '6vw',
    lineHeight: 1.15,
    textAlign: 'center',
    whiteSpace: 'pre-line',
    padding: '0 8vw',
    margin: 0,
  },
};
