import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import EditableField from "../components/EditableField";
import Header from "../components/Header";
import Dot from "../components/Dot";
import {
  ArrowLeft,
  CalendarIcon,
  ClockIcon,
  PinIcon,
  Plus,
  UserIcon,
  VideoIcon,
  XIcon,
} from "../components/Icons";
import SeriesCombobox from "../components/SeriesCombobox";
import { CATEGORIES } from "../data/sampleData";
import {
  atTime,
  fmtDuration,
  fmtLongDate,
  fmtTime,
  minutesToTime,
  relativeLabel,
  timeToMinutes,
} from "../lib/date";
import { openSeriesOf } from "../lib/series";
import { weekStats } from "../lib/stats";
import {
  TONE,
  btn,
  btnOutline,
  btnPill,
  btnPrimary,
  card,
  cx,
  display,
  input,
  rel,
  small,
} from "../lib/ui";
import { usePlanner } from "../store/PlannerContext";
import type { AttendeeStatus, CategoryKey, Meeting, Person } from "../types";

const page =
  "planner flex min-h-dvh flex-col gap-5 bg-ground p-6 font-body text-[14px] leading-[normal] tracking-normal text-ink scheme-light";
const shell = "mx-auto w-full max-w-[1080px]";
const facts =
  "flex items-start gap-2.5 text-[13px] [&_svg]:mt-px [&_svg]:shrink-0 [&_svg]:text-muted";
const textarea = cx(input, "h-auto resize-y py-2 leading-[1.45]");

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();
const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

interface When {
  date: string;
  start: string;
  end: string;
}
interface Place {
  location: string;
  hasVideo: boolean;
}

export default function MomentPage() {
  const { id } = useParams();
  const { today, meetings, tasks, series, updateMeeting, ensureSeries } =
    usePlanner();
  const [now] = useState(() => new Date());
  const m = meetings.find((x) => x.id === id);

  // Same header as the dashboard, with stats for this moment's week and "Back to dashboard" as the main action.
  const week = weekStats(meetings, m?.start ?? today);
  const top = (
    <Header
      homeLink
      today={today}
      weekCount={week.count}
      weekHours={week.hours}
      openTasks={tasks.filter((t) => !t.done).length}
    >
      <Link to="/" className={cx(btn, btnPill, btnOutline, "no-underline")}>
        Today
      </Link>
      <Link
        to={m ? `/?moment=${m.id}` : "/"}
        className={cx(btn, btnPill, btnPrimary, "no-underline")}
      >
        <ArrowLeft />
        Back to dashboard
      </Link>
    </Header>
  );

  if (!m) {
    return (
      <div className={page}>
        {top}
        <main
          className={cx(shell, card, "items-center gap-2 p-10 text-center")}
        >
          <h1 className={cx(display, "text-[30px]")}>Moment not found</h1>
          <p className="text-muted">
            There’s no moment with id “{id}”. Moments created in this session
            are lost when the page reloads.
          </p>
        </main>
      </div>
    );
  }

  const save = (patch: Partial<Meeting>) => updateMeeting(m.id, patch);
  const cat = CATEGORIES[m.category];
  const r = relativeLabel(m, now, today);
  const seriesName = series.find((s) => s.id === m.seriesId)?.name ?? "";
  const openSeries = openSeriesOf(series, meetings, tasks, now);
  const linkedTasks = tasks.filter((t) => t.meetingId === m.id);

  return (
    <div className={page}>
      {top}

      <main
        className={cx(
          shell,
          "grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5 max-[900px]:grid-cols-1",
        )}
      >
        <section className={cx(card, "p-6")} aria-label="Moment">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: cat.bg, color: cat.fg }}
            >
              <Dot color={cat.dot} size="lg" />
              {cat.label}
            </span>
            <span className={cx(rel, TONE[r.tone])}>{r.text}</span>
          </div>

          <EditableField
            label="Name"
            value={m.title}
            validate={(v) => (v.trim() ? null : "Name can’t be empty.")}
            onSave={(v) => save({ title: v.trim() })}
            renderEditor={(v, set) => (
              <input
                autoFocus
                aria-label="Name"
                className={input}
                value={v}
                onChange={(e) => set(e.target.value)}
              />
            )}
          >
            <h1 className={cx(display, "text-[36px] leading-[1.1]")}>
              {m.title}
            </h1>
          </EditableField>

          <EditableField<When>
            label="When"
            value={{
              date: m.dayKey,
              start: minutesToTime(minutesOfDay(m.start)),
              end: minutesToTime(minutesOfDay(m.end)),
            }}
            validate={(v) =>
              !v.date || !v.start || !v.end
                ? "Date, start and end are required."
                : timeToMinutes(v.end) <= timeToMinutes(v.start)
                  ? "End must be after start."
                  : null
            }
            onSave={(v) =>
              save({
                start: atTime(v.date, v.start),
                end: atTime(v.date, v.end),
              })
            }
            renderEditor={(v, set) => (
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 max-[520px]:grid-cols-1">
                <input
                  autoFocus
                  aria-label="Date"
                  type="date"
                  className={input}
                  value={v.date}
                  onChange={(e) => set({ ...v, date: e.target.value })}
                />
                <input
                  aria-label="Start"
                  type="time"
                  step={300}
                  className={input}
                  value={v.start}
                  onChange={(e) => set({ ...v, start: e.target.value })}
                />
                <input
                  aria-label="End"
                  type="time"
                  step={300}
                  className={input}
                  value={v.end}
                  onChange={(e) => set({ ...v, end: e.target.value })}
                />
              </div>
            )}
          >
            <div className="flex flex-col gap-2">
              <p className={facts}>
                <CalendarIcon />
                <span>{fmtLongDate(m.start)}</span>
              </p>
              <p className={facts}>
                <ClockIcon />
                <span>
                  {fmtTime(m.start)} – {fmtTime(m.end)}{" "}
                  <span className="text-muted">· {fmtDuration(m.minutes)}</span>
                </span>
              </p>
            </div>
          </EditableField>

          <EditableField<Place>
            label="Location"
            value={{ location: m.location, hasVideo: m.hasVideo }}
            onSave={(v) =>
              save({
                location: v.location.trim() || "No location set",
                hasVideo: v.hasVideo,
              })
            }
            renderEditor={(v, set) => (
              <>
                <input
                  autoFocus
                  aria-label="Location"
                  className={input}
                  placeholder="Room, address or “Video call”"
                  value={v.location}
                  onChange={(e) => set({ ...v, location: e.target.value })}
                />
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    className="m-0 size-4 accent-accent"
                    checked={v.hasVideo}
                    onChange={(e) => set({ ...v, hasVideo: e.target.checked })}
                  />
                  Has a video call link
                </label>
              </>
            )}
          >
            <div className="flex flex-col gap-2">
              <p className={facts}>
                <PinIcon />
                <span>{m.location}</span>
              </p>
              {m.hasVideo && (
                <p className={facts}>
                  <VideoIcon />
                  <span>Video call available</span>
                </p>
              )}
            </div>
          </EditableField>

          <EditableField
            label="Organiser"
            value={m.organizer}
            validate={(v) => (v.trim() ? null : "Organiser can’t be empty.")}
            onSave={(v) => save({ organizer: v.trim() })}
            renderEditor={(v, set) => (
              <input
                autoFocus
                aria-label="Organiser"
                className={input}
                value={v}
                onChange={(e) => set(e.target.value)}
              />
            )}
          >
            <p className={facts}>
              <UserIcon />
              <span>{m.organizer}</span>
            </p>
          </EditableField>

          <EditableField
            label="Agenda"
            value={m.agenda.join("\n")}
            onSave={(v) => save({ agenda: lines(v) })}
            renderEditor={(v, set) => (
              <>
                <textarea
                  autoFocus
                  aria-label="Agenda"
                  rows={5}
                  className={textarea}
                  value={v}
                  onChange={(e) => set(e.target.value)}
                />
                <span className="text-[11px] text-muted">
                  One item per line.
                </span>
              </>
            )}
          >
            {m.agenda.length ? (
              <ol className="flex list-decimal flex-col gap-1 pl-[18px] text-[13px] leading-[1.45]">
                {m.agenda.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            ) : (
              <p className={cx("text-muted", small)}>No agenda yet.</p>
            )}
          </EditableField>

          <EditableField
            label="Notes"
            value={m.notes}
            onSave={(v) => save({ notes: v.trim() })}
            renderEditor={(v, set) => (
              <textarea
                autoFocus
                aria-label="Notes"
                rows={5}
                className={textarea}
                value={v}
                onChange={(e) => set(e.target.value)}
              />
            )}
          >
            {m.notes ? (
              <p className="whitespace-pre-line text-[13px] leading-normal text-ink-2">
                {m.notes}
              </p>
            ) : (
              <p className={cx("text-muted", small)}>No notes yet.</p>
            )}
          </EditableField>
        </section>

        <aside className="flex flex-col gap-5">
          <section className={cx(card, "p-5")} aria-label="Classification">
            <EditableField<CategoryKey>
              label="Category"
              value={m.category}
              onSave={(v) => save({ category: v })}
              renderEditor={(v, set) => (
                <select
                  autoFocus
                  aria-label="Category"
                  className={input}
                  value={v}
                  onChange={(e) => set(e.target.value as CategoryKey)}
                >
                  {(Object.keys(CATEGORIES) as CategoryKey[]).map((k) => (
                    <option key={k} value={k}>
                      {CATEGORIES[k].label}
                    </option>
                  ))}
                </select>
              )}
            >
              <p className="flex items-center gap-2 text-[13px]">
                <Dot color={cat.dot} size="md" />
                {cat.label}
              </p>
            </EditableField>

            <EditableField
              label="Series"
              value={seriesName}
              onSave={(v) => save({ seriesId: ensureSeries(v, m.category) })}
              renderEditor={(v, set) => (
                <>
                  <SeriesCombobox
                    id="moment-series"
                    value={v}
                    onChange={set}
                    onPick={() => {}}
                    options={openSeries}
                    inputClassName={input}
                  />
                  <span className="text-[11px] text-muted">
                    Leave empty to remove it from its series.
                  </span>
                </>
              )}
            >
              <p className={cx("text-[13px]", !seriesName && "text-muted")}>
                {seriesName || "Not part of a series"}
              </p>
            </EditableField>
          </section>

          <section className={cx(card, "p-5")} aria-label="People">
            <EditableField<Person[]>
              label={`Attendees · ${m.people.length}`}
              value={m.people}
              validate={(ps) => {
                const names = ps.map((p) => p.name.trim().toLowerCase());
                if (names.some((n) => !n))
                  return "Every attendee needs a name.";
                if (new Set(names).size !== names.length)
                  return "Attendee names must be unique.";
                return null;
              }}
              onSave={(ps) =>
                save({ people: ps.map((p) => ({ ...p, name: p.name.trim() })) })
              }
              renderEditor={(ps, set) => (
                <AttendeesEditor people={ps} onChange={set} />
              )}
            >
              <ul className="flex flex-col gap-2 text-[13px]">
                {m.people.map((p) => (
                  <li key={p.name} className="flex items-center gap-2.5">
                    <span className="grow">{p.name}</span>
                    <span
                      className={cx(
                        small,
                        p.status === "Accepted" ? TONE.live : TONE.warn,
                      )}
                    >
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            </EditableField>
          </section>

          {linkedTasks.length > 0 && (
            <section
              className={cx(card, "gap-2 p-5")}
              aria-label="Linked tasks"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Linked tasks
              </h3>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {linkedTasks.map((t) => (
                  <li
                    key={t.id}
                    className={cx(t.done && "text-faint line-through")}
                  >
                    {t.title}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </main>
    </div>
  );
}

function AttendeesEditor({
  people,
  onChange,
}: {
  people: Person[];
  onChange: (next: Person[]) => void;
}) {
  const patch = (i: number, p: Partial<Person>) =>
    onChange(people.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-2">
      {people.map((p, i) => (
        // Index keys: names are being edited, so they can't identify rows.
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1fr)_104px_36px] gap-1.5"
        >
          <input
            autoFocus={i === 0}
            aria-label={`Attendee ${i + 1} name`}
            className={input}
            value={p.name}
            onChange={(e) => patch(i, { name: e.target.value })}
          />
          <select
            aria-label={`Attendee ${i + 1} status`}
            className={input}
            value={p.status}
            onChange={(e) =>
              patch(i, { status: e.target.value as AttendeeStatus })
            }
          >
            <option value="Accepted">Accepted</option>
            <option value="Tentative">Tentative</option>
          </select>
          <button
            type="button"
            aria-label={`Remove ${p.name || `attendee ${i + 1}`}`}
            className="grid size-9 cursor-pointer place-items-center rounded-[10px] border border-line bg-card text-muted hover:bg-band hover:text-ink"
            onClick={() => onChange(people.filter((_, j) => j !== i))}
          >
            <XIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2 py-1 text-[12px] font-medium text-accent hover:bg-band"
        onClick={() => onChange([...people, { name: "", status: "Tentative" }])}
      >
        <Plus />
        Add attendee
      </button>
    </div>
  );
}
