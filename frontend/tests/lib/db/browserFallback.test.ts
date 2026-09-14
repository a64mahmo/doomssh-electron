import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Resume } from '@/lib/store/types'

// In-memory stand-in for the Dexie tables
const resumes = new Map<string, Resume>()
const kv = new Map<string, { key: string; value: unknown }>()

vi.mock('@/lib/db/browserDb', () => ({
  browserDb: () => ({
    resumes: {
      toArray: async () => [...resumes.values()],
      get: async (id: string) => resumes.get(id),
      put: async (r: Resume) => { resumes.set(r.id, r) },
      delete: async (id: string) => { resumes.delete(id) },
    },
    kv: {
      get: async (key: string) => kv.get(key),
      put: async (row: { key: string; value: unknown }) => { kv.set(row.key, row) },
    },
  }),
}))

import {
  getAllResumes, getAllCoverLetters, getResume, saveResume, deleteResume,
  createNewResume, createNewCoverLetter,
} from '@/lib/db/database'
import { loadAllJobs, saveAllJobs } from '@/lib/db/jobDatabase'

describe('browser storage fallback (no window.electron)', () => {
  beforeEach(() => {
    resumes.clear()
    kv.clear()
    delete (window as { electron?: unknown }).electron
  })

  it('saves, reads, lists and deletes resumes', async () => {
    const resume = createNewResume('Web Resume')
    const letter = createNewCoverLetter('Web Letter')
    await saveResume(resume)
    await saveResume(letter)

    expect((await getResume(resume.id))?.name).toBe('Web Resume')
    expect((await getAllResumes()).map(r => r.id)).toEqual([resume.id])
    expect((await getAllCoverLetters()).map(r => r.id)).toEqual([letter.id])

    await deleteResume(resume.id)
    expect(await getResume(resume.id)).toBeUndefined()
  })

  it('persists jobs', async () => {
    expect(await loadAllJobs()).toEqual([])
    const jobs = [{ id: 'j1', company: 'Acme' }] as never
    await saveAllJobs(jobs)
    expect(await loadAllJobs()).toEqual(jobs)
  })
})
