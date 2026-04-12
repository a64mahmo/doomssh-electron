// Vault-based file storage for job applications via Electron IPC
import type { JobApplication, JobsVaultFile } from '@/lib/store/jobTypes'

export async function loadAllJobs(): Promise<JobApplication[]> {
  if (!window.electron) return []
  const data = (await window.electron.vault.readJobs()) as JobsVaultFile | null
  if (!data || !data.jobs) return []
  return data.jobs
}

export async function saveAllJobs(jobs: JobApplication[]): Promise<void> {
  if (!window.electron) return
  const data: JobsVaultFile = { version: 1, jobs }
  await window.electron.vault.writeJobs(data)
}
