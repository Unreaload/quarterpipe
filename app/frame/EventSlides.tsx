import { useLayoutEffect, useRef } from 'react';
import type { FrameEvent } from './slides';

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
// Quer: ab dieser Anzahl zweispaltig; mehr als das Doppelte passt nicht auf den Screen.
// Hochkant: immer einspaltig, gleiche Maximalzahl.
const ROWS_PER_COLUMN = 7;
const MAX_ROWS = ROWS_PER_COLUMN * 2;

function parts(date: string) {
  const d = new Date(date + 'T12:00:00Z');
  return { weekday: WEEKDAYS[d.getUTCDay()], day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] };
}

// Verkleinert die Schrift (--fit) schrittweise, bis der Inhalt in die Box passt – scrollen kann am Frame niemand.
function useFit<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      let f = 1;
      el.style.setProperty('--fit', '1');
      while (el.scrollHeight > el.clientHeight + 1 && f > 0.5) {
        f -= 0.05;
        el.style.setProperty('--fit', String(f));
      }
    };
    fit();
    // Webfonts ändern die Höhe, falls sie erst nach dem ersten Layout da sind
    document.fonts?.ready.then(fit);
  }, []);
  return ref;
}

// Hochkant wie quer: erst die Schrift etwas verkleinern, dann den Eventtext von hinten kürzen
// und stattdessen einen QR-Code zur Website zeigen. Notfalls weiter verkleinern.
const SOFT_FIT = 0.8;
const MIN_FIT = 0.5;

function fitHighlight(box: HTMLElement) {
  const all = (sel: string) => [...box.querySelectorAll<HTMLElement>(sel)];
  const lines = all('[data-line]');
  const [list] = all('[data-list]');
  const [more] = all('[data-more]');
  const [footer] = all('[data-footer]');
  const overflows = () => box.scrollHeight > box.clientHeight + 1;
  // Zeile per line-clamp mit … abgeschnitten
  const clipped = () => lines.some((l) => l.style.display !== 'none' && l.scrollHeight > l.clientHeight + 1);
  let fit = 1;
  const setFit = (f: number) => box.style.setProperty('--fit', String((fit = f)));
  const shrink = (min: number) => {
    while (overflows() && fit > min + 0.001) setFit(fit - 0.05);
  };
  const show = (el: HTMLElement | undefined, on: boolean, display = '') => {
    if (el) el.style.display = on ? display : 'none';
  };

  setFit(1);
  lines.forEach((l) => show(l, true));
  show(list, true);
  show(more, false);
  show(footer, true);

  shrink(SOFT_FIT);
  if (!overflows() && !clipped()) return;

  if (more) {
    show(more, true, 'flex');
    show(footer, false);
  }
  for (let i = lines.length - 1; i >= 0 && overflows(); i--) show(lines[i], false);
  show(list, lines.some((l) => l.style.display !== 'none'));
  shrink(MIN_FIT);
}

// Kurze Stichpunkte nebeneinander, damit mehr davon Platz haben
function lineColumns(lines: string[]) {
  if (lines.length < 3) return 1;
  const longest = Math.max(...lines.map((l) => l.length));
  if (longest <= 18 && lines.length >= 6) return 3;
  return longest <= 30 ? 2 : 1;
}

function timeLabel(e: FrameEvent) {
  if (!e.time) return '';
  return e.endTime ? `${e.time}–${e.endTime}` : e.time;
}

export function ProgramSlide({
  from,
  to,
  today,
  events,
  portrait,
}: {
  from: string;
  to: string;
  today: string;
  events: FrameEvent[];
  portrait?: boolean;
}) {
  const max = MAX_ROWS;
  const shown = events.slice(0, max);
  const cols = !portrait && shown.length > ROWS_PER_COLUMN ? 2 : 1;
  const rows = Math.ceil(shown.length / cols);
  const f = parts(from);
  const t = parts(to);
  const gridRef = useFit<HTMLDivElement>();

  return (
    <div style={s.program}>
      <div style={s.programHead}>
        <div style={s.kicker}>Hamburg // Hafencity</div>
        <div style={s.programTitle}>Programm</div>
        <div style={s.kicker}>
          {f.day}. {f.month} – {t.day}. {t.month}
        </div>
      </div>
      <div
        ref={gridRef}
        style={{
          ...s.programGrid,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          maxWidth: cols === 1 && !portrait ? '60cqw' : undefined,
        }}
      >
        {shown.map((e, i) => {
          const p = parts(e.date);
          return (
            <div key={i} style={{ ...s.row, ...(portrait && sp.row) }}>
              <div style={{ ...s.rowDate, ...(portrait && sp.rowDate) }}>
                <div style={s.rowDay}>{e.date === today ? 'Heute' : `${p.weekday} ${p.day}.`}</div>
                <div style={s.rowMeta}>
                  {p.month}
                  {e.time && ` · ${e.time}`}
                </div>
              </div>
              <div style={s.rowBody}>
                <div style={{ ...s.rowTitle, ...(e.imageUrl ? s.rowHighlight : null) }}>{e.title}</div>
                {e.sub && <div style={s.rowSub}>{e.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={s.footer}>
        {events.length > max ? `+ ${events.length - max} weitere Termine auf ` : 'Alle Infos auf '}
        quarterpipe.hamburg
      </div>
    </div>
  );
}

export function HighlightSlide({
  event: e,
  today,
  portrait,
}: {
  event: FrameEvent;
  today: string;
  portrait?: boolean;
}) {
  const p = parts(e.date);
  const when = e.date === today ? 'Heute' : `${p.weekday} ${p.day}. ${p.month}`;
  const time = timeLabel(e);
  const facts = [e.sub, e.einlass && `Einlass ${e.einlass} Uhr`].filter(Boolean).join(' // ');
  const cols = lineColumns(e.lines);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = textRef.current;
    if (!box) return;
    fitHighlight(box);
    // Webfonts ändern die Höhe, falls sie erst nach dem ersten Layout da sind
    document.fonts?.ready.then(() => fitHighlight(box));
  }, []);

  // Hochkant: Flyer oben (column-reverse), darunter Titel und Eckdaten, dann der Eventtext
  return (
    <div style={{ ...s.highlight, ...(portrait && sp.highlight) }}>
      <div ref={textRef} style={{ ...s.highlightText, ...(portrait && sp.highlightText) }}>
        <div style={s.kicker}>
          {when}
          {time && ` // ${time} Uhr`}
        </div>
        <div style={s.highlightTitle}>{e.title}</div>
        {facts && <div style={s.highlightSub}>{facts}</div>}
        {e.lines.length > 0 && (
          <ul data-list style={{ ...s.list, columnCount: cols }}>
            {e.lines.map((line, i) => (
              <li key={i} data-line style={s.listItem}>
                {line}
              </li>
            ))}
          </ul>
        )}
        {e.infoQr && (
          <div data-more style={{ ...s.more, display: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.infoQr} alt="" style={s.moreQr} />
            <div>
              <div style={s.moreLabel}>Mehr Infos unter:</div>
              <div style={s.moreUrl}>quarterpipe.hamburg</div>
            </div>
          </div>
        )}
        <div data-footer style={s.footerLeft}>quarterpipe.hamburg</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.imageUrl}
        alt=""
        style={{ ...s.flyer, ...(portrait && sp.flyer) }}
        onError={(ev) => (ev.currentTarget.style.display = 'none')}
      />
    </div>
  );
}

export function QrSlide({
  qr,
  title,
  caption,
  portrait,
}: {
  qr: string;
  title?: string;
  caption?: string;
  portrait?: boolean;
}) {
  return (
    <div style={{ ...s.qr, ...(portrait && sp.qr) }}>
      <div style={{ ...s.qrText, ...(portrait && sp.qrText) }}>
        <div style={s.kicker}>Hamburg // Hafencity</div>
        {title && <div style={s.qrTitle}>{title}</div>}
        {caption && <div style={s.qrCaption}>{caption}</div>}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="" style={{ ...s.qrCode, ...(portrait && sp.qrCode) }} />
    </div>
  );
}

const anton = 'var(--font-anton), Impact, sans-serif';
const barlow = 'var(--font-barlow), "Arial Narrow", sans-serif';
const dashed = '2px dashed rgba(255,255,255,0.25)';
// Basiseinheit für Schrift und vertikale Abstände: 1 % der kurzen Seite (quer: Höhe, hochkant: Breite).
// --u setzt FrameSlideshow auf der Stage, so bleiben die Pixelgrößen in beiden Formaten gleich.
// --fit < 1 setzt useFit, wenn der Inhalt sonst nicht passt.
const u = (n: number) => `calc(var(--u) * var(--fit, 1) * ${n})`;
const clamp = (lines: number): React.CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const s: Record<string, React.CSSProperties> = {
  kicker: {
    fontFamily: barlow,
    fontSize: u(2.2),
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    opacity: 0.5,
  },

  program: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${u(4)} 5cqw ${u(3)}`,
    color: '#fff',
  },
  programHead: { textAlign: 'center', marginBottom: u(2.5) },
  programTitle: {
    fontFamily: anton,
    fontSize: u(7.5),
    lineHeight: 1,
    textTransform: 'uppercase',
    margin: `${u(0.5)} 0`,
  },
  programGrid: {
    flex: 1,
    width: '100%',
    display: 'grid',
    gridAutoFlow: 'column',
    columnGap: '4cqw',
    alignContent: 'start',
    overflow: 'hidden',
    borderTop: '4px dashed #fff',
  },
  row: {
    display: 'flex',
    gap: '1.5cqw',
    padding: `${u(1.2)} 0`,
    borderBottom: dashed,
  },
  rowDate: { width: '7.5cqw', flexShrink: 0 },
  rowDay: { fontFamily: anton, fontSize: u(3), lineHeight: 1.1, textTransform: 'uppercase' },
  rowMeta: {
    fontFamily: barlow,
    fontSize: u(1.9),
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    opacity: 0.5,
    marginTop: u(0.3),
  },
  rowBody: { minWidth: 0 },
  rowTitle: {
    fontFamily: anton,
    fontSize: u(3),
    lineHeight: 1.1,
    textTransform: 'uppercase',
    opacity: 0.75,
    ...clamp(2),
  },
  rowHighlight: { opacity: 1 },
  rowSub: { fontFamily: barlow, fontSize: u(2.2), opacity: 0.5, marginTop: u(0.3), ...clamp(1) },
  footer: {
    fontFamily: barlow,
    fontSize: u(2),
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    opacity: 0.4,
    marginTop: u(2),
  },

  highlight: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    gap: '4cqw',
    padding: `${u(6)} 5cqw`,
    color: '#fff',
  },
  highlightText: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'safe center',
  },
  highlightTitle: {
    fontFamily: anton,
    fontSize: u(7.5),
    lineHeight: 1.02,
    textTransform: 'uppercase',
    margin: `${u(1.5)} 0 0`,
    // sonst quetscht Flexbox den Titel (overflow: hidden) weg, statt dass fitHighlight greift
    flexShrink: 0,
    ...clamp(4),
  },
  highlightSub: {
    fontFamily: barlow,
    fontSize: u(2.6),
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    opacity: 0.5,
    marginTop: u(1.5),
  },
  list: {
    listStyle: 'none',
    margin: `${u(3.5)} 0 0`,
    padding: `${u(2.5)} 0 0`,
    borderTop: dashed,
    columnGap: '4cqw',
  },
  listItem: {
    fontFamily: barlow,
    fontSize: u(3),
    lineHeight: 1.35,
    opacity: 0.85,
    padding: `${u(0.6)} 0`,
    breakInside: 'avoid',
    ...clamp(2),
  },
  more: {
    alignItems: 'center',
    gap: u(3),
    marginTop: u(3.5),
    paddingTop: u(3),
    borderTop: dashed,
  },
  moreQr: {
    width: u(18),
    height: u(18),
    flexShrink: 0,
    background: '#fff',
    filter: 'none',
    mixBlendMode: 'normal',
  },
  moreLabel: {
    fontFamily: barlow,
    fontSize: u(2.6),
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  moreUrl: { fontFamily: anton, fontSize: u(4.5), lineHeight: 1.1, marginTop: u(0.5) },
  footerLeft: {
    fontFamily: barlow,
    fontSize: u(2),
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    opacity: 0.4,
    marginTop: u(4),
  },
  qr: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6cqw',
    padding: `${u(8)} 6cqw`,
    color: '#fff',
  },
  qrText: { maxWidth: '45cqw' },
  qrTitle: {
    fontFamily: anton,
    fontSize: u(10),
    lineHeight: 1,
    textTransform: 'uppercase',
    margin: `${u(2)} 0 0`,
  },
  qrCaption: { fontFamily: barlow, fontSize: u(4.5), opacity: 0.7, marginTop: u(3) },
  qrCode: {
    height: u(62),
    aspectRatio: '1',
    background: '#fff',
    filter: 'none',
    mixBlendMode: 'normal',
  },

  // filter/mixBlendMode heben den Xerox-Look aus globals.css auf
  flyer: {
    height: '100%',
    maxWidth: '45cqw',
    objectFit: 'contain',
    flexShrink: 0,
    filter: 'none',
    mixBlendMode: 'normal',
  },
};

// Hochkant-Abweichungen: Flyer über dem Text, QR-Code unter dem Text, Programm einspaltig.
// Der Flyer bekommt den Platz, den der Text übrig lässt (mind. die halbe Höhe), und wird darin ganz eingepasst.
const sp: Record<string, React.CSSProperties> = {
  row: { gap: '3cqw' },
  rowDate: { width: '15cqw' },
  highlight: { flexDirection: 'column-reverse', gap: u(4), padding: `${u(6)} 7cqw` },
  highlightText: { flex: '0 1 auto' },
  flyer: { flex: '1 1 0', minHeight: '50cqh', height: 'auto', width: '100%', maxWidth: 'none' },
  qr: { flexDirection: 'column', gap: u(6), textAlign: 'center' },
  qrText: { maxWidth: 'none' },
  qrCode: { height: 'auto', width: '70cqw' },
};
