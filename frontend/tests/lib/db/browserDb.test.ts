import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { browserDb } from '@/lib/db/browserDb'
import {
  getAllResumes, getAllCoverLetters, getResume, saveResume, deleteResume,
  createNewResume, createNewCoverLetter,
} from '@/lib/db/database'
import { loadAllJobs, saveAllJobs } from '@/lib/db/jobDatabase'

// Exercises the real Dexie schema against an in-memory IndexedDB
describe('browserDb (real Dexie)', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().resumes.clear()
    await browserDb().kv.clear()
  })

  it('round-trips full resumes through IndexedDB', async () => {
    const resume = createNewResume('Web Resume')
    const letter = createNewCoverLetter('Web Letter')
    await saveResume(resume)
    await saveResume(letter)

    const stored = await getResume(resume.id)
    expect(stored?.sections).toEqual(resume.sections)
    expect((await getAllResumes()).map(r => r.id)).toEqual([resume.id])
    expect((await getAllCoverLetters()).map(r => r.id)).toEqual([letter.id])

    await deleteResume(resume.id)
    expect(await getResume(resume.id)).toBeUndefined()
  })

  it('round-trips jobs through IndexedDB', async () => {
    expect(await loadAllJobs()).toEqual([])
    const jobs = [{ id: 'j1', company: 'Acme', events: [] }] as never
    await saveAllJobs(jobs)
    expect(await loadAllJobs()).toEqual(jobs)
  })
})
