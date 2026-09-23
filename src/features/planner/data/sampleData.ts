// Sample data — replace with your calendar / task API.
// Meetings are generated relative to "today" so the dashboard always looks current.
import { addDays, dateKey, startOfWeek } from '../lib/date';
import type { AttendeeStatus, Category, CategoryKey, Meeting, Priority, Series, Task } from '../types';

export const CATEGORIES: Record<CategoryKey, Category> = {
  team:   { label: 'Team',   fg: '#1b5049', bg: '#e1efea', border: '#a9cfc5', dot: '#2f7d74' },
  client: { label: 'Client', fg: '#7d3718', bg: '#f7e5da', border: '#e5b89f', dot: '#c2653d' },
  one:    { label: '1:1',    fg: '#4d3673', bg: '#ece4f5', border: '#c7b5e0', dot: '#7a5aa6' },
  review: { label: 'Review', fg: '#5f4a0c', bg: '#f4ecd2', border: '#dcc98b', dot: '#b08a1e' },
};

const PEOPLE = {
  maya: 'Maya Chen', dev: 'Dev Patel', sara: 'Sara Lindqvist', omar: 'Omar Haddad',
  lena: 'Lena Brooks', kai: 'Kai Tanaka', rosa: 'Rosa Alvarez', you: 'You',
};

type PersonKey = keyof typeof PEOPLE;

const AGENDA: Record<CategoryKey, string[]> = {
  team: ['Review last week’s outcomes', 'Walk through open blockers', 'Agree owners and next steps'],
  client: ['Progress since the last call', 'Open questions from their side', 'Next milestones and dates'],
  one: ['Wins and blockers', 'Growth goals check-in', 'Anything else on your mind'],
  review: ['Context and goals', 'Walkthrough of findings', 'Decisions needed today'],
};

const NOTES: Record<CategoryKey, string> = {
  team: 'Bring updates on your own tickets. Decisions get logged in the team channel afterwards.',
  client: 'Share the latest status doc 30 minutes before. Keep the call to the agenda — follow-ups go by email.',
  one: 'Private notes. Carry over any open actions from the last 1:1.',
  review: 'Pre-read is attached to the invite. Come with comments; the session is for decisions, not first reads.',
};

export const SAMPLE_SERIES: Series[] = [
  { id: 's-sprint', name: 'Sprint cycle', category: 'team' },
  { id: 's-harbor', name: 'Harbor & Co.', category: 'client' },
  { id: 's-fernhill', name: 'Fernhill', category: 'client' },
  { id: 's-roadmap', name: 'Q4 roadmap', category: 'review' },
  { id: 's-hiring', name: 'Hiring', category: 'team' },
  { id: 's-dev', name: '1:1s with Dev', category: 'one' },
  { id: 's-maya', name: '1:1s with Maya', category: 'one' },
];

const TITLE_SERIES: Record<string, string> = {
  'Sprint planning': 's-sprint', 'Sprint kickoff': 's-sprint', 'Sprint demo': 's-sprint', Retro: 's-sprint',
  'Discovery — Harbor & Co.': 's-harbor', 'Harbor & Co. weekly': 's-harbor', 'Harbor & Co. onboarding': 's-harbor',
  'Contract walkthrough': 's-harbor', 'Harbor & Co. QBR': 's-harbor',
  'Pricing proposal — Fernhill': 's-fernhill', 'Fernhill workshop': 's-fernhill', 'Fernhill check-in': 's-fernhill',
  'Q4 roadmap review': 's-roadmap', 'Roadmap sign-off': 's-roadmap',
  'Onboarding session': 's-hiring', 'Hiring debrief': 's-hiring',
  '1:1 with Dev': 's-dev', '1:1 with Maya': 's-maya',
};

// [weekOffset, weekday (0 = Mon), startHour, minutes, category, title, location, organizer, attendees]
type Template = [number, number, number, number, CategoryKey, string, string, PersonKey, PersonKey[]];

const TEMPLATES: Template[] = [
  [-3, 2, 14, 60, 'review', 'Budget review', 'Board room', 'sara', ['sara', 'omar']],
  [-3, 4, 11, 45, 'team', 'Onboarding session', 'Room 4B', 'maya', ['maya', 'kai', 'lena']],
  [-2, 1, 13, 60, 'client', 'Discovery — Harbor & Co.', 'Video call', 'you', ['rosa', 'omar']],
  [-2, 3, 10, 90, 'team', 'Offsite prep', 'Studio', 'lena', ['lena', 'maya', 'dev']],
  [-1, 0, 9.5, 45, 'team', 'Sprint planning', 'Room 4B', 'maya', ['maya', 'dev', 'kai', 'lena']],
  [-1, 1, 14, 45, 'client', 'Harbor & Co. weekly', 'Video call', 'you', ['rosa']],
  [-1, 2, 11, 30, 'one', '1:1 with Dev', 'Room 2A', 'you', ['dev']],
  [-1, 3, 15, 60, 'review', 'Q3 retrospective', 'Board room', 'sara', ['sara', 'maya', 'omar']],
  [-1, 4, 9.5, 30, 'one', '1:1 with Maya', 'Room 2A', 'maya', ['maya']],
  [0, 0, 9.5, 45, 'team', 'Sprint planning', 'Room 4B', 'maya', ['maya', 'dev', 'kai', 'lena']],
  [0, 0, 14, 60, 'client', 'Harbor & Co. onboarding', 'Video call', 'you', ['rosa', 'omar']],
  [0, 1, 10, 30, 'one', '1:1 with Dev', 'Room 2A', 'you', ['dev']],
  [0, 1, 13, 90, 'review', 'Q4 roadmap review', 'Board room', 'sara', ['sara', 'maya', 'omar', 'kai']],
  [0, 1, 16, 30, 'team', 'Design crit', 'Studio', 'lena', ['lena', 'kai']],
  [0, 2, 9, 60, 'client', 'Contract walkthrough', 'Video call', 'omar', ['omar', 'rosa']],
  [0, 2, 11, 45, 'team', 'Hiring debrief', 'Room 4B', 'maya', ['maya', 'sara']],
  [0, 2, 15, 60, 'review', 'Analytics deep dive', 'Board room', 'kai', ['kai', 'dev']],
  [0, 2, 15.5, 30, 'one', '1:1 with Lena', 'Room 2A', 'you', ['lena']],
  [0, 3, 10, 60, 'team', 'Backlog grooming', 'Room 4B', 'dev', ['dev', 'kai', 'lena']],
  [0, 3, 14, 45, 'client', 'Harbor & Co. weekly', 'Video call', 'you', ['rosa']],
  [0, 4, 9.5, 30, 'one', '1:1 with Maya', 'Room 2A', 'maya', ['maya']],
  [0, 4, 12, 60, 'team', 'Team lunch', 'Canteen', 'lena', ['maya', 'dev', 'kai', 'lena', 'sara']],
  [0, 4, 15, 60, 'review', 'Sprint demo', 'Board room', 'maya', ['maya', 'dev', 'kai', 'lena', 'sara']],
  [1, 0, 10, 60, 'team', 'Sprint kickoff', 'Room 4B', 'maya', ['maya', 'dev', 'kai', 'lena']],
  [1, 1, 11, 45, 'client', 'Pricing proposal — Fernhill', 'Video call', 'omar', ['omar', 'rosa']],
  [1, 2, 14, 60, 'review', 'Security review', 'Board room', 'kai', ['kai', 'dev', 'sara']],
  [1, 3, 9.5, 30, 'one', '1:1 with Omar', 'Room 2A', 'you', ['omar']],
  [1, 3, 13, 90, 'client', 'Fernhill workshop', 'Fernhill office', 'you', ['omar', 'rosa', 'lena']],
  [1, 4, 16, 30, 'team', 'Retro', 'Studio', 'lena', ['maya', 'dev', 'kai', 'lena']],
  [2, 0, 10, 120, 'team', 'Quarterly planning', 'Board room', 'sara', ['sara', 'maya', 'dev', 'kai', 'lena']],
  [2, 2, 13, 60, 'client', 'Harbor & Co. QBR', 'Video call', 'you', ['rosa', 'omar', 'sara']],
  [2, 3, 11, 30, 'one', '1:1 with Sara', 'Room 2A', 'sara', ['sara']],
  [2, 4, 14, 60, 'review', 'Design system audit', 'Studio', 'lena', ['lena', 'kai']],
  [3, 1, 10, 60, 'team', 'All-hands', 'Auditorium', 'sara', ['sara', 'maya', 'dev', 'kai', 'lena', 'omar']],
  [3, 3, 15, 45, 'client', 'Fernhill check-in', 'Video call', 'omar', ['omar']],
  [4, 0, 11, 60, 'review', 'Roadmap sign-off', 'Board room', 'sara', ['sara', 'maya']],
  [4, 2, 14, 30, 'team', 'Hack day kickoff', 'Studio', 'kai', ['kai', 'dev', 'lena']],
];

const STATUS: AttendeeStatus[] = ['Accepted', 'Accepted', 'Tentative', 'Accepted'];

export function buildMeetings(today: Date): Meeting[] {
  const monday = startOfWeek(today);
  return TEMPLATES.map(([wk, wd, hour, minutes, cat, title, loc, org, att], i): Meeting => {
    const day = addDays(monday, wk * 7 + wd);
    const start = new Date(day);
    start.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
    const end = new Date(start.getTime() + minutes * 60000);
    const people = att.map((k, j) => ({ name: PEOPLE[k], status: STATUS[(i + j) % 4] }));
    people.unshift({ name: 'You', status: 'Accepted' });
    return {
      id: `m${i}`,
      start,
      end,
      minutes,
      category: cat,
      title,
      location: loc,
      hasVideo: loc === 'Video call' || cat === 'one',
      organizer: PEOPLE[org],
      people,
      agenda: AGENDA[cat],
      notes: NOTES[cat],
      seriesId: TITLE_SERIES[title] ?? null,
      dayKey: dateKey(day),
    };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function buildTasks(meetings: Meeting[], today: Date): Task[] {
  const now = Date.now();
  const find = (title: string) =>
    (meetings.find((m) => m.title === title && m.end.getTime() > now) ||
      meetings.find((m) => m.title === title))?.id ?? null;

  // [id, title, due in days from today (negative = overdue), priority, linked meeting, done]
  const rows: [string, string, number, Priority, string | null, boolean][] = [
    ['t1', 'Prep slides for the Q4 roadmap review', 0, 'High', find('Q4 roadmap review'), false],
    ['t2', 'Send revised SOW to Harbor & Co.', 1, 'High', find('Harbor & Co. weekly'), false],
    ['t6', 'Update hiring scorecard', -1, 'Medium', find('Hiring debrief'), false],
    ['t5', 'Review analytics dashboard draft', 1, 'Low', find('Analytics deep dive'), false],
    ['t4', 'Write feedback notes for Dev', 3, 'Medium', null, false],
    ['t8', 'Draft pricing options for Fernhill', 5, 'Medium', find('Pricing proposal — Fernhill'), false],
    ['t3', 'Book room for Fernhill workshop', 2, 'Low', find('Fernhill workshop'), true],
    ['t7', 'Share sprint notes with the team', -1, 'Low', null, true],
  ];
  return rows.map(([id, title, dueIn, priority, meetingId, done]) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    return {
      id, title, due: addDays(today, dueIn), start: null, end: null, priority,
      category: meeting?.category ?? null, seriesId: meeting?.seriesId ?? null, meetingId, done,
    };
  });
}
