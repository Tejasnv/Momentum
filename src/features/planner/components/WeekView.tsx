import { useState } from 'react';
import { CATEGORIES } from '../data/sampleData';
import {
  DOW_LONG, DOW_SHORT, MONTHS, addDays, atTime, dateKey, fmtDuration, fmtTime, fmtTimeShort, isoWeek, relativeLabel,
  minutesToTime,
} from '../lib/date';
import { card, cardHead, cardTitle, cx, iconBtn, nav, scroll, small } from '../lib/ui';
import type { Draft, Meeting, MeetingsByDay, OpenSeries, Series, Task } from '../types';
import Dot from './Dot';
import { ChevronLeft, ChevronRight } from './Icons';
import NewItemPopover from './NewItemPopover';

const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_PX = 56;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_PX;
const GUTTER = 52;
const SLOT_MIN = 30;
const POPOVER_W = 300;

const weekCols = 'grid grid-cols-[52px_repeat(7,minmax(0,1fr))]';

interface Lane {
  lane: number;
  lanes: number;
}

interface TimedItem {
  id: string;
  start: Date;
  end: Date;
}

/** Assign side-by-side lanes to overlapping meetings and task blocks within a day. */
function layoutDay(items: TimedItem[]) {
  const sorted = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());
  const layout: Record<string, Lane> = {};
  let cluster: TimedItem[] = [];
  let clusterEnd = 0;

  const flush = () => {
    const laneEnds: number[] = [];
    cluster.forEach((m) => {
      let lane = 0;
      while (laneEnds[lane] != null && laneEnds[lane] > m.start.getTime()) lane++;
      laneEnds[lane] = m.end.getTime();
      layout[m.id] = { lane, lanes: 0 };
    });
    cluster.forEach((m) => (layout[m.id].lanes = laneEnds.length));
    cluster = [];
  };

  sorted.forEach((m) => {
    if (cluster.length && m.start.getTime() >= clusterEnd) { flush(); clusterEnd = 0; }
    cluster.push(m);
    clusterEnd = Math.max(clusterEnd, m.end.getTime());
  });
  if (cluster.length) flush();
  return layout;
}

const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60;
const topOf = (d: Date) => Math.max(0, (hourOf(d) - START_HOUR) * HOUR_PX) + 1;
const heightOf = (start: Date, end: Date) => Math.max(22, ((end.getTime() - start.getTime()) / 36e5) * HOUR_PX - 2);

type ScheduledTask = Task & { start: Date; end: Date };
const isScheduled = (t: Task): t is ScheduledTask => t.start !== null && t.end !== null;

/** Popover x-position: beside the anchor column on whichever side has more room, kept inside the grid. */
const popoverLeft = (dayIndex: number) => {
  const right = dayIndex <= 2;
  const frac = right ? (dayIndex + 1) / 7 : dayIndex / 7;
  const x = `${GUTTER}px + (100% - ${GUTTER}px) * ${frac} ${right ? '+ 6px' : `- ${POPOVER_W + 6}px`}`;
  return `clamp(0px, calc(${x}), calc(100% - ${POPOVER_W}px))`;
};

interface HoverState {
  meeting: Meeting;
  dayIndex: number;
}

interface WeekViewProps {
  weekStart: Date;
  selectedDate: string;
  today: Date;
  now: Date;
  meetingsByDay: MeetingsByDay;
  tasks: Task[];
  selectedId: string | null;
  selectedTaskId: string | null;
  onSelect: (m: Meeting) => void;
  /** Clicking the already-selected meeting opens it for editing. */
  onEditMeeting: (m: Meeting) => void;
  onSelectTask: (t: Task) => void;
  draft: Draft | null;
  onSlotClick: (day: Date, minutes: number) => void;
  onDraftChange: (patch: Partial<Draft>) => void;
  onDraftSubmit: () => void;
  onDraftCancel: () => void;
  series: Series[];
  openSeries: OpenSeries[];
  onPickDate: (d: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function WeekView({
  weekStart, selectedDate, today, now, meetingsByDay, tasks, selectedId, selectedTaskId, onSelect, onEditMeeting, onSelectTask,
  draft, onSlotClick, onDraftChange, onDraftSubmit, onDraftCancel, series, openSeries,
  onPickDate, onPrevWeek, onNextWeek,
}: WeekViewProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];
  const todayKey = dateKey(today);

  const title = weekStart.getMonth() === weekEnd.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}`
    : `${MONTHS[weekStart.getMonth()].slice(0, 3)} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getDate()}`;

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const nowHour = hourOf(now);
  const slots = Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MIN }, (_, i) => START_HOUR * 60 + i * SLOT_MIN);

  const tasksByDay: Record<string, ScheduledTask[]> = {};
  tasks.filter(isScheduled).forEach((t) => (tasksByDay[dateKey(t.start)] ??= []).push(t));

  // Live preview of the item being drafted, following the edited date and times.
  const draftStart = draft && draft.date && draft.start ? atTime(draft.date, draft.start) : null;
  const draftEnd = draft && draft.date && draft.end ? atTime(draft.date, draft.end) : null;
  const draftLabel = draft ? draft.title.trim() || `New ${draft.kind === 'meeting' ? 'moment' : 'task'}` : '';
  const draftDayIndex = draft ? days.findIndex((d) => dateKey(d) === draft.anchorDate) : -1;

  return (
    <section className={cx(card, 'min-w-0 flex-1 gap-2.5 px-4 pt-4 pb-3')} aria-label="Week view">
      <div className={cardHead}>
        <div className="flex items-baseline gap-2.5">
          <h2 className={cardTitle}>{title}</h2>
          <span className={cx('text-muted', small)}>Week {isoWeek(weekStart)}</span>
        </div>
        <div className={nav}>
          <button type="button" className={iconBtn} aria-label="Previous week" onClick={onPrevWeek}><ChevronLeft /></button>
          <button type="button" className={iconBtn} aria-label="Next week" onClick={onNextWeek}><ChevronRight /></button>
        </div>
      </div>

      <div className={cx(weekCols, 'border-b border-line pb-2')}>
        <span />
        {days.map((d, i) => {
          const k = dateKey(d);
          const num = cx(
            'grid size-7 place-items-center rounded-full text-[15px] font-semibold',
            k === todayKey
              ? 'bg-accent text-accent-ink'
              : k === selectedDate && 'shadow-[inset_0_0_0_1.5px_var(--color-accent)]',
          );
          return (
            <button
              key={k}
              type="button"
              className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[10px] border-none bg-transparent p-0 text-ink hover:bg-hover"
              onClick={() => onPickDate(d)}
              aria-label={`${DOW_LONG[i]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`}
            >
              <span className="text-[11px] font-medium tracking-[0.06em] text-muted">{DOW_SHORT[i]}</span>
              <span className={num}>{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className={cx(scroll, 'max-[1180px]:max-h-[640px]')}>
        <div className={cx(weekCols, 'relative mt-1.5')} style={{ height: GRID_HEIGHT }}>
          <div className="relative">
            {hours.map((h) => (
              <div key={h} className="absolute right-2 text-[11px] text-muted" style={{ top: (h - START_HOUR) * HOUR_PX + 2 }}>
                {h % 12 || 12} {h < 12 ? 'AM' : 'PM'}
              </div>
            ))}
          </div>

          {days.map((d, dayIndex) => {
            const k = dateKey(d);
            // The meeting being edited is drawn by the draft preview instead, at its edited time.
            const dayMeetings = (meetingsByDay[k] ?? []).filter((m) => m.id !== draft?.editingId);
            const dayTasks = tasksByDay[k] ?? [];
            const layout = layoutDay([...dayMeetings, ...dayTasks]);
            const isToday = k === todayKey;
            const showDraft = draftStart && draftEnd && draftEnd > draftStart && dateKey(draftStart) === k;
            return (
              <div
                key={k}
                className={cx(
                  'relative border-l border-line-soft bg-[linear-gradient(to_bottom,var(--color-line-soft)_0,var(--color-line-soft)_1px,transparent_1px)]',
                  k === selectedDate && 'bg-day-selected',
                )}
                style={{ backgroundSize: `100% ${HOUR_PX}px` }}
              >
                {/* Half-hour click targets behind the events. Mouse-only; "New moment" in the header is the keyboard path. */}
                {slots.map((min) => (
                  <button
                    key={min}
                    type="button"
                    tabIndex={-1}
                    data-slot
                    aria-label={`New item, ${DOW_LONG[dayIndex]} ${fmtTime(atTime(k, minutesToTime(min)))}`}
                    className="group absolute inset-x-0 z-0 flex cursor-pointer items-start rounded-md border-none bg-transparent px-1.5 pt-0.5 text-left hover:bg-accent/[0.06]"
                    style={{ top: ((min / 60) - START_HOUR) * HOUR_PX, height: (SLOT_MIN / 60) * HOUR_PX }}
                    onClick={() => onSlotClick(d, min)}
                  >
                    <span className="text-[11px] font-medium text-accent opacity-0 group-hover:opacity-100">
                      + {fmtTimeShort(atTime(k, minutesToTime(min)))}
                    </span>
                  </button>
                ))}

                {dayMeetings.map((m) => {
                  const cat = CATEGORIES[m.category];
                  const { lane, lanes } = layout[m.id];
                  const top = topOf(m.start);
                  const height = heightOf(m.start, m.end);
                  const chosen = selectedId === m.id;
                  const ended = m.end <= now;
                  const tall = height >= 40;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={cx(
                        'absolute flex cursor-pointer flex-col gap-px overflow-hidden rounded-lg border px-1.5 py-1 text-left transition-shadow duration-150',
                        chosen
                          ? 'z-3 shadow-[0_6px_16px_rgba(28,27,24,0.18)]'
                          : 'z-1 hover:z-2 hover:shadow-[0_4px_12px_rgba(28,27,24,0.12)]',
                      )}
                      aria-label={`${m.title}, ${fmtTime(m.start)} to ${fmtTime(m.end)}${chosen ? ', selected — click to edit' : ''}`}
                      onClick={() => { (chosen ? onEditMeeting : onSelect)(m); setHover(null); }}
                      onMouseEnter={() => setHover({ meeting: m, dayIndex })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ meeting: m, dayIndex })}
                      onBlur={() => setHover(null)}
                      style={{
                        top,
                        height,
                        left: `calc(${(lane / lanes) * 100}% + 3px)`,
                        width: `calc(${100 / lanes}% - 6px)`,
                        background: chosen ? cat.dot : cat.bg,
                        color: chosen ? '#fff' : cat.fg,
                        borderColor: chosen ? cat.dot : cat.border,
                        opacity: ended && !chosen ? 0.6 : 1,
                      }}
                    >
                      <span
                        className="overflow-hidden text-ellipsis text-[12px] font-semibold leading-[1.25]"
                        style={{ whiteSpace: tall ? 'normal' : 'nowrap' }}
                      >
                        {m.title}
                      </span>
                      {tall && <span className="text-[11px] leading-[1.3]">{fmtTimeShort(m.start)}–{fmtTimeShort(m.end)}</span>}
                    </button>
                  );
                })}

                {dayTasks.map((t) => {
                  const cat = t.category ? CATEGORIES[t.category] : null;
                  const { lane, lanes } = layout[t.id];
                  const height = heightOf(t.start, t.end);
                  const chosen = selectedTaskId === t.id;
                  const tall = height >= 40;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={cx(
                        'absolute flex cursor-pointer flex-col gap-px overflow-hidden rounded-lg border border-dashed bg-card px-1.5 py-1 text-left',
                        chosen ? 'z-3 shadow-[0_6px_16px_rgba(28,27,24,0.18)]' : 'z-1 hover:z-2 hover:shadow-[0_4px_12px_rgba(28,27,24,0.12)]',
                        t.done && 'opacity-60',
                      )}
                      aria-label={`Task: ${t.title}, ${fmtTime(t.start)} to ${fmtTime(t.end)}${t.done ? ', done' : ''}`}
                      onClick={() => onSelectTask(t)}
                      style={{
                        top: topOf(t.start),
                        height,
                        left: `calc(${(lane / lanes) * 100}% + 3px)`,
                        width: `calc(${100 / lanes}% - 6px)`,
                        color: cat?.fg ?? 'var(--color-ink-2)',
                        borderColor: chosen ? (cat?.dot ?? 'var(--color-ink-2)') : (cat?.border ?? 'var(--color-line-strong)'),
                      }}
                    >
                      <span
                        className={cx('flex items-center gap-1 overflow-hidden text-[12px] font-semibold leading-[1.25]', t.done && 'line-through')}
                        style={{ whiteSpace: tall ? 'normal' : 'nowrap' }}
                      >
                        <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-[3px] border-[1.5px] border-current" />
                        <span className="overflow-hidden text-ellipsis">{t.title}</span>
                      </span>
                      {tall && <span className="text-[11px] leading-[1.3]">{fmtTimeShort(t.start)}–{fmtTimeShort(t.end)}</span>}
                    </button>
                  );
                })}

                {showDraft && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-[3px] z-4 flex flex-col gap-px overflow-hidden rounded-lg border-[1.5px] border-dashed border-accent bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-card))] px-1.5 py-1 text-accent"
                    style={{ top: topOf(draftStart), height: heightOf(draftStart, draftEnd) }}
                  >
                    <span className="truncate text-[12px] font-semibold leading-[1.25]">
                      {draftLabel}
                    </span>
                    <span className="text-[11px] leading-[1.3]">{fmtTimeShort(draftStart)}–{fmtTimeShort(draftEnd)}</span>
                  </div>
                )}

                {isToday && nowHour >= START_HOUR && nowHour <= END_HOUR && (
                  <div
                    className="pointer-events-none absolute -left-px right-0 z-5 h-0.5 bg-now"
                    style={{ top: (nowHour - START_HOUR) * HOUR_PX }}
                  >
                    <span className="absolute -top-[3px] -left-1 size-2 rounded-full bg-now" />
                  </div>
                )}
              </div>
            );
          })}

          {hover && !draft && <QuickView {...hover} selected={hover.meeting.id === selectedId} now={now} today={today} />}

          {draft && draftDayIndex >= 0 && (
            <NewItemPopover
              draft={draft}
              onChange={onDraftChange}
              onSubmit={onDraftSubmit}
              onCancel={onDraftCancel}
              series={series}
              openSeries={openSeries}
              left={popoverLeft(draftDayIndex)}
              top={(draft.anchorMin / 60 - START_HOUR) * HOUR_PX - 8}
              maxHeight={GRID_HEIGHT}
            />
          )}
        </div>
      </div>
    </section>
  );
}

/** Hover / focus popover with the essentials of a meeting. */
function QuickView({ meeting: m, dayIndex, selected, now, today }: HoverState & { selected: boolean; now: Date; today: Date }) {
  const cat = CATEGORIES[m.category];
  const r = relativeLabel(m, now, today);
  const onLeft = dayIndex < 4;
  const frac = onLeft ? (dayIndex + 1) / 7 : dayIndex / 7;
  const top = Math.min(Math.max(0, (hourOf(m.start) - START_HOUR) * HOUR_PX), GRID_HEIGHT - 170);
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 flex w-60 flex-col gap-2 rounded-[14px] bg-ink p-3.5 text-ground shadow-[0_12px_32px_rgba(28,27,24,0.22)]"
      style={{
        left: `calc(${GUTTER}px + (100% - ${GUTTER}px) * ${frac})`,
        top,
        transform: onLeft ? 'translateX(6px)' : 'translateX(calc(-100% - 6px))',
      }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-qv-muted">
        <Dot color={cat.dot} size="lg" />{cat.label} · {r.text}
      </div>
      <div className="text-[15px] font-semibold leading-[1.3]">{m.title}</div>
      <div className="flex flex-col gap-1 text-[12px] text-qv-muted">
        <span>{fmtTime(m.start)} – {fmtTime(m.end)} · {fmtDuration(m.minutes)}</span>
        <span>{m.location}</span>
        <span>{m.people.length} attendees · {m.organizer === 'You' ? 'You (organiser)' : `${m.organizer} organising`}</span>
      </div>
      <div className="text-[11px] text-qv-faint">{selected ? 'Click to edit' : 'Click for full details'}</div>
    </div>
  );
}
