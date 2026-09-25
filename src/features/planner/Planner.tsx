import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import MeetingDetails from './components/MeetingDetails';
import MonthCalendar from './components/MonthCalendar';
import TaskList from './components/TaskList';
import UpcomingList from './components/UpcomingList';
import WeekView from './components/WeekView';
import { addDays, atTime, dateKey, minutesToTime, parseKey, startOfDay, startOfWeek, timeToMinutes } from './lib/date';
import { openSeriesOf } from './lib/series';
import { btn, btnOutline, btnPill, btnPrimary, cx } from './lib/ui';
import { weekStats } from './lib/stats';
import { Plus } from './components/Icons';
import { usePlanner } from './store/PlannerContext';
import type { Draft, Meeting, MeetingsByDay, Task, ViewMonth } from './types';

const col = 'flex min-h-0 shrink-0 flex-col gap-5 max-[1180px]:w-full';

// Slots the "New moment" button may pick, matching the week grid's visible hours.
const FIRST_SLOT = 8 * 60;
const LAST_SLOT = 18 * 60 + 30;
const DEFAULT_MINUTES = 30;

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();
const parseAgenda = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
const searchableText = (values: (string | null | undefined)[]) =>
  values.filter(Boolean).join(' ').toLocaleLowerCase();

const newDraft = (day: Date, startMin: number): Draft => ({
  editingId: null,
  kind: 'meeting',
  title: '',
  category: 'team',
  priority: 'Medium',
  seriesName: '',
  agenda: '',
  date: dateKey(day),
  start: minutesToTime(startMin),
  end: minutesToTime(startMin + DEFAULT_MINUTES),
  anchorDate: dateKey(day),
  anchorMin: startMin,
});

export default function Planner() {
  const { today, meetings, tasks, series, setTasks, addMeeting, updateMeeting, deleteMeeting, ensureSeries } =
    usePlanner();

  // "now" ticks every minute so the time line and relative labels stay fresh.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // The selected moment lives in the URL (?moment=<id>) so returning from its page restores it.
  const [params, setParams] = useSearchParams();
  const [defaultId] = useState(() => meetings.find((m) => m.end.getTime() > Date.now())?.id ?? null);
  const selectedId = params.get('moment') ?? defaultId;
  const setSelectedId = (id: string) => setParams({ moment: id }, { replace: true });

  // Open on the linked moment's day, otherwise today.
  const [selectedDate, setSelectedDate] = useState(
    () => meetings.find((m) => m.id === params.get('moment'))?.dayKey ?? dateKey(today),
  );
  const [viewMonth, setViewMonth] = useState<ViewMonth>(() => {
    const d = parseKey(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput.trim().toLocaleLowerCase()), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const meetingsById = useMemo(() => Object.fromEntries(meetings.map((m) => [m.id, m])), [meetings]);
  const filteredMeetings = useMemo(() => {
    if (!searchQuery) return meetings;
    return meetings.filter((m) => {
      const seriesName = series.find((s) => s.id === m.seriesId)?.name;
      return searchableText([
        m.title, m.category, m.location, m.organizer, m.notes, m.dayKey,
        m.start.toLocaleString(), m.end.toLocaleString(), String(m.minutes), String(m.hasVideo),
        ...m.people.flatMap((person) => [person.name, person.status]),
        ...m.agenda,
        seriesName,
      ]).includes(searchQuery);
    });
  }, [meetings, searchQuery, series]);
  const filteredMeetingsById = useMemo(
    () => Object.fromEntries(filteredMeetings.map((m) => [m.id, m])),
    [filteredMeetings],
  );
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter((t) => {
      const seriesName = series.find((s) => s.id === t.seriesId)?.name;
      const linkedMeeting = t.meetingId ? meetingsById[t.meetingId] : null;
      return searchableText([
        t.title, t.priority, t.category, t.due.toLocaleDateString(), seriesName,
        linkedMeeting?.title,
      ]).includes(searchQuery);
    });
  }, [meetingsById, searchQuery, series, tasks]);

  const meetingsByDay = useMemo(() => {
    const map: MeetingsByDay = {};
    filteredMeetings.forEach((m) => (map[m.dayKey] ??= []).push(m));
    return map;
  }, [filteredMeetings]);

  const openSeries = openSeriesOf(series, meetings, tasks, now);

  const selDate = parseKey(selectedDate);
  const weekStart = startOfWeek(selDate);

  const goToDate = (d: Date) => {
    setSelectedDate(dateKey(d));
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const selectMeeting = (m: Meeting) => {
    setSelectedId(m.id);
    goToDate(m.start);
  };

  const selectTask = (t: Task) => {
    setSelectedTaskId(t.id);
    goToDate(t.start ?? t.due);
  };

  // Picking another slot while the form is open moves it (or the meeting being edited) and keeps what was typed.
  const openDraft = (day: Date, startMin: number, keep = true) => {
    goToDate(day);
    setDraft((d) => {
      const fresh = newDraft(day, startMin);
      if (!d || !keep) return fresh;
      const duration = timeToMinutes(d.end) - timeToMinutes(d.start);
      const end = duration > 0 ? minutesToTime(Math.min(startMin + duration, 23 * 60 + 59)) : fresh.end;
      return { ...d, date: fresh.date, start: fresh.start, end, anchorDate: fresh.anchorDate, anchorMin: startMin };
    });
  };

  // Header button: the next half-hour today (or 9 AM on another selected day), within the grid's hours.
  const openDraftFromHeader = () => {
    const day = parseKey(selectedDate);
    const sameDay = dateKey(day) === dateKey(today);
    const next = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30;
    openDraft(day, sameDay ? Math.min(Math.max(next, FIRST_SLOT), LAST_SLOT) : 9 * 60, false);
  };

  const editMeeting = (m: Meeting) => {
    selectMeeting(m);
    setDraft({
      editingId: m.id,
      kind: 'meeting',
      title: m.title,
      category: m.category,
      priority: 'Medium',
      seriesName: series.find((s) => s.id === m.seriesId)?.name ?? '',
      agenda: m.agenda.join('\n'),
      date: m.dayKey,
      start: minutesToTime(minutesOfDay(m.start)),
      end: minutesToTime(minutesOfDay(m.end)),
      anchorDate: m.dayKey,
      anchorMin: minutesOfDay(m.start),
    });
  };

  const updateDraft = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const cancelDraft = useCallback(() => setDraft(null), []);

  const saveDraft = () => {
    if (!draft) return;
    const start = atTime(draft.date, draft.start);
    const end = atTime(draft.date, draft.end);
    const title = draft.title.trim();

    // Reuse a series with the same name (open or not), otherwise start a new one.
    const seriesId = ensureSeries(draft.seriesName, draft.category);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const agenda = parseAgenda(draft.agenda);

    if (draft.editingId) {
      const id = draft.editingId;
      updateMeeting(id, { title, category: draft.category, start, end, seriesId, agenda });
      setSelectedId(id);
    } else if (draft.kind === 'meeting') {
      const meeting: Meeting = {
        id: `m-${crypto.randomUUID()}`,
        start,
        end,
        minutes,
        category: draft.category,
        title,
        location: 'No location set',
        hasVideo: false,
        organizer: 'You',
        people: [{ name: 'You', status: 'Accepted' }],
        agenda,
        notes: '',
        seriesId,
        dayKey: draft.date,
      };
      addMeeting(meeting);
      setSelectedId(meeting.id);
    } else {
      const task: Task = {
        id: `t-${crypto.randomUUID()}`,
        title,
        due: startOfDay(start),
        start,
        end,
        priority: draft.priority,
        category: draft.category,
        seriesId,
        meetingId: null,
        done: false,
      };
      setTasks((ts) => [task, ...ts]);
      setSelectedTaskId(task.id);
    }
    goToDate(start);
    setDraft(null);
  };

  const removeMeeting = (id: string) => {
    deleteMeeting(id);
    setDraft((d) => (d?.editingId === id ? null : d));
    setParams({}, { replace: true });
  };

  const toggleTask = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const selectedMeeting = selectedId ? filteredMeetingsById[selectedId] ?? null : null;
  const week = weekStats(filteredMeetings, selDate);

  return (
    <div className="planner flex h-dvh min-h-[720px] flex-col gap-5 bg-ground p-6 font-body text-[14px] leading-[normal] tracking-normal text-ink scheme-light max-[1180px]:h-auto max-[1180px]:min-h-dvh">
      <Header
        today={today}
        weekCount={week.count}
        weekHours={week.hours}
        openTasks={filteredTasks.filter((t) => !t.done).length}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      >
        <button type="button" className={cx(btn, btnPill, btnOutline)} onClick={() => goToDate(today)}>Today</button>
        <button type="button" data-new-item className={cx(btn, btnPill, btnPrimary)} onClick={openDraftFromHeader}>
          <Plus />New moment
        </button>
      </Header>

      <main className="flex min-h-0 flex-1 gap-5 max-[1180px]:flex-col">
        <div className={cx(col, 'w-[316px]')}>
          <MonthCalendar
            viewMonth={viewMonth}
            onChangeMonth={setViewMonth}
            selectedDate={selectedDate}
            today={today}
            meetingsByDay={meetingsByDay}
            onPickDate={goToDate}
          />
          <UpcomingList
            meetings={filteredMeetings}
            now={now}
            today={today}
            selectedId={selectedId}
            onSelect={selectMeeting}
          />
        </div>

        <WeekView
          weekStart={weekStart}
          selectedDate={selectedDate}
          today={today}
          now={now}
          meetingsByDay={meetingsByDay}
          tasks={filteredTasks}
          selectedId={selectedId}
          selectedTaskId={selectedTaskId}
          onSelect={selectMeeting}
          onEditMeeting={editMeeting}
          onSelectTask={selectTask}
          draft={draft}
          onSlotClick={openDraft}
          onDraftChange={updateDraft}
          onDraftSubmit={saveDraft}
          onDraftCancel={cancelDraft}
          series={series}
          openSeries={openSeries}
          onPickDate={goToDate}
          onPrevWeek={() => goToDate(addDays(selDate, -7))}
          onNextWeek={() => goToDate(addDays(selDate, 7))}
        />

        <div className={cx(col, 'w-[340px]')}>
          <MeetingDetails
            meeting={selectedMeeting}
            series={series.find((s) => s.id === selectedMeeting?.seriesId) ?? null}
            onEdit={editMeeting}
            onDelete={removeMeeting}
            now={now}
            today={today}
          />
          <TaskList
            tasks={filteredTasks}
            today={today}
            meetingsById={filteredMeetingsById}
            selectedId={selectedTaskId}
            onToggle={toggleTask}
            onOpenMeeting={selectMeeting}
          />
        </div>
      </main>
    </div>
  );
}
