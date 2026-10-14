import type { FrameEvent } from './slides';

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
// Ab dieser Anzahl zweispaltig; mehr als das Doppelte passt nicht auf den Screen.
const ROWS_PER_COLUMN = 7;

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
}: {
  from: string;
  to: string;
  today: string;
  events: FrameEvent[];
}) {
  const max = ROWS_PER_COLUMN * 2;
  const shown = events.slice(0, max);
  const cols = shown.length > ROWS_PER_COLUMN ? 2 : 1;
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
          maxWidth: cols === 1 ? '60vw' : undefined,
        }}
      >
        {shown.map((e, i) => {
          const p = parts(e.date);
          return (
            <div key={i} style={s.row}>
              <div style={s.rowDate}>
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

export function HighlightSlide({ event: e, today }: { event: FrameEvent; today: string }) {
  const p = parts(e.date);
  const when = e.date === today ? 'Heute' : `${p.weekday} ${p.day}. ${p.month}`;
  const time = timeLabel(e);

  return (
    <div style={s.highlight}>
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
        style={s.flyer}
        onError={(ev) => (ev.currentTarget.style.display = 'none')}
      />
    </div>
  );
}

const anton = 'var(--font-anton), Impact, sans-serif';
const barlow = 'var(--font-barlow), "Arial Narrow", sans-serif';
const dashed = '2px dashed rgba(255,255,255,0.25)';
const clamp = (lines: number): React.CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const s: Record<string, React.CSSProperties> = {
  kicker: {
    fontFamily: barlow,
    fontSize: '2.2vh',
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
    padding: '4vh 5vw 3vh',
    color: '#fff',
  },
  programHead: { textAlign: 'center', marginBottom: '2.5vh' },
  programTitle: {
    fontFamily: anton,
    fontSize: '7.5vh',
    lineHeight: 1,
    textTransform: 'uppercase',
    margin: '0.5vh 0',
  },
  programGrid: {
    flex: 1,
    width: '100%',
    display: 'grid',
    gridAutoFlow: 'column',
    columnGap: '4vw',
    alignContent: 'start',
    overflow: 'hidden',
    borderTop: '4px dashed #fff',
  },
  row: {
    display: 'flex',
    gap: '1.5vw',
    padding: '1.2vh 0',
    borderBottom: dashed,
  },
  rowDate: { width: '7.5vw', flexShrink: 0 },
  rowDay: { fontFamily: anton, fontSize: '3vh', lineHeight: 1.1, textTransform: 'uppercase' },
  rowMeta: {
    fontFamily: barlow,
    fontSize: '1.9vh',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    opacity: 0.5,
    marginTop: '0.3vh',
  },
  rowBody: { minWidth: 0 },
  rowTitle: {
    fontFamily: anton,
    fontSize: '3vh',
    lineHeight: 1.1,
    textTransform: 'uppercase',
    opacity: 0.75,
    ...clamp(2),
  },
  rowHighlight: { opacity: 1 },
  rowSub: { fontFamily: barlow, fontSize: '2.2vh', opacity: 0.5, marginTop: '0.3vh', ...clamp(1) },
  footer: {
    fontFamily: barlow,
    fontSize: '2vh',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    opacity: 0.4,
    marginTop: '2vh',
  },

  highlight: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    gap: '4vw',
    padding: '6vh 5vw',
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
    fontSize: '7.5vh',
    lineHeight: 1.02,
    textTransform: 'uppercase',
    margin: '1.5vh 0 0',
    ...clamp(4),
  },
  highlightSub: {
    fontFamily: barlow,
    fontSize: '2.6vh',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    opacity: 0.5,
    marginTop: '1.5vh',
  },
  list: {
    listStyle: 'none',
    margin: '3.5vh 0 0',
    padding: '2.5vh 0 0',
    borderTop: dashed,
  },
  listItem: {
    fontFamily: barlow,
    fontSize: '3vh',
    lineHeight: 1.35,
    opacity: 0.85,
    padding: '0.6vh 0',
    ...clamp(2),
  },
  footerLeft: {
    fontFamily: barlow,
    fontSize: '2vh',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    opacity: 0.4,
    marginTop: '4vh',
  },
  // filter/mixBlendMode heben den Xerox-Look aus globals.css auf
  flyer: {
    height: '100%',
    maxWidth: '45vw',
    objectFit: 'contain',
    flexShrink: 0,
    filter: 'none',
    mixBlendMode: 'normal',
  },
};
