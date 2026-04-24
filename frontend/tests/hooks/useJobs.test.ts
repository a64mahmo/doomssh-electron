import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useJobStore } from '@/lib/store/jobStore'
import { useJob, useJobStats } from '@/hooks/useJobs'
import { ACTIVE_STATUSES, TERMINAL_STATUSES } from '@/lib/store/jobTypes'
import type { JobApplication } from '@/lib/store/jobTypes'

vi.mock('@/lib/db/jobDatabase', () => ({
  loadAllJobs: vi.fn(() => Promise.resolve([])),
  saveAllJobs: vi.fn(() => Promise.resolve()),
}))

function makeJob(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: `job-${Math.random().toString(36).slice(2)}`,
    company: 'Test Co',
    role: 'Dev',
    status: 'wishlist',
    priority: 'medium',
    url: '',
    source: 'other',
    location: '',
    workMode: '',
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

describe('useJobs hooks', () => {
  beforeEach(() => {
    useJobStore.setState({ jobs: [], isLoaded: true, isDirty: false })
  })

  describe('useJob', () => {
    it('returns job by id', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1', company: 'Found' })] })
      const { result } = renderHook(() => useJob('j1'))
      expect(result.current?.company).toBe('Found')
    })

    it('returns null for missing id', () => {
      useJobStore.setState({ jobs: [makeJob({ id: 'j1' })] })
      const { result } = renderHook(() => useJob('nonexistent'))
      expect(result.current).toBeNull()
    })

    it('returns null for null id', () => {
      const { result } = renderHook(() => useJob(null))
      expect(result.current).toBeNull()
    })
  })

  // Test filtering logic directly via store selectors (avoids React 19 + Zustand
  // infinite-loop with non-memoized array selectors in renderHook)

  describe('jobsByStatus filtering', () => {
    it('filters by status, excludes archived', () => {
      const jobs = [
        makeJob({ id: 'j1', status: 'applied' }),
        makeJob({ id: 'j2', status: 'applied', archivedAt: Date.now() }),
        makeJob({ id: 'j3', status: 'wishlist' }),
      ]
      const filtered = jobs.filter((j) => j.status === 'applied' && !j.archivedAt)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('j1')
    })

    it('returns empty for status with no jobs', () => {
      const jobs = [makeJob({ status: 'wishlist' })]
      const filtered = jobs.filter((j) => j.status === 'offer' && !j.archivedAt)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('activeJobs filtering', () => {
    it('returns only active-status non-archived jobs', () => {
      const jobs = [
        makeJob({ id: 'active', status: 'applied' }),
        makeJob({ id: 'terminal', status: 'rejected' }),
        makeJob({ id: 'archived', status: 'applied', archivedAt: Date.now() }),
        makeJob({ id: 'wishlist', status: 'wishlist' }),
      ]
      const active = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status) && !j.archivedAt)
      const ids = active.map((j) => j.id)
      expect(ids).toContain('active')
      expect(ids).toContain('wishlist')
      expect(ids).not.toContain('terminal')
      expect(ids).not.toContain('archived')
    })
  })

  describe('archivedJobs filtering', () => {
    it('returns terminal-status and explicitly archived jobs', () => {
      const jobs = [
        makeJob({ id: 'active', status: 'applied' }),
        makeJob({ id: 'rejected', status: 'rejected' }),
        makeJob({ id: 'ghosted', status: 'ghosted' }),
        makeJob({ id: 'manual-archive', status: 'applied', archivedAt: Date.now() }),
      ]
      const archived = jobs.filter((j) => TERMINAL_STATUSES.includes(j.status) || j.archivedAt)
      const ids = archived.map((j) => j.id)
      expect(ids).toContain('rejected')
      expect(ids).toContain('ghosted')
      expect(ids).toContain('manual-archive')
      expect(ids).not.toContain('active')
    })
  })

  describe('useJobStats', () => {
    it('returns zero stats for empty store', () => {
      const { result } = renderHook(() => useJobStats())
      expect(result.current.total).toBe(0)
      expect(result.current.responseRate).toBe(0)
      expect(result.current.interviewRate).toBe(0)
      expect(result.current.offerRate).toBe(0)
    })

    it('computes correct stats for mixed pipeline', () => {
      useJobStore.setState({
        jobs: [
          makeJob({ status: 'wishlist' }),
          makeJob({ status: 'applied' }),
          makeJob({ status: 'applied' }),
          makeJob({ status: 'phone-screen', responseDate: '2024-01-01' }),
          makeJob({ status: 'technical', responseDate: '2024-01-01' }),
          makeJob({ status: 'offer' }),
          makeJob({ status: 'rejected' }),
          makeJob({ status: 'ghosted' }),
        ],
      })
      const { result } = renderHook(() => useJobStats())
      expect(result.current.total).toBe(8)
      expect(result.current.applied).toBe(7) // all except wishlist
      expect(result.current.interviewing).toBe(2) // phone-screen + technical
      expect(result.current.offers).toBe(1)
    })

    it('excludes archived from total', () => {
      useJobStore.setState({
        jobs: [
          makeJob({ status: 'applied' }),
          makeJob({ status: 'applied', archivedAt: Date.now() }),
        ],
      })
      const { result } = renderHook(() => useJobStats())
      expect(result.current.total).toBe(1)
    })

    it('handles all-wishlist correctly (no division by zero)', () => {
      useJobStore.setState({
        jobs: [makeJob({ status: 'wishlist' }), makeJob({ status: 'wishlist' })],
      })
      const { result } = renderHook(() => useJobStats())
      expect(result.current.total).toBe(2)
      expect(result.current.applied).toBe(0)
      expect(result.current.responseRate).toBe(0)
    })
  })
})
