import { useState, type ReactNode } from 'react';
import { SAMPLE_SERIES, buildMeetings, buildTasks } from '../data/sampleData';
import { dateKey, startOfDay } from '../lib/date';
import type { CategoryKey, Meeting, Series, Task } from '../types';
import { PlannerContext, type PlannerStore } from './PlannerContext';

const byStart = (a: Meeting, b: Meeting) => a.start.getTime() - b.start.getTime();
const withTiming = (m: Meeting): Meeting => ({
  ...m,
  minutes: Math.round((m.end.getTime() - m.start.getTime()) / 60000),
  dayKey: dateKey(m.start),
});

/** In-memory data shared by the dashboard and the moment page. Replace with your calendar / task API. */
export default function PlannerProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => startOfDay(new Date()));
  const [meetings, setMeetings] = useState(() => buildMeetings(today));
  const [tasks, setTasks] = useState<Task[]>(() => buildTasks(meetings, today));
  const [series, setSeries] = useState<Series[]>(SAMPLE_SERIES);

  const ensureSeries = (name: string, category: CategoryKey) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = series.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const created: Series = { id: `s-${crypto.randomUUID()}`, name: trimmed, category };
    setSeries((ss) => [...ss, created]);
    return created.id;
  };

  const store: PlannerStore = {
    today,
    meetings,
    tasks,
    series,
    setTasks,
    addMeeting: (m) => setMeetings((ms) => [...ms, withTiming(m)].sort(byStart)),
    updateMeeting: (id, patch) =>
      setMeetings((ms) => ms.map((m) => (m.id === id ? withTiming({ ...m, ...patch }) : m)).sort(byStart)),
    deleteMeeting: (id) => {
      setMeetings((ms) => ms.filter((m) => m.id !== id));
      setTasks((ts) => ts.map((t) => (t.meetingId === id ? { ...t, meetingId: null } : t)));
    },
    ensureSeries,
  };

  return <PlannerContext value={store}>{children}</PlannerContext>;
}
