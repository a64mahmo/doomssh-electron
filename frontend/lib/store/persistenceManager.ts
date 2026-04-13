import { useResumeStore } from './resumeStore';
import { saveResume } from '@/lib/db/database';
import { useUIStore } from '@/lib/store/uiStore';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

export function initPersistence() {
  if (initialized) return;
  initialized = true;

  useResumeStore.subscribe(
    (state) => state.isDirty,
    async (isDirty) => {
      if (!isDirty) return;

      if (saveTimeout) clearTimeout(saveTimeout);

      saveTimeout = setTimeout(async () => {
        const { resume, markSaved } = useResumeStore.getState();
        if (resume) {
          try {
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
