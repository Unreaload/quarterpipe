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

  return (
    <div style={{ ...s.highlight, ...(portrait && sp.highlight) }}>
      <div style={s.highlightText}>
        <div style={s.kicker}>
          {when}
          {time && ` // ${time} Uhr`}
        </div>
        <div style={s.highlightTitle}>{e.title}</div>
        {e.sub && <div style={s.highlightSub}>{e.sub}</div>}
        {(e.einlass || e.lines.length > 0) && (
          <ul style={s.list}>
            {e.einlass && <li style={s.listItem}>Einlass {e.einlass} Uhr</li>}
            {e.lines.map((line, i) => (
              <li key={i} style={s.listItem}>
                {line}
              </li>
            ))}
          </ul>
        )}
        <div style={s.footerLeft}>quarterpipe.hamburg</div>
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
const u = (n: number) => `calc(var(--u) * ${n})`;
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  highlightTitle: {
    fontFamily: anton,
    fontSize: u(7.5),
    lineHeight: 1.02,
    textTransform: 'uppercase',
    margin: `${u(1.5)} 0 0`,
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
  },
  listItem: {
    fontFamily: barlow,
    fontSize: u(3),
    lineHeight: 1.35,
    opacity: 0.85,
    padding: `${u(0.6)} 0`,
    ...clamp(2),
  },
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

// Hochkant-Abweichungen: Flyer über dem Text, QR-Code unter dem Text, Programm einspaltig
const sp: Record<string, React.CSSProperties> = {
  row: { gap: '3cqw' },
  rowDate: { width: '15cqw' },
  highlight: { flexDirection: 'column-reverse', gap: u(4), padding: `${u(6)} 7cqw` },
  flyer: { height: 'auto', width: '100%', maxHeight: '55cqh', maxWidth: 'none' },
  qr: { flexDirection: 'column', gap: u(6), textAlign: 'center' },
  qrText: { maxWidth: 'none' },
  qrCode: { height: 'auto', width: '70cqw' },
};
