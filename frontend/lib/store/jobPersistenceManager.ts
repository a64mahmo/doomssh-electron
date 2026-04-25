import { useJobStore } from './jobStore';
import { saveAllJobs } from '@/lib/db/jobDatabase';
import { useUIStore } from '@/lib/store/uiStore';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let initialized = false;
let lastSaveTime = 0;
const SAVE_DEBOUNCE_MS = 1000; // Save at most once per second

export function initJobPersistence() {
  if (initialized) return;
  initialized = true;

  useJobStore.subscribe(
    (state) => state.isDirty,
    async (isDirty) => {
      if (!isDirty) return;

      if (saveTimeout) clearTimeout(saveTimeout);

      saveTimeout = setTimeout(async () => {
        // Rate limit saves
        const now = Date.now();
        if (now - lastSaveTime < SAVE_DEBOUNCE_MS) return;
        
        const { jobs, markSaved } = useJobStore.getState();
        if (jobs) {
          try {
            lastSaveTime = now;
            await saveAllJobs(jobs);
            markSaved();
          } catch (err) {
            console.error('Failed to save jobs:', err);
            useUIStore.getState().addError(
              `Job Persistence Error: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }, 500);
    },
    { fireImmediately: false }
  );
}
