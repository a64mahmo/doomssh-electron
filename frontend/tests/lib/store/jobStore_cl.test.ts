import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useJobStore } from '@/lib/store/jobStore'
import { loadAllJobs, saveAllJobs } from '@/lib/db/jobDatabase'

vi.mock('@/lib/db/jobDatabase', () => ({
  loadAllJobs: vi.fn().mockResolvedValue([]),
  saveAllJobs: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/store/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      addError: vi.fn(),
    }),
  },
}))

describe('useJobStore - Cover Letter Linking', () => {
  beforeEach(() => {
    useJobStore.setState({ jobs: [], isLoaded: false, isDirty: false })
    vi.clearAllMocks()
  })

  it('adds a job with null coverLetterId by default', () => {
    useJobStore.getState().addJob({ company: 'Acme' })
    const job = useJobStore.getState().jobs[0]
    expect(job.coverLetterId).toBe(null)
  })

  it('updates coverLetterId correctly', () => {
    useJobStore.getState().addJob({ company: 'Acme' })
    const jobId = useJobStore.getState().jobs[0].id
    
    useJobStore.getState().updateJob(jobId, { coverLetterId: 'cl-123' })
    
    const updatedJob = useJobStore.getState().jobs.find(j => j.id === jobId)
    expect(updatedJob?.coverLetterId).toBe('cl-123')
    expect(useJobStore.getState().isDirty).toBe(true)
  })

  it('can clear coverLetterId by setting to null', () => {
    useJobStore.getState().addJob({ company: 'Acme', coverLetterId: 'cl-123' })
    const jobId = useJobStore.getState().jobs[0].id
    
    useJobStore.getState().updateJob(jobId, { coverLetterId: null })
    
    const updatedJob = useJobStore.getState().jobs.find(j => j.id === jobId)
    expect(updatedJob?.coverLetterId).toBe(null)
  })
})
