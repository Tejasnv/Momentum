import { useEffect, useLayoutEffect, useRef, type CSSProperties, type FormEvent } from 'react';
import { CATEGORIES } from '../data/sampleData';
import { minutesToTime, timeToMinutes } from '../lib/date';
import { btnOutline, btnSmall, btnPrimary, btnRect, cx, display, input, label } from '../lib/ui';
import type { CategoryKey, Draft, ItemKind, OpenSeries, Priority, Series } from '../types';
import Dot from './Dot';
import SeriesCombobox from './SeriesCombobox';

const LAST_MINUTE = 23 * 60 + 59;
const field = 'flex min-w-0 flex-col gap-1';

interface NewItemPopoverProps {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  series: Series[];
  openSeries: OpenSeries[];
  /** Horizontal placement, computed by the week view from the anchor column. */
  left: string;
  /** Preferred top within the grid; clamped so the popover stays inside it. */
  top: number;
  maxHeight: number;
}

export default function NewItemPopover({
  draft, onChange, onSubmit, onCancel, series, openSeries, left, top, maxHeight,
}: NewItemPopoverProps) {
  const ref = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Clamp against the rendered height (it differs between meetings and tasks).
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.style.top = `${Math.max(0, Math.min(top, maxHeight - el.offsetHeight))}px`;
  }, [top, maxHeight, draft.kind]);

  // A new slot was picked: bring the form into view and put the cursor in the name field.
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest' });
    titleRef.current?.focus();
  }, [draft.anchorDate, draft.anchorMin]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (ref.current?.contains(t) || t.closest('[data-slot], [data-new-item]')) return;
      onCancel();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onCancel]);

  const startMin = timeToMinutes(draft.start);
  const endMin = timeToMinutes(draft.end);
  const timesValid = !Number.isNaN(startMin) && !Number.isNaN(endMin) && endMin > startMin;
  const valid = draft.title.trim() !== '' && draft.date !== '' && timesValid;

  const seriesQuery = draft.seriesName.trim().toLowerCase();
  const isNewSeries = seriesQuery !== '' && !series.some((s) => s.name.toLowerCase() === seriesQuery);

  // Moving the start keeps the duration, like most calendars.
  const setStart = (value: string) => {
    const next = timeToMinutes(value);
    const duration = endMin - startMin;
    if (Number.isNaN(next) || !(duration > 0)) return onChange({ start: value });
    onChange({ start: value, end: minutesToTime(Math.min(next + duration, LAST_MINUTE)) });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onSubmit();
  };

  const noun = draft.kind === 'meeting' ? 'moment' : 'task';
  const editing = draft.editingId !== null;
  const heading = `${editing ? 'Edit' : 'New'} ${noun}`;
  const style: CSSProperties = { left };

  return (
    <form
      ref={ref}
      aria-label={heading}
      onSubmit={submit}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
      className="absolute z-30 flex w-[300px] flex-col gap-3 rounded-[14px] border border-line bg-card p-4 text-ink shadow-[0_12px_32px_rgba(28,27,24,0.22)]"
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className={cx(display, 'text-[22px] leading-none')}>{heading}</h3>
        <Dot color={CATEGORIES[draft.category].dot} size="lg" />
      </div>

      <div className={field}>
        <label htmlFor="new-item-title" className={label}>Name</label>
        <input
          ref={titleRef}
          id="new-item-title"
          className={input}
          placeholder={draft.kind === 'meeting' ? 'e.g. Design sync' : 'e.g. Draft the proposal'}
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={field}>
          <label htmlFor="new-item-kind" className={label}>Type</label>
          <select
            id="new-item-kind"
            className={cx(input, 'disabled:cursor-not-allowed disabled:opacity-60')}
            disabled={editing}
            title={editing ? 'An existing moment can’t be turned into a task' : undefined}
            value={draft.kind}
            onChange={(e) => onChange({ kind: e.target.value as ItemKind })}
          >
            <option value="meeting">Moment</option>
            <option value="task">Task</option>
          </select>
        </div>
        <div className={field}>
          <label htmlFor="new-item-category" className={label}>Category</label>
          <select
            id="new-item-category"
            className={input}
            value={draft.category}
            onChange={(e) => onChange({ category: e.target.value as CategoryKey })}
          >
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((k) => (
              <option key={k} value={k}>{CATEGORIES[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={field}>
        <label htmlFor="new-item-series" className={label}>Series</label>
        <SeriesCombobox
          id="new-item-series"
          value={draft.seriesName}
          onChange={(seriesName) => onChange({ seriesName })}
          onPick={(s) => onChange({ category: s.category })}
          options={openSeries}
          inputClassName={input}
        />
        {isNewSeries && <span className="text-[11px] text-muted">A new series will be created.</span>}
      </div>

      <div className={cx('grid gap-2', draft.kind === 'task' ? 'grid-cols-2' : 'grid-cols-1')}>
        <div className={field}>
          <label htmlFor="new-item-date" className={label}>Date</label>
          <input
            id="new-item-date"
            type="date"
            className={input}
            value={draft.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </div>
        {draft.kind === 'task' && (
          <div className={field}>
            <label htmlFor="new-item-priority" className={label}>Priority</label>
            <select
              id="new-item-priority"
              className={input}
              value={draft.priority}
              onChange={(e) => onChange({ priority: e.target.value as Priority })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={field}>
          <label htmlFor="new-item-start" className={label}>Start</label>
          <input
            id="new-item-start"
            type="time"
            step={300}
            className={input}
            value={draft.start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className={field}>
          <label htmlFor="new-item-end" className={label}>End</label>
          <input
            id="new-item-end"
            type="time"
            step={300}
            className={input}
            value={draft.end}
            aria-invalid={!timesValid}
            aria-describedby={timesValid ? undefined : 'new-item-time-error'}
            onChange={(e) => onChange({ end: e.target.value })}
          />
        </div>
      </div>
      {!timesValid && (
        <p id="new-item-time-error" className="-mt-1.5 text-[11px] font-medium text-overdue">End must be after start.</p>
      )}

      {draft.kind === 'meeting' && (
        <div className={field}>
          <label htmlFor="new-item-agenda" className={label}>
            Agenda <span className="font-medium normal-case tracking-normal text-faint">· optional, one item per line</span>
          </label>
          <textarea
            id="new-item-agenda"
            rows={3}
            className={cx(input, 'h-auto resize-none py-2 leading-[1.4]')}
            placeholder={'Goals for the session\nOpen questions'}
            value={draft.agenda}
            onChange={(e) => onChange({ agenda: e.target.value })}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className={cx(btnSmall, btnRect, btnOutline)} onClick={onCancel}>Cancel</button>
        <button
          type="submit"
          disabled={!valid}
          className={cx(btnSmall, btnRect, btnPrimary, 'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100')}
        >
          {editing ? 'Save changes' : `Create ${noun}`}
        </button>
      </div>
    </form>
  );
}
