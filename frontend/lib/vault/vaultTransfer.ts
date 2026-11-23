// Export the whole vault to one JSON file, and import one back (adding to the
// vault, never overwriting). Imports always go through sanitizeVault first.
import type { Resume, JobApplication } from '@/lib/store/types'
import { getAllResumes, getAllCoverLetters, saveResume } from '@/lib/db/database'
import { loadAllJobs, saveAllJobs } from '@/lib/db/jobDatabase'
import { generateId } from '@/lib/utils/ids'
import { VAULT_FORMAT, VAULT_VERSION, type SanitizedVault } from './sanitize'

export interface VaultFile {
  format: typeof VAULT_FORMAT
  version: typeof VAULT_VERSION
  app: 'DoomSSH'
  exportedAt: string
  resumes: Resume[]
  coverLetters: Resume[]
  jobs: JobApplication[]
}

/** Everything in the vault except version history, which stays on this device. */
export async function buildVaultFile(): Promise<VaultFile> {
  const [resumes, coverLetters, jobs] = await Promise.all([getAllResumes(), getAllCoverLetters(), loadAllJobs()])
  return {
    format: VAULT_FORMAT,
    version: VAULT_VERSION,
    app: 'DoomSSH',
    exportedAt: new Date().toISOString(),
    resumes,
    coverLetters,
    jobs,
  }
}

export function vaultFileName(date = new Date()): string {
  return `doomssh-vault-${date.toISOString().slice(0, 10)}.json`
}

/** Saves the vault as a .json download (a save dialog on desktop). */
export async function exportVault(): Promise<VaultFile> {
  const file = await buildVaultFile()
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = vaultFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return file
}

export interface ImportResult {
  resumes: number
  coverLetters: number
  jobs: number
}

/**
 * Adds a cleaned vault to this one. Every document and job gets a new id, so
 * nothing already here is overwritten, and links between them (a job's
 * resume, a cover letter's job) are carried over to the new ids.
 */
export async function importVault(vault: SanitizedVault): Promise<ImportResult> {
  const docIds = new Map<string, string>()
  const jobIds = new Map<string, string>()
  for (const d of [...vault.resumes, ...vault.coverLetters]) if (d.id) docIds.set(d.id, generateId())
  for (const j of vault.jobs) if (j.id) jobIds.set(j.id, generateId())
  const docId = (old: string | null | undefined) => (old ? docIds.get(old) ?? null : null)

  for (const d of [...vault.resumes, ...vault.coverLetters]) {
    const next: Resume = { ...d, id: docIds.get(d.id) ?? generateId() }
    if (next.coverLetter) {
      next.coverLetter = {
        ...next.coverLetter,
        linkedResumeId: docId(next.coverLetter.linkedResumeId),
        linkedJobId: next.coverLetter.linkedJobId ? jobIds.get(next.coverLetter.linkedJobId) ?? null : null,
      }
    }
    await saveResume(next)
  }

  if (vault.jobs.length) {
    const imported = vault.jobs.map((j) => ({
      ...j,
      id: jobIds.get(j.id) ?? generateId(),
      resumeId: docId(j.resumeId),
      coverLetterId: docId(j.coverLetterId),
    }))
    // saveAllJobs writes the whole list: add to what is there.
    const existing = await loadAllJobs()
    await saveAllJobs([...existing, ...imported])
  }

  return { resumes: vault.resumes.length, coverLetters: vault.coverLetters.length, jobs: vault.jobs.length }
}
