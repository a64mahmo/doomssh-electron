import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useResumeStore } from '@/lib/store/resumeStore'
import { DEFAULT_SETTINGS } from '@/lib/store/types'

vi.mock('@/lib/db/database', () => ({
  saveResume: vi.fn().mockResolvedValue(undefined),
}))

const baseResume = {
  id: 'test-123',
  name: 'Test Resume',
  kind: 'coverLetter' as const,
  createdAt: 1000,
  updatedAt: 1000,
  template: 'modern' as const,
  settings: { ...DEFAULT_SETTINGS },
  sections: [],
  coverLetter: {
    syncWithResume: false,
    date: '2024-01-01',
    recipient: { hrName: 'John', company: 'Acme', address: '123 St' },
    body: 'Hello',
    signature: { fullName: 'Me', place: 'NY', date: '2024-01-01' },
  }
}

describe('useResumeStore - Cover Letter', () => {
  beforeEach(() => {
    useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
    vi.clearAllMocks()
  })

  it('updates cover letter fields correctly', () => {
    useResumeStore.getState().updateCoverLetter({ body: 'New Body' })
    expect(useResumeStore.getState().resume?.coverLetter?.body).toBe('New Body')
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('merges recipient updates', () => {
    const cl = useResumeStore.getState().resume?.coverLetter
    useResumeStore.getState().updateCoverLetter({ 
      recipient: { ...cl!.recipient, company: 'New Acme' } 
    })
    expect(useResumeStore.getState().resume?.coverLetter?.recipient.company).toBe('New Acme')
    expect(useResumeStore.getState().resume?.coverLetter?.recipient.hrName).toBe('John')
  })

  it('updates signature fields', () => {
    useResumeStore.getState().updateCoverLetter({ 
      signature: { fullName: 'New Me', place: 'SF', date: '2024-02-02' } 
    })
    expect(useResumeStore.getState().resume?.coverLetter?.signature.fullName).toBe('New Me')
    expect(useResumeStore.getState().resume?.coverLetter?.signature.place).toBe('SF')
  })

  it('handles linking a job', () => {
    useResumeStore.getState().updateCoverLetter({ linkedJobId: 'job-123' })
    expect(useResumeStore.getState().resume?.coverLetter?.linkedJobId).toBe('job-123')
  })

  it('handles linking a resume', () => {
    useResumeStore.getState().updateCoverLetter({ linkedResumeId: 'resume-456' })
    expect(useResumeStore.getState().resume?.coverLetter?.linkedResumeId).toBe('resume-456')
  })

  it('toggles sync with resume', () => {
    useResumeStore.getState().updateCoverLetter({ syncWithResume: true })
    expect(useResumeStore.getState().resume?.coverLetter?.syncWithResume).toBe(true)
  })
})
