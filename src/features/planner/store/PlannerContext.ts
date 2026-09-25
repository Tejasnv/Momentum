import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { CategoryKey, Meeting, Series, Task } from '../types';

export interface PlannerStore {
  today: Date;
  meetings: Meeting[];
  tasks: Task[];
  series: Series[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  addMeeting: (m: Meeting) => void;
  /** Merges the patch; `minutes` and `dayKey` are recomputed from start/end. */
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  /** Removes the meeting; tasks linked to it are kept but unlinked. */
  deleteMeeting: (id: string) => void;
  /** Id of the series with this name (case-insensitive), creating it if needed; null for a blank name. */
  ensureSeries: (name: string, category: CategoryKey) => string | null;
}

export const PlannerContext = createContext<PlannerStore | null>(null);

export function usePlanner() {
  const store = useContext(PlannerContext);
  if (!store) throw new Error('usePlanner must be used inside <PlannerProvider>');
  return store;
}
