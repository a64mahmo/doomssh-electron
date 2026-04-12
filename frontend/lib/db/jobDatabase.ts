// Vault-based file storage for job applications via Electron IPC
import type { JobApplication, JobsVaultFile } from '@/lib/store/jobTypes'

export async function loadAllJobs(): Promise<JobApplication[]> {
  const data = (await window.electron!.vault.readJobs()) as JobsVaultFile | null
  if (!data || !data.jobs) return []
  return data.jobs
}

export async function saveAllJobs(jobs: JobApplication[]): Promise<void> {
  const data: JobsVaultFile = { version: 1, jobs }
  await window.electron!.vault.writeJobs(data)
}
