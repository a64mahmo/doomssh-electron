// Version history for resumes and cover letters.
// Desktop: <vault>/_history/<resumeId>/<savedAt>-<reason>.json via Electron IPC.
// Browser: the `versions` table in IndexedDB.
import type { Resume } from '@/lib/store/types'
import { browserDb } from '@/lib/db/browserDb'

/** Why a version was kept. */
export type VersionReason = 'opened' | 'autosave' | 'manual' | 'restore' | 'download'

export const VERSION_REASON_LABELS: Record<VersionReason, string> = {
  opened: 'Before editing',
  autosave: 'While editing',
  manual: 'Saved by you',
  restore: 'Before restoring',
  download: 'Downloaded as PDF',
}

export interface VersionMeta {
  /** `${savedAt}-${reason}`: sorts by time and names the file on desktop. */
  id: string
  resumeId: string
  savedAt: number
  reason: VersionReason
}

/** Newest versions kept per document; older ones are pruned on write. */
export const MAX_VERSIONS = 50

const REASONS: VersionReason[] = ['opened', 'autosave', 'manual', 'restore', 'download']

export function parseVersionId(resumeId: string, id: string): VersionMeta | null {
  const m = /^(\d+)-([a-z]+)$/.exec(id)
  if (!m || !REASONS.includes(m[2] as VersionReason)) return null
  return { id, resumeId, savedAt: Number(m[1]), reason: m[2] as VersionReason }
}

/** The parts of a document a version is about: not when it happened to be saved. */
function contentKey(resume: Resume): string {
  return JSON.stringify({ ...resume, updatedAt: 0 })
}

export function sameContent(a: Resume, b: Resume): boolean {
  return contentKey(a) === contentKey(b)
}

/**
 * Set when the desktop main process turns out to have no history handlers: the
 * window was reloaded with a newer preload but the main process is still the
 * old build (it only updates on a full restart). History then uses IndexedDB
 * for the rest of the session instead of failing.
 */
let vaultUnavailable = false

function vaultHistory() {
  if (vaultUnavailable) return null
  const v = typeof window !== 'undefined' ? window.electron?.vault : undefined
  // Older desktop builds (and partial test mocks) have no history IPC: fall back to IndexedDB.
  return v && typeof v.listVersions === 'function' ? v : null
}

function isMissingHandler(err: unknown): boolean {
  return err instanceof Error && /No handler registered/i.test(err.message)
}

/** Runs `vault` against the desktop vault, or `local` when there is none (or it can't answer). */
async function withStore<T>(
  vault: (v: NonNullable<ReturnType<typeof vaultHistory>>) => Promise<T>,
  local: () => Promise<T>,
): Promise<T> {
  const v = vaultHistory()
  if (!v) return local()
  try {
    return await vault(v)
  } catch (err) {
    if (!isMissingHandler(err)) throw err
    vaultUnavailable = true
    console.info('[history] restart the desktop app to keep versions in the vault; using browser storage until then')
    return local()
  }
}

/** Newest first. */
export async function listVersions(resumeId: string): Promise<VersionMeta[]> {
  return withStore(
    async (v) => (await v.listVersions!(resumeId))
      .map((id) => parseVersionId(resumeId, id))
      .filter((m): m is VersionMeta => m !== null)
      .sort((a, b) => b.savedAt - a.savedAt),
    async () => (await browserDb().versions.where('resumeId').equals(resumeId).toArray())
      .map(({ id, resumeId, savedAt, reason }) => ({ id, resumeId, savedAt, reason }))
      .sort((a, b) => b.savedAt - a.savedAt),
  )
}

export async function getVersion(resumeId: string, id: string): Promise<Resume | null> {
  return withStore(
    async (v) => ((await v.readVersion!(resumeId, id)) as Resume | null) ?? null,
    async () => (await browserDb().versions.get([resumeId, id]))?.resume ?? null,
  )
}

/**
 * Keeps a copy of `resume`. Skipped (returns null) when it matches the newest
 * version, so opening a document or a no-op save never adds one. A download is
 * the exception: it is kept even when unchanged, so History marks what was
 * sent out, unless the newest version is already that same download.
 */
export async function saveVersion(
  resume: Resume,
  reason: VersionReason,
  now: number = Date.now(),
  /** Versions the trim to MAX_VERSIONS must not remove (e.g. the one being restored). */
  protect: string[] = [],
): Promise<VersionMeta | null> {
  const existing = await listVersions(resume.id)
  if (existing[0]) {
    const latest = await getVersion(resume.id, existing[0].id)
    const alreadyMarked = reason !== 'download' || existing[0].reason === 'download'
    if (latest && sameContent(latest, resume) && alreadyMarked) return null
  }
  // Two saves in the same millisecond must not overwrite each other.
  let savedAt = now
  while (existing.some((m) => m.savedAt === savedAt)) savedAt++
  const meta: VersionMeta = { id: `${savedAt}-${reason}`, resumeId: resume.id, savedAt, reason }

  await withStore(
    (v) => v.writeVersion!(resume.id, meta.id, resume),
    async () => { await browserDb().versions.put({ ...meta, resume }) },
  )

  // Trim the oldest past the cap. Restoring never deletes a version on purpose;
  // the cap is the only thing that does, and it skips protected versions.
  const removable = existing.filter((m) => !protect.includes(m.id))
  const over = existing.length + 1 - MAX_VERSIONS
  const stale = over > 0 ? removable.slice(-over) : []
  for (const m of stale) await deleteVersion(resume.id, m.id)
  return meta
}

export async function deleteVersion(resumeId: string, id: string): Promise<void> {
  return withStore(
    (v) => v.deleteVersions!(resumeId, id),
    () => browserDb().versions.delete([resumeId, id]),
  )
}

/** Every version of a document; called when the document itself is deleted. */
export async function deleteAllVersions(resumeId: string): Promise<void> {
  return withStore(
    (v) => v.deleteVersions!(resumeId),
    async () => { await browserDb().versions.where('resumeId').equals(resumeId).delete() },
  )
}
