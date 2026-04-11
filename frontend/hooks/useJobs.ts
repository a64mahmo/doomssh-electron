import { useMemo } from 'react'
import { useJobStore } from '@/lib/store/jobStore'
import { ACTIVE_STATUSES, TERMINAL_STATUSES } from '@/lib/store/jobTypes'
import type { JobStatus } from '@/lib/store/jobTypes'

export function useJobs() {
  return useJobStore()
}

export function useJob(jobId: string | null) {
  return useJobStore((s) => s.jobs.find((j) => j.id === jobId) ?? null)
}

export function useJobsByStatus(status: JobStatus) {
  return useJobStore((s) => s.jobs.filter((j) => j.status === status && !j.archivedAt))
}

export function useActiveJobs() {
  return useJobStore((s) =>
    s.jobs.filter((j) => ACTIVE_STATUSES.includes(j.status) && !j.archivedAt)
  )
}

export function useArchivedJobs() {
  return useJobStore((s) =>
    s.jobs.filter((j) => TERMINAL_STATUSES.includes(j.status) || j.archivedAt)
  )
}

export function useJobStats() {
  const jobs = useJobStore((s) => s.jobs)

  return useMemo(() => {
    const active = jobs.filter((j) => !j.archivedAt)
    const applied = active.filter((j) => j.status !== 'wishlist')
    const interviewing = applied.filter((j) =>
      ['phone-screen', 'technical', 'onsite'].includes(j.status)
    )
    const offers = active.filter((j) => j.status === 'offer' || j.status === 'accepted')
    const rejected = active.filter((j) => j.status === 'rejected')
    const ghosted = active.filter((j) => j.status === 'ghosted')

    const responseRate = applied.length > 0
      ? ((applied.length - ghosted.length - rejected.filter(j => !j.responseDate).length) / applied.length) * 100
      : 0

    const interviewRate = applied.length > 0
      ? (interviewing.length / applied.length) * 100
      : 0

    const offerRate = applied.length > 0
      ? (offers.length / applied.length) * 100
      : 0

    return {
      total: active.length,
      applied: applied.length,
      interviewing: interviewing.length,
      offers: offers.length,
      rejected: rejected.length,
      ghosted: ghosted.length,
      responseRate,
      interviewRate,
      offerRate,
    }
  }, [jobs])
}
