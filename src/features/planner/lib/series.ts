import type { Meeting, OpenSeries, Series, Task } from '../types';

/** A series is open while it has an upcoming meeting or an unfinished task. */
export const openSeriesOf = (series: Series[], meetings: Meeting[], tasks: Task[], now: Date): OpenSeries[] =>
  series
    .map((s) => ({
      ...s,
      openCount:
        meetings.filter((m) => m.seriesId === s.id && m.end > now).length +
        tasks.filter((t) => t.seriesId === s.id && !t.done).length,
    }))
    .filter((s) => s.openCount > 0);
