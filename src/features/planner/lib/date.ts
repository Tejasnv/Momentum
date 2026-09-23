import type { Meeting, RelativeLabel } from '../types';

export const DOW_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const DOW_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-date key, e.g. "2026-09-22". */
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Monday of the week containing d. */
export const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

/** 0 = Monday … 6 = Sunday */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 864e5);

export const fmtTime = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const fmtTimeShort = (d: Date) => {
  const m = d.getMinutes();
  return `${d.getHours() % 12 || 12}${m ? ':' + pad(m) : ''}`;
};

export const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
};

export const fmtLongDate = (d: Date) =>
  `${DOW_LONG[weekdayIndex(d)]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

/** ISO-8601 week number. */
export const isoWeek = (d: Date) => {
  const thursday = addDays(startOfWeek(d), 3);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  return 1 + Math.floor((thursday.getTime() - jan1.getTime()) / 864e5 / 7);
};

/** Minutes since midnight → "HH:MM" (the value format of <input type="time">). */
export const minutesToTime = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** "HH:MM" → minutes since midnight, or NaN if empty. */
export const timeToMinutes = (t: string) => {
  if (!t) return NaN;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Date key + "HH:MM" → Date. */
export const atTime = (key: string, time: string) => {
  const d = parseKey(key);
  const min = timeToMinutes(time);
  d.setHours(Math.floor(min / 60), min % 60, 0, 0);
  return d;
};

/** Human label for how soon a meeting is. */
export function relativeLabel(m: Meeting, now: Date, today: Date): RelativeLabel {
  const t = now.getTime();
  if (t >= m.start.getTime() && t < m.end.getTime()) return { text: 'In progress', tone: 'live' };
  if (m.end.getTime() <= t) return { text: 'Ended', tone: 'muted' };
  const days = daysBetween(today, m.start);
  if (days === 0) {
    const mins = Math.round((m.start.getTime() - t) / 60000);
    return { text: mins < 60 ? `In ${mins} min` : `In ${Math.round(mins / 60)} h`, tone: 'soon' };
  }
  if (days === 1) return { text: 'Tomorrow', tone: 'default' };
  return { text: `In ${days} days`, tone: 'muted' };
}
