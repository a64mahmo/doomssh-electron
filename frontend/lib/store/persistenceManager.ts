import { useResumeStore } from './resumeStore';
import { saveResume } from '@/lib/db/database';
import { useUIStore } from '@/lib/store/uiStore';
import { createDebouncedSaver } from './debouncedSaver';

let initialized = false;

export function initPersistence() {
  if (initialized) return;
  initialized = true;

  createDebouncedSaver({
    subscribe: (onChange) => useResumeStore.subscribe((state) => state.resume, onChange),
    getSnapshot: () => useResumeStore.getState().resume,
    isDirty: () => useResumeStore.getState().isDirty,
    save: saveResume,
    onSaved: () => useResumeStore.getState().markSaved(),
    onError: (err) => {
      console.error('Failed to save resume:', err);
      useUIStore.getState().addError(
        `Persistence Error: ${err instanceof Error ? err.message : String(err)}`
      );
    },
  });
}
