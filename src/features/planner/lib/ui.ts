// Shared Tailwind class strings for the planner, mirroring the original stylesheet's
// reusable classes (.card, .btn, .icon-btn, …). Spacing and gap are left to each call
// site so utilities never conflict.
import type { Tone } from '../types';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export const display = 'font-display font-normal';

export const card = 'flex flex-col rounded-card border border-line bg-card';
export const cardHead = 'flex items-center justify-between gap-2';
export const cardTitle = `${display} text-[24px]`;
export const scroll = 'min-h-0 flex-1 overflow-y-auto';
export const nav = 'flex gap-1';

const btnBase = 'inline-flex cursor-pointer items-center gap-2 font-medium';
export const btn = `${btnBase} h-11`;
export const btnSmall = `${btnBase} h-9`;
export const btnRect = 'rounded-xl px-4 text-[13px]';
export const btnPill = 'rounded-full px-[18px] text-[14px]';
export const btnPrimary = 'border-none bg-accent text-accent-ink hover:brightness-110';
export const btnOutline = 'border border-line-strong bg-card text-ink hover:bg-band';
export const iconBtn =
  'grid size-9 cursor-pointer place-items-center rounded-[10px] border border-line bg-card p-0 text-ink hover:bg-band';

export const input =
  'h-9 w-full min-w-0 rounded-[10px] border border-line-strong bg-card px-2.5 text-[13px] text-ink placeholder:text-faint';

export const label = 'text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
export const small = 'text-[12px]';
export const rel = 'whitespace-nowrap text-[11px] font-medium';

export const TONE: Record<Tone, string> = {
  live: 'text-live',
  soon: 'text-soon',
  default: 'text-ink-2',
  muted: 'text-muted',
  warn: 'text-warn',
  overdue: 'text-overdue',
};
