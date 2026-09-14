// Vault-based file storage for job applications via Electron IPC, IndexedDB in the browser
import type { JobApplication, JobsVaultFile } from '@/lib/store/jobTypes'
import { browserDb } from '@/lib/db/browserDb'

const JOBS_KEY = 'jobs'

export async function loadAllJobs(): Promise<JobApplication[]> {
  const data = window.electron
    ? ((await window.electron.vault.readJobs()) as JobsVaultFile | null)
    : ((await browserDb().kv.get(JOBS_KEY))?.value as JobsVaultFile | undefined)
  if (!data || !data.jobs) return []
  return data.jobs
}

export async function saveAllJobs(jobs: JobApplication[]): Promise<void> {
  const data: JobsVaultFile = { version: 1, jobs }
  if (!window.electron) {
    await browserDb().kv.put({ key: JOBS_KEY, value: data })
    return
  }
  await window.electron.vault.writeJobs(data)
}
