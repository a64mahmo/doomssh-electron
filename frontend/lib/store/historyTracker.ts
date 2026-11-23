// Decides when the document being edited gets a version. Not on every
// autosave (that runs ~500ms after typing stops, and a resume with a photo can
// be megabytes), but:
//  - the first save after opening keeps the document as it was opened;
//  - while editing, at most one version every AUTOSAVE_INTERVAL_MS;
//  - restoring keeps the current document first (see restoreVersion).
import type { Resume } from '@/lib/store/types'
import { saveVersion, type VersionMeta, type VersionReason } from '@/lib/db/history'

export const AUTOSAVE_INTERVAL_MS = 10 * 60 * 1000

interface Session {
  id: string
  /** The document as opened, until the first save keeps it. */
  opened: Resume | null
  lastVersionAt: number
}

let session: Session | null = null
const listeners = new Set<() => void>()

/** Called when the builder loads a document. */
export function beginSession(resume: Resume) {
  session = { id: resume.id, opened: resume, lastVersionAt: Date.now() }
}

export function endSession(id: string) {
  if (session?.id === id) session = null
}

/** Notified whenever a version is added, so an open History list can refresh. */
export function onVersionsChanged(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

async function keep(resume: Resume, reason: VersionReason, protect: string[] = []): Promise<VersionMeta | null> {
  const meta = await saveVersion(resume, reason, Date.now(), protect)
  if (meta) listeners.forEach((fn) => fn())
  return meta
}

/** After each autosave. Never throws: history must not break saving. */
export async function recordSave(resume: Resume, now: number = Date.now()): Promise<void> {
  if (!session || session.id !== resume.id) return
  try {
    if (session.opened) {
      const opened = session.opened
      session.opened = null
      session.lastVersionAt = now
      await keep(opened, 'opened')
    } else if (now - session.lastVersionAt >= AUTOSAVE_INTERVAL_MS) {
      session.lastVersionAt = now
      await keep(resume, 'autosave')
    }
  } catch (err) {
    console.warn('[history] could not keep a version:', err)
  }
}

/** After a PDF is saved (desktop) or the print dialog is shown (browser). Never throws. */
export async function recordDownload(resume: Resume): Promise<void> {
  try {
    await keep(resume, 'download')
    if (session?.id === resume.id) session.lastVersionAt = Date.now()
  } catch (err) {
    console.warn('[history] could not keep the downloaded version:', err)
  }
}

/** "Save version" button. */
export function saveVersionNow(resume: Resume): Promise<VersionMeta | null> {
  if (session?.id === resume.id) session.lastVersionAt = Date.now()
  return keep(resume, 'manual')
}

/**
 * Keeps `current`, then returns `version` under the current document's id for
 * the store to load (which marks it dirty, so autosave writes it), plus the
 * version that undoes it.
 */
export async function prepareRestore(
  current: Resume,
  version: Resume,
  /** The id of the version being restored; it stays in history. */
  versionId?: string,
): Promise<{ restored: Resume; backup: VersionMeta | null }> {
  // Nothing is deleted: the restored version stays where it is, and the
  // current document is added as a new version (null when it already matches
  // the newest one, so there is nothing new to keep).
  const backup = await keep(current, 'restore', versionId ? [versionId] : [])
  if (session?.id === current.id) {
    // The version being restored is already in history; don't keep it again as "opened".
    session.opened = null
    session.lastVersionAt = Date.now()
  }
  return { restored: { ...version, id: current.id, kind: current.kind, updatedAt: Date.now() }, backup }
}
