import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { browserDb } from '@/lib/db/browserDb'
import { createNewResume, saveResume, deleteResume } from '@/lib/db/database'
import { listVersions, getVersion, saveVersion, MAX_VERSIONS, parseVersionId } from '@/lib/db/history'
import { beginSession, endSession, recordSave, prepareRestore, AUTOSAVE_INTERVAL_MS } from '@/lib/store/historyTracker'
import type { Resume } from '@/lib/store/types'

function edited(r: Resume, name: string): Resume {
  return { ...r, name, updatedAt: r.updatedAt + 1 }
}

describe('version history (IndexedDB)', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().resumes.clear()
    await browserDb().versions.clear()
  })

  it('keeps versions newest first and reads them back', async () => {
    const r = createNewResume('One')
    await saveVersion(r, 'manual', 1000)
    await saveVersion(edited(r, 'Two'), 'autosave', 2000)
    const list = await listVersions(r.id)
    expect(list.map((v) => v.id)).toEqual(['2000-autosave', '1000-manual'])
    expect((await getVersion(r.id, '1000-manual'))?.name).toBe('One')
  })

  it('skips a version identical to the newest, ignoring updatedAt', async () => {
    const r = createNewResume('Same')
    expect(await saveVersion(r, 'manual', 1000)).not.toBeNull()
    expect(await saveVersion({ ...r, updatedAt: r.updatedAt + 999 }, 'manual', 2000)).toBeNull()
    expect(await listVersions(r.id)).toHaveLength(1)
  })

  it(`keeps at most ${MAX_VERSIONS} versions, dropping the oldest`, async () => {
    const r = createNewResume('Many')
    for (let i = 0; i < MAX_VERSIONS + 3; i++) await saveVersion(edited(r, `v${i}`), 'autosave', 1000 + i)
    const list = await listVersions(r.id)
    expect(list).toHaveLength(MAX_VERSIONS)
    expect(list.at(-1)?.savedAt).toBe(1000 + 3)
  })

  it('deletes a document’s history with the document', async () => {
    const r = createNewResume('Gone')
    await saveResume(r)
    await saveVersion(r, 'manual', 1000)
    await deleteResume(r.id)
    expect(await listVersions(r.id)).toEqual([])
  })

  it('rejects malformed version ids', () => {
    expect(parseVersionId('x', '123-autosave')?.savedAt).toBe(123)
    expect(parseVersionId('x', '../evil')).toBeNull()
    expect(parseVersionId('x', '123-bogus')).toBeNull()
  })
})

describe('history tracker', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().versions.clear()
  })

  it('keeps the opened document on the first save, then at most one per interval', async () => {
    const opened = createNewResume('Opened')
    beginSession(opened)
    const t0 = Date.now()

    await recordSave(edited(opened, 'Edit 1'), t0)
    let list = await listVersions(opened.id)
    expect(list.map((v) => v.reason)).toEqual(['opened'])
    expect((await getVersion(opened.id, list[0].id))?.name).toBe('Opened')

    await recordSave(edited(opened, 'Edit 2'), t0 + 1000)
    expect(await listVersions(opened.id)).toHaveLength(1)

    await recordSave(edited(opened, 'Edit 3'), t0 + AUTOSAVE_INTERVAL_MS + 1)
    list = await listVersions(opened.id)
    expect(list.map((v) => v.reason)).toEqual(['autosave', 'opened'])
    endSession(opened.id)
  })

  it('ignores saves of other documents and never throws', async () => {
    const a = createNewResume('A')
    beginSession(a)
    await recordSave(createNewResume('B'))
    expect(await listVersions(a.id)).toEqual([])

    const spy = vi.spyOn(browserDb().versions, 'put').mockRejectedValueOnce(new Error('disk full'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(recordSave(edited(a, 'A2'))).resolves.toBeUndefined()
    spy.mockRestore()
    warn.mockRestore()
    endSession(a.id)
  })

  it('restore keeps the current document first and returns the old one under the same id', async () => {
    const current = createNewResume('Now')
    const old = { ...createNewResume('Then'), id: 'other-id' }
    const { restored, backup } = await prepareRestore(current, old)
    expect(restored.id).toBe(current.id)
    expect(restored.name).toBe('Then')
    expect(backup?.reason).toBe('restore')
    expect((await getVersion(current.id, backup!.id))?.name).toBe('Now')
  })
})

describe('stale desktop main process', () => {
  it('falls back to IndexedDB when the history IPC has no handler', async () => {
    const missing = () => Promise.reject(new Error("Error invoking remote method 'history:list': Error: No handler registered for 'history:list'"))
    ;(window as { electron?: unknown }).electron = {
      vault: { listVersions: missing, readVersion: missing, writeVersion: missing, deleteVersions: missing },
    }
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const r = createNewResume('Stale')
    await expect(saveVersion(r, 'manual', 5000)).resolves.not.toBeNull()
    expect((await listVersions(r.id)).map((v) => v.id)).toEqual(['5000-manual'])
    info.mockRestore()
    delete (window as { electron?: unknown }).electron
  })
})

describe('download versions', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().versions.clear()
  })

  it('marks a download even when nothing changed, but only once', async () => {
    const r = createNewResume('Sent')
    await saveVersion(r, 'manual', 1000)
    expect(await saveVersion(r, 'download', 2000)).not.toBeNull()
    expect(await saveVersion(r, 'download', 3000)).toBeNull()
    expect((await listVersions(r.id)).map((v) => v.reason)).toEqual(['download', 'manual'])
  })

  it('records successful desktop exports only', async () => {
    const { downloadResumePDF } = await import('@/lib/utils/export')
    const r = createNewResume('Exported')
    const exportPdf = vi.fn().mockResolvedValueOnce({ success: false, cancelled: true }).mockResolvedValueOnce({ success: true, path: '/x.pdf' })
    ;(window as { electron?: unknown }).electron = { exportPdf, vault: {} }
    await downloadResumePDF(r)
    expect(await listVersions(r.id)).toEqual([])
    await downloadResumePDF(r)
    expect((await listVersions(r.id)).map((v) => v.reason)).toEqual(['download'])
    delete (window as { electron?: unknown }).electron
  })
})

describe('restore keeps history', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().versions.clear()
  })

  it('deletes no version when restoring', async () => {
    const r = createNewResume('Doc')
    await saveVersion(edited(r, 'A'), 'manual', 1000)
    await saveVersion(edited(r, 'B'), 'manual', 2000)
    const before = (await listVersions(r.id)).map((v) => v.id)
    const old = await getVersion(r.id, '1000-manual')
    await prepareRestore(edited(r, 'Current'), old!, '1000-manual')
    const after = (await listVersions(r.id)).map((v) => v.id)
    for (const id of before) expect(after).toContain(id)
    expect(after).toHaveLength(before.length + 1)
  })

  it('keeps the restored version even when history is full and it is the oldest', async () => {
    const r = createNewResume('Full')
    for (let i = 0; i < MAX_VERSIONS; i++) await saveVersion(edited(r, `v${i}`), 'autosave', 1000 + i)
    const oldestId = `${1000}-autosave`
    const oldest = await getVersion(r.id, oldestId)
    await prepareRestore(edited(r, 'Current'), oldest!, oldestId)
    const ids = (await listVersions(r.id)).map((v) => v.id)
    expect(ids).toContain(oldestId)
    expect(ids).toHaveLength(MAX_VERSIONS)
  })
})
