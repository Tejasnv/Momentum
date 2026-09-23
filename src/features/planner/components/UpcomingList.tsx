import { Fragment } from 'react';
import { CATEGORIES } from '../data/sampleData';
import { DOW_LONG, MONTHS, daysBetween, fmtTime, relativeLabel, weekdayIndex } from '../lib/date';
import { TONE, card, cardHead, cardTitle, cx, rel, scroll, small } from '../lib/ui';
import type { Meeting } from '../types';
import Dot from './Dot';

const LIMIT = 12;

interface UpcomingListProps {
  meetings: Meeting[];
  now: Date;
  today: Date;
  selectedId: string | null;
  onSelect: (m: Meeting) => void;
}

const groupHead = (m: Meeting, today: Date) => {
  const days = daysBetween(today, m.start);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${DOW_LONG[weekdayIndex(m.start)].slice(0, 3)}, ${MONTHS[m.start.getMonth()].slice(0, 3)} ${m.start.getDate()}`;
};

export default function UpcomingList({ meetings, now, today, selectedId, onSelect }: UpcomingListProps) {
  const upcoming = meetings.filter((m) => m.end > now).slice(0, LIMIT);
  const heads = upcoming.map((m) => groupHead(m, today));

  return (
    <section
      className={cx(card, 'min-h-0 flex-1 gap-2.5 px-3 pt-4 pb-3 max-[1180px]:max-h-[460px]')}
      aria-label="Upcoming moments"
    >
      <div className={cx(cardHead, 'px-1')}>
        <h2 className={cardTitle}>Upcoming</h2>
        <span className={cx('text-muted', small)}>next {upcoming.length}</span>
      </div>
      <div className={scroll}>
        {upcoming.length === 0 && <p className={cx('px-1.5 py-3 text-muted', small)}>Nothing scheduled.</p>}
        {upcoming.map((m, i) => {
          const days = daysBetween(today, m.start);
          const r = relativeLabel(m, now, today);
          const selected = selectedId === m.id;
          return (
            <Fragment key={m.id}>
              {heads[i] !== heads[i - 1] && (
                <div className="px-1.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  {heads[i]}
                </div>
              )}
              <button
                type="button"
                className={cx(
                  'flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-xl border-none px-2.5 py-2 text-left text-ink',
                  selected ? 'bg-band' : 'bg-transparent hover:bg-hover',
                )}
                aria-pressed={selected}
                onClick={() => onSelect(m)}
              >
                <Dot color={CATEGORIES[m.category].dot} size="md" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-medium">{m.title}</span>
                  <span className={cx('text-muted', small)}>{fmtTime(m.start)} – {fmtTime(m.end)}</span>
                </span>
                {days <= 0 && <span className={cx(rel, TONE[r.tone])}>{r.text}</span>}
              </button>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
