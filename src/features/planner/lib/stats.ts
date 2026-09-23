import type { Meeting } from '../types';
import { addDays, dateKey, startOfWeek } from './date';

/** Count and booked hours (1 decimal) of the meetings in the Monday–Sunday week containing `date`. */
export function weekStats(meetings: Meeting[], date: Date) {
  const start = startOfWeek(date);
  const keys = new Set(Array.from({ length: 7 }, (_, i) => dateKey(addDays(start, i))));
  const inWeek = meetings.filter((m) => keys.has(m.dayKey));
  const minutes = inWeek.reduce((sum, m) => sum + m.minutes, 0);
  return { count: inWeek.length, hours: Math.round((minutes / 60) * 10) / 10 };
}
