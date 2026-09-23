import { useEffect, useRef } from 'react';
import { DOW_LONG, addDays, daysBetween, fmtTime, weekdayIndex } from '../lib/date';
import { TONE, card, cardHead, cardTitle, cx, scroll, small } from '../lib/ui';
import type { Meeting, Priority, Task, Tone } from '../types';

const PRIORITY: Record<Priority, { bg: string; fg: string }> = {
  High: { bg: '#f7e0da', fg: '#8a2a17' },
  Medium: { bg: '#f4ecd2', fg: '#5f4a0c' },
  Low: { bg: '#ebe8e1', fg: '#4a463e' },
};

function dueLabel(dueIn: number, today: Date, start: Date | null) {
  const at = start ? ` · ${fmtTime(start)}` : '';
  if (dueIn < 0) return 'Overdue';
  if (dueIn === 0) return `Due today${at}`;
  if (dueIn === 1) return `Due tomorrow${at}`;
  const d = addDays(today, dueIn);
  return `Due ${DOW_LONG[weekdayIndex(d)].slice(0, 3)} ${d.getDate()}${at}`;
}

interface TaskListProps {
  tasks: Task[];
  today: Date;
  meetingsById: Record<string, Meeting>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onOpenMeeting: (m: Meeting) => void;
}

export default function TaskList({ tasks, today, meetingsById, selectedId, onToggle, onOpenMeeting }: TaskListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (selectedId) listRef.current?.querySelector(`[data-task="${selectedId}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className={cx(card, 'h-[300px] shrink-0 gap-1.5 px-3 pt-4 pb-2.5')} aria-label="Tasks">
      <div className={cx(cardHead, 'px-1.5')}>
        <h2 className={cardTitle}>Tasks</h2>
        <span className={cx('text-muted', small)}>{doneCount} of {tasks.length} done</span>
      </div>
      <ul ref={listRef} className={scroll}>
        {sorted.map((t) => {
          const linked = t.meetingId ? meetingsById[t.meetingId] : null;
          const dueIn = daysBetween(today, t.due);
          const tone: Tone = t.done ? 'muted' : dueIn < 0 ? 'overdue' : dueIn === 0 ? 'soon' : 'muted';
          return (
            <li
              key={t.id}
              data-task={t.id}
              className={cx('flex flex-col gap-[3px] border-b border-divider px-1.5 py-2', t.id === selectedId && 'rounded-lg bg-band')}
            >
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.35]">
                <input
                  type="checkbox"
                  className="m-0 mt-px size-4 shrink-0 accent-accent"
                  checked={t.done}
                  onChange={() => onToggle(t.id)}
                />
                <span className={cx(t.done && 'text-faint line-through')}>{t.title}</span>
              </label>
              <div className="flex items-center gap-2 pl-[26px] text-[11px] font-medium">
                <span className={TONE[tone]}>{dueLabel(dueIn, today, t.start)}</span>
                <span
                  className="rounded-full px-[7px] py-px font-semibold"
                  style={{ background: PRIORITY[t.priority].bg, color: PRIORITY[t.priority].fg }}
                >
                  {t.priority}
                </span>
                {linked && (
                  <button
                    type="button"
                    className="max-w-[150px] cursor-pointer truncate border-none bg-transparent p-0 text-[11px] text-accent underline underline-offset-2"
                    onClick={() => onOpenMeeting(linked)}
                  >
                    {linked.title}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
