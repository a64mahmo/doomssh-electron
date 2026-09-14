/**
 * Saves a store's document shortly after it changes.
 *
 * It watches the document itself, not an isDirty flag. A flag subscription only
 * fires when the flag flips, so edits made while it was already true were never
 * scheduled, and a rate limit that returned early left them unsaved for good.
 */
export interface DebouncedSaverOptions<T> {
  /** Register `onChange` to run whenever the document changes; returns unsubscribe. */
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => T | null | undefined
  /** Whether there are unsaved changes (loading a document is not a change). */
  isDirty: () => boolean
  save: (snapshot: T) => Promise<void>
  /** Called only if the document did not change while it was being saved. */
  onSaved: () => void
  onError: (err: unknown) => void
  delay?: number
}

export function createDebouncedSaver<T>({
  subscribe, getSnapshot, isDirty, save, onSaved, onError, delay = 500,
}: DebouncedSaverOptions<T>): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let saving = false
  let rerun = false

  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, delay)
  }

  async function flush() {
    timer = null
    if (saving) {
      // A change landed mid-save; save again once this one finishes.
      rerun = true
      return
    }
    const snapshot = getSnapshot()
    if (snapshot == null || !isDirty()) return

    saving = true
    try {
      await save(snapshot)
      if (getSnapshot() === snapshot) onSaved()
    } catch (err) {
      onError(err)
    } finally {
      saving = false
      if (rerun) {
        rerun = false
        schedule()
      }
    }
  }

  const unsubscribe = subscribe(schedule)
  return () => {
    if (timer) clearTimeout(timer)
    unsubscribe()
  }
}
