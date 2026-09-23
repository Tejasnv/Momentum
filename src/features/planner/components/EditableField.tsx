import { useState, type ReactNode } from 'react';
import { btnOutline, btnPrimary, btnRect, btnSmall, cx, label as labelCls } from '../lib/ui';
import { PencilIcon } from './Icons';

interface EditableFieldProps<T> {
  label: string;
  value: T;
  /** Read-only rendering of the current value. */
  children: ReactNode;
  renderEditor: (draft: T, setDraft: (next: T) => void) => ReactNode;
  /** Error message for an invalid draft, or null. */
  validate?: (draft: T) => string | null;
  onSave: (draft: T) => void;
}

/** A labelled detail with its own Edit → Save / Cancel cycle. */
export default function EditableField<T>({ label, value, children, renderEditor, validate, onSave }: EditableFieldProps<T>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const error = editing && validate ? validate(draft) : null;

  const start = () => { setDraft(value); setEditing(true); };

  return (
    <div className="flex flex-col gap-2 border-b border-divider py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <h3 className={labelCls}>{label}</h3>
        {!editing && (
          <button
            type="button"
            aria-label={`Edit ${label.toLowerCase()}`}
            onClick={start}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-2 py-1 text-[12px] font-medium text-accent hover:bg-band"
          >
            <PencilIcon />Edit
          </button>
        )}
      </div>

      {editing ? (
        <form
          aria-label={`Edit ${label.toLowerCase()}`}
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (error) return;
            onSave(draft);
            setEditing(false);
          }}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
        >
          {renderEditor(draft, setDraft)}
          {error && <p role="alert" className="text-[11px] font-medium text-overdue">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!!error}
              className={cx(btnSmall, btnRect, btnPrimary, 'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100')}
            >
              Save
            </button>
            <button type="button" className={cx(btnSmall, btnRect, btnOutline)} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        children
      )}
    </div>
  );
}
