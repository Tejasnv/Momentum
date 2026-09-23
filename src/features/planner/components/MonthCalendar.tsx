import { CATEGORIES } from '../data/sampleData';
import { DOW_LONG, MONTHS, addDays, dateKey, parseKey, startOfWeek, weekdayIndex } from '../lib/date';
import { card, cardHead, cardTitle, cx, iconBtn, nav } from '../lib/ui';
import type { MeetingsByDay, ViewMonth } from '../types';
import Dot from './Dot';
import { ChevronLeft, ChevronRight } from './Icons';

const MAX_DOTS = 3;

interface MonthCalendarProps {
  viewMonth: ViewMonth;
  onChangeMonth: (v: ViewMonth) => void;
  selectedDate: string;
  today: Date;
  meetingsByDay: MeetingsByDay;
  onPickDate: (d: Date) => void;
}

export default function MonthCalendar({
  viewMonth, onChangeMonth, selectedDate, today, meetingsByDay, onPickDate,
}: MonthCalendarProps) {
  const { year, month } = viewMonth;
  const gridStart = startOfWeek(new Date(year, month, 1));
  const todayKey = dateKey(today);

  const selWeekStart = startOfWeek(parseKey(selectedDate));
  const selWeek = new Set(Array.from({ length: 7 }, (_, i) => dateKey(addDays(selWeekStart, i))));

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChangeMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <section className={cx(card, 'gap-2.5 p-4')} aria-label="Month overview">
      <div className={cardHead}>
        <h2 className={cardTitle}>{MONTHS[month]} {year}</h2>
        <div className={nav}>
          <button type="button" className={iconBtn} aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft /></button>
          <button type="button" className={iconBtn} aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium tracking-[0.04em] text-muted">
        {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d) => {
          const k = dateKey(d);
          const dayMeetings = meetingsByDay[k] ?? [];
          const isSel = k === selectedDate;
          const isToday = k === todayKey;
          const isPast = d < today;
          const cls = cx(
            'flex h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] p-0 text-[13px]',
            isSel
              ? 'border-transparent bg-accent font-semibold text-accent-ink'
              : cx(
                  isToday ? 'border-accent font-semibold text-accent' : cx('border-transparent', d.getMonth() !== month ? 'text-faint' : 'text-ink'),
                  selWeek.has(k) ? 'bg-band' : 'bg-transparent hover:bg-band',
                ),
          );
          const aria = `${DOW_LONG[weekdayIndex(d)]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` +
            (dayMeetings.length ? `, ${dayMeetings.length} moment${dayMeetings.length > 1 ? 's' : ''}` : '');

          return (
            <button key={k} type="button" className={cls} aria-label={aria} aria-pressed={isSel} onClick={() => onPickDate(d)}>
              <span>{d.getDate()}</span>
              {/* Meatball indicators: one dot per meeting, coloured by category */}
              <span className="flex h-[5px] items-center gap-[3px]">
                {dayMeetings.slice(0, MAX_DOTS).map((m) => (
                  <Dot
                    key={m.id}
                    color={isSel ? '#fff' : CATEGORIES[m.category].dot}
                    style={{ opacity: isPast && !isSel ? 0.4 : 1 }}
                  />
                ))}
                {dayMeetings.length > MAX_DOTS && (
                  <span className={cx('text-[10px] font-semibold leading-[5px]', isSel ? 'text-accent-ink' : 'text-muted')}>+</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-muted">
        {Object.values(CATEGORIES).map((c) => (
          <span key={c.label} className="flex items-center gap-[5px]"><Dot color={c.dot} size="lg" />{c.label}</span>
        ))}
      </div>
    </section>
  );
}
