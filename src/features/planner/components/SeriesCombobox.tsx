import { useId, useState, type KeyboardEvent } from 'react';
import { CATEGORIES } from '../data/sampleData';
import { cx } from '../lib/ui';
import type { OpenSeries } from '../types';
import Dot from './Dot';
import { Plus } from './Icons';

type Option = { kind: 'series'; series: OpenSeries } | { kind: 'new'; name: string };

interface SeriesComboboxProps {
  id: string;
  value: string;
  onChange: (name: string) => void;
  /** Called when an existing series is picked from the list. */
  onPick: (series: OpenSeries) => void;
  options: OpenSeries[];
  inputClassName: string;
}

/** Typeahead over the open series, with an option to start a new one. */
export default function SeriesCombobox({ id, value, onChange, onPick, options, inputClassName }: SeriesComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = value.trim();
  const q = query.toLowerCase();
  const matches = options.filter((s) => s.name.toLowerCase().includes(q));
  const exact = options.some((s) => s.name.toLowerCase() === q);
  const items: Option[] = [
    ...matches.map((series): Option => ({ kind: 'series', series })),
    ...(query && !exact ? [{ kind: 'new', name: query } as const] : []),
  ];
  const activeIndex = Math.min(active, items.length - 1);
  const showList = open && items.length > 0;

  const choose = (o: Option) => {
    if (o.kind === 'series') {
      onChange(o.series.name);
      onPick(o.series);
    } else {
      onChange(o.name);
    }
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(0); return; }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + items.length) % items.length);
    } else if (e.key === 'Enter' && showList) {
      e.preventDefault();
      choose(items[activeIndex]);
    } else if (e.key === 'Escape' && showList) {
      // Close the list only; a second Escape closes the popover.
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        placeholder="Search or add a series"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${activeIndex}` : undefined}
        className={inputClassName}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-[10px] border border-line bg-card p-1 shadow-[0_8px_24px_rgba(28,27,24,0.14)]"
        >
          {items.map((o, i) => (
            <li
              key={o.kind === 'series' ? o.series.id : 'new'}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // mousedown + preventDefault keeps focus in the input so blur doesn't close the list first
              onMouseDown={(e) => { e.preventDefault(); choose(o); }}
              onMouseEnter={() => setActive(i)}
              className={cx(
                'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]',
                i === activeIndex && 'bg-band',
              )}
            >
              {o.kind === 'series' ? (
                <>
                  <Dot color={CATEGORIES[o.series.category].dot} size="md" />
                  <span className="min-w-0 flex-1 truncate">{o.series.name}</span>
                  <span className="text-[11px] text-muted">{o.series.openCount} open</span>
                </>
              ) : (
                <>
                  <span className="text-accent"><Plus /></span>
                  <span className="min-w-0 flex-1 truncate">Add “{o.name}” as new series</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
