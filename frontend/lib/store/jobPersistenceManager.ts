import { useJobStore } from './jobStore';
import { saveAllJobs } from '@/lib/db/jobDatabase';
import { useUIStore } from '@/lib/store/uiStore';
import { createDebouncedSaver } from './debouncedSaver';

let initialized = false;

export function initJobPersistence() {
  if (initialized) return;
  initialized = true;

  createDebouncedSaver({
    subscribe: (onChange) => useJobStore.subscribe((state) => state.jobs, onChange),
    getSnapshot: () => useJobStore.getState().jobs,
    isDirty: () => useJobStore.getState().isDirty,
    save: saveAllJobs,
    onSaved: () => useJobStore.getState().markSaved(),
    onError: (err) => {
      console.error('Failed to save jobs:', err);
      useUIStore.getState().addError(
        `Job Persistence Error: ${err instanceof Error ? err.message : String(err)}`
      );
    },
  });
}
