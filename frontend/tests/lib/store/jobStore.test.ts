import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useJobStore } from '@/lib/store/jobStore'
import type { JobApplication, JobStatus } from '@/lib/store/jobTypes'

// Mock dependencies
vi.mock('@/lib/utils/ids', () => ({
  generateId: vi.fn(() => 'test-id-' + Math.random().toString(36).slice(2, 7))
}))

vi.mock('@/lib/db/jobDatabase', () => ({
  loadAllJobs: vi.fn(() => Promise.resolve([])),
  saveAllJobs: vi.fn(() => Promise.resolve()),
}))

function makeJob(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: `job-${Date.now()}`,
    company: 'Acme Corp',
    role: 'Engineer',
    status: 'wishlist',
    priority: 'medium',
    url: '',
    source: 'linkedin',
    location: 'Remote',
    workMode: 'remote',
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: 'USD',
    resumeId: null,
    coverLetterId: null,
    coverLetter: '',
    notes: '',    contacts: [],
    events: [],
    appliedDate: null,
    responseDate: null,
    deadlineDate: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archivedAt: null,
    ...overrides,
  }
}

describe('jobStore', () => {
  beforeEach(() => {
    useJobStore.setState({ jobs: [], isLoaded: true, isDirty: false })
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── CRUD ────────────────────────────────────────────────────────────────────

  describe('addJob', () => {
    it('adds job with defaults when minimal data given', () => {
      useJobStore.getState().addJob({ company: 'Google' })
      const jobs = useJobStore.getState().jobs
      expect(jobs).toHaveLength(1)
      expect(jobs[0].company).toBe('Google')
      expect(jobs[0].status).toBe('wishlist')
      expect(jobs[0].priority).toBe('medium')
      expect(jobs[0].events).toHaveLength(1)
      expect(jobs[0].events[0].type).toBe('status-change')
      expect(jobs[0].events[0].title).toBe('Created')
    })

    it('adds job at front of list (most recent first)', () => {
      useJobStore.getState().addJob({ company: 'First' })
      useJobStore.getState().addJob({ company: 'Second' })
      const jobs = useJobStore.getState().jobs
      expect(jobs[0].company).toBe('Second')
      expect(jobs[1].company).toBe('First')
    })

    it('merges partial overrides correctly', () => {
      useJobStore.getState().addJob({ company: 'Meta', status: 'applied', priority: 'high' })
      const job = useJobStore.getState().jobs[0]
      expect(job.status).toBe('applied')
      expect(job.priority).toBe('high')
    })

    it('marks store dirty after add', () => {
      expect(useJobStore.getState().isDirty).toBe(false)
      useJobStore.getState().addJob({ company: 'Test' })
      expect(useJobStore.getState().isDirty).toBe(true)
    })
  })

  describe('updateJob', () => {
    it('updates fields and bumps updatedAt', () => {
      const job = makeJob({ id: 'j1', company: 'Old' })
      useJobStore.setState({ jobs: [job] })
      const before = job.updatedAt

      vi.advanceTimersByTime(100)
      useJobStore.getState().updateJob('j1', { company: 'New' })

      const updated = useJobStore.getState().jobs[0]
      expect(updated.company).toBe('New')
      expect(updated.updatedAt).toBeGreaterThan(before)
    })

    it('does nothing for nonexistent job', () => {
      const job = makeJob({ id: 'j1' })
      useJobStore.setState({ jobs: [job] })
      useJobStore.getState().updateJob('nonexistent', { company: 'Nope' })
      expect(useJobStore.getState().jobs[0].company).toBe('Acme Corp')
    })

    it('marks store dirty', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' })], isDirty: false })
      useJobStore.getState().updateJob('j1', { notes: 'hi' })
      expect(useJobStore.getState().isDirty).toBe(true)
    })
  })

  describe('deleteJob', () => {
    it('removes job by id', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' }), makeJob({ id: 'j2' })] })
      useJobStore.getState().deleteJob('j1')
      expect(useJobStore.getState().jobs).toHaveLength(1)
      expect(useJobStore.getState().jobs[0].id).toBe('j2')
    })

    it('handles deleting nonexistent job gracefully', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' })] })
      useJobStore.getState().deleteJob('ghost')
      expect(useJobStore.getState().jobs).toHaveLength(1)
    })
  })

  describe('archiveJob', () => {
    it('sets archivedAt timestamp', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', archivedAt: null })] })
      useJobStore.getState().archiveJob('j1')
      expect(useJobStore.getState().jobs[0].archivedAt).toBeTruthy()
    })
  })

  // ── Status Pipeline ─────────────────────────────────────────────────────────

  describe('moveJob', () => {
    it('changes status and appends event', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'wishlist', events: [] })] })
      useJobStore.getState().moveJob('j1', 'applied')
      const job = useJobStore.getState().jobs[0]
      expect(job.status).toBe('applied')
      expect(job.events).toHaveLength(1)
      expect(job.events[0].type).toBe('status-change')
      expect(job.events[0].description).toContain('wishlist')
      expect(job.events[0].description).toContain('applied')
    })

    it('auto-sets appliedDate when moving to applied', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'wishlist', appliedDate: null })] })
      useJobStore.getState().moveJob('j1', 'applied')
      expect(useJobStore.getState().jobs[0].appliedDate).toBeTruthy()
    })

    it('does not overwrite existing appliedDate', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'wishlist', appliedDate: '2024-01-01' })] })
      useJobStore.getState().moveJob('j1', 'applied')
      expect(useJobStore.getState().jobs[0].appliedDate).toBe('2024-01-01')
    })

    it('auto-sets responseDate on first interview stage', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'applied', responseDate: null })] })
      useJobStore.getState().moveJob('j1', 'phone-screen')
      expect(useJobStore.getState().jobs[0].responseDate).toBeTruthy()
    })

    it('no-op when moving to same status', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'applied', events: [] })] })
      useJobStore.getState().moveJob('j1', 'applied')
      expect(useJobStore.getState().jobs[0].events).toHaveLength(0)
    })

    it('no-op for nonexistent job', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' })] })
      useJobStore.getState().moveJob('ghost', 'applied')
      expect(useJobStore.getState().jobs[0].status).toBe('wishlist')
    })

    it('tracks full pipeline progression', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'wishlist', events: [] })] })
      const pipeline: JobStatus[] = ['applied', 'phone-screen', 'technical', 'onsite', 'offer', 'accepted']
      pipeline.forEach((s) => useJobStore.getState().moveJob('j1', s))

      const job = useJobStore.getState().jobs[0]
      expect(job.status).toBe('accepted')
      expect(job.events).toHaveLength(pipeline.length)
      expect(job.appliedDate).toBeTruthy()
      expect(job.responseDate).toBeTruthy()
    })
  })

  // ── Contacts ────────────────────────────────────────────────────────────────

  describe('contacts', () => {
    it('adds contact with auto-generated id', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', contacts: [] })] })
      useJobStore.getState().addContact('j1', {
        name: 'Alice', role: 'Recruiter', email: 'a@b.com', phone: '', linkedin: '', notes: '',
      })
      const contacts = useJobStore.getState().jobs[0].contacts
      expect(contacts).toHaveLength(1)
      expect(contacts[0].name).toBe('Alice')
      expect(contacts[0].id).toBeTruthy()
    })

    it('updates contact fields', () => {
      const contact = { id: 'c1', name: 'Bob', role: '', email: '', phone: '', linkedin: '', notes: '' }
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', contacts: [contact] })] })
      useJobStore.getState().updateContact('j1', 'c1', { role: 'CTO' })
      expect(useJobStore.getState().jobs[0].contacts[0].role).toBe('CTO')
    })

    it('removes contact by id', () => {
      const contacts = [
        { id: 'c1', name: 'A', role: '', email: '', phone: '', linkedin: '', notes: '' },
        { id: 'c2', name: 'B', role: '', email: '', phone: '', linkedin: '', notes: '' },
      ]
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', contacts })] })
      useJobStore.getState().removeContact('j1', 'c1')
      expect(useJobStore.getState().jobs[0].contacts).toHaveLength(1)
      expect(useJobStore.getState().jobs[0].contacts[0].id).toBe('c2')
    })
  })

  // ── Events ──────────────────────────────────────────────────────────────────

  describe('events', () => {
    it('adds event with auto-generated id', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', events: [] })] })
      useJobStore.getState().addEvent('j1', {
        type: 'note',
        date: new Date().toISOString(),
        title: 'Followed up',
        description: 'Sent email',
      })
      const events = useJobStore.getState().jobs[0].events
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Followed up')
      expect(events[0].id).toBeTruthy()
    })

    it('removes event by id', () => {
      const events = [
        { id: 'e1', type: 'note' as const, date: '', title: 'A', description: '' },
        { id: 'e2', type: 'note' as const, date: '', title: 'B', description: '' },
      ]
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', events })] })
      useJobStore.getState().removeEvent('j1', 'e1')
      expect(useJobStore.getState().jobs[0].events).toHaveLength(1)
      expect(useJobStore.getState().jobs[0].events[0].id).toBe('e2')
    })
  })

  // ── Persistence ─────────────────────────────────────────────────────────────

  describe('persistence', () => {
    it('schedules debounced save after mutation', async () => {
      const { saveAllJobs } = await import('@/lib/db/jobDatabase')
      useJobStore.getState().addJob({ company: 'Test' })
      expect(saveAllJobs).not.toHaveBeenCalled()
      vi.advanceTimersByTime(500)
      expect(saveAllJobs).toHaveBeenCalledTimes(1)
    })

    it('coalesces rapid mutations into single save', async () => {
      const { saveAllJobs } = await import('@/lib/db/jobDatabase')
      useJobStore.getState().addJob({ company: 'A' })
      useJobStore.getState().addJob({ company: 'B' })
      useJobStore.getState().addJob({ company: 'C' })
      vi.advanceTimersByTime(500)
      expect(saveAllJobs).toHaveBeenCalledTimes(1)
    })

    it('adds error to uiStore when save fails', async () => {
      const { saveAllJobs } = await import('@/lib/db/jobDatabase')
      const { useUIStore } = await import('@/lib/store/uiStore')
      useUIStore.getState().clearErrors()
      vi.mocked(saveAllJobs).mockRejectedValueOnce(new Error('Write Error'))
      
      useJobStore.getState().addJob({ company: 'Fail' })
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()
      
      expect(useUIStore.getState().errors).toContain('Job Persistence Error: Write Error')
      expect(useJobStore.getState().isDirty).toBe(true)
    })

    it('clears isDirty flag after successful save', async () => {
      const { saveAllJobs } = await import('@/lib/db/jobDatabase')
      vi.mocked(saveAllJobs).mockResolvedValueOnce(undefined)
      
      useJobStore.getState().addJob({ company: 'Success' })
      expect(useJobStore.getState().isDirty).toBe(true)
      
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()
      
      expect(useJobStore.getState().isDirty).toBe(false)
    })

    it('loads jobs from vault', async () => {
      const { loadAllJobs } = await import('@/lib/db/jobDatabase')
      const mockJobs = [makeJob({ id: 'loaded-1' })]
      vi.mocked(loadAllJobs).mockResolvedValueOnce(mockJobs)

      useJobStore.setState({ isLoaded: false })
      await useJobStore.getState().loadJobs()

      expect(useJobStore.getState().jobs).toHaveLength(1)
      expect(useJobStore.getState().jobs[0].id).toBe('loaded-1')
      expect(useJobStore.getState().isLoaded).toBe(true)
    })

    it('markSaved clears dirty flag', () => {
      useJobStore.setState({ isDirty: true })
      useJobStore.getState().markSaved()
      expect(useJobStore.getState().isDirty).toBe(false)
    })
  })

  // ── Regression: Edge Cases ──────────────────────────────────────────────────

  describe('regression', () => {
    it('handles empty store operations without crashing', () => {
      useJobStore.setState({ jobs: [] })
      expect(() => useJobStore.getState().updateJob('x', { company: 'X' })).not.toThrow()
      expect(() => useJobStore.getState().deleteJob('x')).not.toThrow()
      expect(() => useJobStore.getState().moveJob('x', 'applied')).not.toThrow()
      expect(() => useJobStore.getState().archiveJob('x')).not.toThrow()
      expect(() => useJobStore.getState().addContact('x', { name: '', role: '', email: '', phone: '', linkedin: '', notes: '' })).not.toThrow()
      expect(() => useJobStore.getState().removeContact('x', 'c')).not.toThrow()
      expect(() => useJobStore.getState().addEvent('x', { type: 'note', date: '', title: '', description: '' })).not.toThrow()
      expect(() => useJobStore.getState().removeEvent('x', 'e')).not.toThrow()
    })

    it('multiple status changes accumulate events correctly', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', status: 'wishlist', events: [] })] })
      useJobStore.getState().moveJob('j1', 'applied')
      useJobStore.getState().moveJob('j1', 'phone-screen')
      useJobStore.getState().moveJob('j1', 'rejected')

      const events = useJobStore.getState().jobs[0].events
      expect(events).toHaveLength(3)
      expect(events[0].description).toContain('wishlist')
      expect(events[0].description).toContain('applied')
      expect(events[2].description).toContain('rejected')
    })

    it('delete removes correct job from middle of list', () => {
      useJobStore.setState({
        jobs: [makeJob({ id: 'j1' }), makeJob({ id: 'j2' }), makeJob({ id: 'j3' })],
      })
      useJobStore.getState().deleteJob('j2')
      const ids = useJobStore.getState().jobs.map((j) => j.id)
      expect(ids).toEqual(['j1', 'j3'])
    })

    it('concurrent add + delete maintains consistency', () => {
      useJobStore.getState().addJob({ id: 'a', company: 'A' })
      useJobStore.getState().addJob({ id: 'b', company: 'B' })
      useJobStore.getState().deleteJob('a')
      useJobStore.getState().addJob({ id: 'c', company: 'C' })

      const jobs = useJobStore.getState().jobs
      expect(jobs.map((j) => j.id)).toContain('b')
      expect(jobs.map((j) => j.id)).toContain('c')
      expect(jobs.map((j) => j.id)).not.toContain('a')
    })

    it('archiveJob does not delete job', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' })] })
      useJobStore.getState().archiveJob('j1')
      expect(useJobStore.getState().jobs).toHaveLength(1)
      expect(useJobStore.getState().jobs[0].archivedAt).toBeTruthy()
    })
  })
})
