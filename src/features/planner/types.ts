export type CategoryKey = 'team' | 'client' | 'one' | 'review';

export interface Category {
  label: string;
  fg: string;
  bg: string;
  border: string;
  dot: string;
}

export type AttendeeStatus = 'Accepted' | 'Tentative';

export interface Person {
  name: string;
  status: AttendeeStatus;
}

export interface Meeting {
  id: string;
  start: Date;
  end: Date;
  minutes: number;
  category: CategoryKey;
  title: string;
  location: string;
  hasVideo: boolean;
  organizer: string;
  people: Person[];
  agenda: string[];
  notes: string;
  seriesId: string | null;
  /** Local-date key of the meeting's day, e.g. "2026-09-22". */
  dayKey: string;
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  /** Start of the day the task is due. */
  due: Date;
  /** Optional time block on the week grid. */
  start: Date | null;
  end: Date | null;
  priority: Priority;
  category: CategoryKey | null;
  seriesId: string | null;
  meetingId: string | null;
  done: boolean;
}

/** A named group of related meetings and tasks, e.g. a client engagement or recurring 1:1. */
export interface Series {
  id: string;
  name: string;
  category: CategoryKey;
}

export interface OpenSeries extends Series {
  /** Upcoming meetings plus open tasks in the series. */
  openCount: number;
}

export type ItemKind = 'meeting' | 'task';

/** Form state for an item being created or edited from the week view. */
export interface Draft {
  /** Meeting being edited, or null when creating. */
  editingId: string | null;
  kind: ItemKind;
  title: string;
  category: CategoryKey;
  priority: Priority;
  seriesName: string;
  /** Free text, one agenda item per line (meetings only). */
  agenda: string;
  /** Date key and "HH:MM" times, in the formats native date/time inputs use. */
  date: string;
  start: string;
  end: string;
  /** Slot the popover is anchored to; stays put while the times are edited. */
  anchorDate: string;
  anchorMin: number;
}

export type Tone = 'live' | 'soon' | 'default' | 'muted' | 'warn' | 'overdue';

export interface RelativeLabel {
  text: string;
  tone: Tone;
}

export interface ViewMonth {
  year: number;
  month: number;
}

export type MeetingsByDay = Record<string, Meeting[]>;
