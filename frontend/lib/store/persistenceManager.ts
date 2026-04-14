import { useResumeStore } from './resumeStore';
import { saveResume } from '@/lib/db/database';
import { useUIStore } from '@/lib/store/uiStore';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let initialized = false;
let lastSaveTime = 0;
const SAVE_DEBOUNCE_MS = 1000; // Save at most once per second

export function initPersistence() {
  if (initialized) return;
  initialized = true;

  useResumeStore.subscribe(
    (state) => state.isDirty,
    async (isDirty) => {
      if (!isDirty) return;

      if (saveTimeout) clearTimeout(saveTimeout);

      saveTimeout = setTimeout(async () => {
        // Rate limit saves
        const now = Date.now();
        if (now - lastSaveTime < SAVE_DEBOUNCE_MS) return;
        
        const { resume, markSaved } = useResumeStore.getState();
        if (resume) {
          try {
            lastSaveTime = now;
            await saveResume(resume);
            markSaved();
          } catch (err) {
            console.error('Failed to save resume:', err);
            useUIStore.getState().addError(
              `Persistence Error: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }, 500);
    },
    { fireImmediately: false }
  );
}
