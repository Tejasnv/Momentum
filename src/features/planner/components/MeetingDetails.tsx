import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/sampleData';
import { fmtDuration, fmtLongDate, fmtTime, relativeLabel } from '../lib/date';
import { TONE, btn, btnOutline, btnPrimary, btnRect, card, cx, display, label, rel, small } from '../lib/ui';
import type { Meeting, Series } from '../types';
import Dot from './Dot';
import { ArrowRight, CalendarIcon, ClockIcon, PinIcon, RepeatIcon, UserIcon, VideoIcon } from './Icons';

const AVATAR_COLORS: [string, string][] = [
  ['#dfe7f7', '#23407f'], ['#e1efea', '#1b5049'], ['#f7e5da', '#7d3718'], ['#ece4f5', '#4d3673'], ['#f4ecd2', '#5f4a0c'],
];

const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);
const avatarColor = (name: string) => AVATAR_COLORS[(name.charCodeAt(0) + name.length) % AVATAR_COLORS.length];

const section = cx(card, 'min-h-0 flex-1 gap-3.5 overflow-y-auto p-[18px] max-[1180px]:max-h-[460px]');
const block = 'flex flex-col gap-2';

interface MeetingDetailsProps {
  meeting: Meeting | null;
  series: Series | null;
  onEdit: (m: Meeting) => void;
  now: Date;
  today: Date;
}

export default function MeetingDetails({ meeting: m, series, onEdit, now, today }: MeetingDetailsProps) {
  if (!m) {
    return (
      <section className={section} aria-label="Moment details">
        <p className={cx('m-auto p-6 text-center text-muted', small)}>
          Select a moment in the week view or the Upcoming list to see its details here.
        </p>
      </section>
    );
  }

  const cat = CATEGORIES[m.category];
  const r = relativeLabel(m, now, today);
  const location = m.hasVideo && m.location !== 'Video call' ? `${m.location} · or join by video` : m.location;

  return (
    <section className={section} aria-label="Moment details">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{ background: cat.bg, color: cat.fg }}
        >
          <Dot color={cat.dot} size="lg" />{cat.label}
        </span>
        <span className={cx(rel, TONE[r.tone])}>{r.text}</span>
      </div>

      <h2 className={cx(display, 'text-[30px] leading-[1.1]')}>{m.title}</h2>

      <ul className="flex flex-col gap-2.5 text-[13px] [&_li]:flex [&_li]:items-start [&_li]:gap-2.5 [&_svg]:mt-px [&_svg]:shrink-0 [&_svg]:text-muted">
        <li><CalendarIcon /><span>{fmtLongDate(m.start)}</span></li>
        <li><ClockIcon /><span>{fmtTime(m.start)} – {fmtTime(m.end)} <span className="text-muted">· {fmtDuration(m.minutes)}</span></span></li>
        <li><PinIcon /><span>{location}</span></li>
        <li><UserIcon /><span>Organised by {m.organizer}</span></li>
        {series && <li><RepeatIcon /><span>Part of {series.name}</span></li>}
      </ul>

      <div className="flex flex-wrap gap-2">
        {m.hasVideo && m.end > now && (
          <button type="button" className={cx(btn, btnRect, btnPrimary)}><VideoIcon />Join call</button>
        )}
        <button type="button" className={cx(btn, btnRect, btnOutline)} onClick={() => onEdit(m)}>Reschedule</button>
        <Link to={`/moments/${m.id}`} className={cx(btn, btnRect, btnOutline, 'no-underline')}>
          Open moment<ArrowRight />
        </Link>
      </div>

      <div className={block}>
        <h3 className={label}>Attendees · {m.people.length}</h3>
        <ul className="flex flex-col gap-2 text-[13px]">
          {m.people.map((p) => {
            const [bg, fg] = avatarColor(p.name);
            return (
              <li key={p.name} className="flex items-center gap-2.5">
                <span
                  className="grid size-[30px] shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                  style={{ background: bg, color: fg }}
                >
                  {initials(p.name)}
                </span>
                <span className="grow">{p.name}</span>
                <span className={cx(small, p.status === 'Accepted' ? TONE.live : TONE.warn)}>{p.status}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {m.agenda.length > 0 && (
        <div className={block}>
          <h3 className={label}>Agenda</h3>
          <ol className="flex list-decimal flex-col gap-1 pl-[18px] text-[13px] leading-[1.45]">
            {m.agenda.map((a) => <li key={a}>{a}</li>)}
          </ol>
        </div>
      )}

      {m.notes && (
        <div className={block}>
          <h3 className={label}>Notes</h3>
          <p className="text-[13px] leading-normal text-ink-2">{m.notes}</p>
        </div>
      )}
    </section>
  );
}
