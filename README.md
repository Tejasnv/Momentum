# Momentum

A React dashboard for keeping track of your meetings and tasks — see the month at a glance, plan the week hour by hour, and keep the details of every meeting one click away.


<img width="1138" height="618" alt="Momentum_01" src="https://github.com/user-attachments/assets/95137000-c2b8-400f-a31e-2ceeb611092f" />




## Features

- **Month overview** — a calendar with small coloured dots under each day showing how many meetings it holds, colour-coded by type (Team, Client, 1:1, Review).
- **Week view** — pick any date and its whole week opens in a time-slot grid. Meetings sit in their time slots, overlapping ones line up side by side, and a red line marks the current time.
- **Quick view on hover** — hover over a meeting to see its time, location and attendees without leaving the week.
- **Meeting details** — click any meeting to open its full details: date, time, duration, location, organiser, attendees with RSVP status, agenda and notes.
- **Upcoming meetings** — a clickable list of what's next, grouped by day. Selecting one jumps the calendar to that week.
- **Tasks** — a checklist with due dates, priorities and overdue flags. Tasks can link to a meeting, which opens with one click.
- **Weekly stats** — meetings this week, hours booked and open tasks, shown in the header.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for the dev server and builds
- Plain CSS with design tokens (no UI library)

## Getting started

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/Tejasnv/momentum.git
cd momentum
npm install
npm run dev
```

Then open http://localhost:5173.

### Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload      |
| `npm run build`   | Type-check and build for production       |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Run ESLint                                |

## Data

Momentum currently runs on **sample meetings and tasks**, generated relative to today's date so the dashboard always looks current. To connect real data, replace the sample data module with calls to your calendar and task APIs — each meeting needs a start and end time, title, category, location, organiser, attendees, agenda and notes.

## Roadmap

- [ ] Create and edit meetings
- [ ] Connect a real calendar (e.g. Google Calendar, Outlook)
- [ ] Add, edit and persist tasks
- [ ] Dark mode
- [ ] Drag to reschedule in the week view

## License

[MIT](LICENSE) — or choose your own.
