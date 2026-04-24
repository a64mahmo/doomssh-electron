import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TargetJobCard } from '@/components/cover-letter/sections/TargetJobCard'
import { useResumeStore } from '@/lib/store/resumeStore'
import { useJobStore } from '@/lib/store/jobStore'
import { toast } from 'sonner'

// Mock icons to avoid rendering complexity
vi.mock('lucide-react', () => ({
  Briefcase: () => <div data-testid="briefcase-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

describe('TargetJobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useResumeStore.setState({
      resume: {
        id: 'res-1',
        coverLetter: {
          linkedJobId: null,
          recipient: { company: '', hrName: '', address: '' }
        }
      } as any
    })
    useJobStore.setState({
      jobs: [
        { id: 'job-1', company: 'Acme Corp', role: 'Engineer', archivedAt: null },
        { id: 'job-2', company: 'Globex', role: 'Dev', archivedAt: 12345 } // Archived
      ] as any
    })
  })

  it('renders "No active jobs" message when job list is empty', () => {
    useJobStore.setState({ jobs: [] })
    render(<TargetJobCard />)
    expect(screen.getByText(/No active jobs/i)).toBeDefined()
  })

  it('renders a select trigger with active jobs', () => {
    render(<TargetJobCard />)
    expect(screen.getByRole('combobox')).toBeDefined()
    // It should only show non-archived jobs
    // Globex should be filtered out
  })

  it('shows targeting info when a job is linked', () => {
    useResumeStore.setState({
      resume: {
        coverLetter: { linkedJobId: 'job-1' }
      } as any
    })
    render(<TargetJobCard />)
    expect(screen.getByText(/Currently targeting Engineer at Acme Corp/i)).toBeDefined()
  })
})
