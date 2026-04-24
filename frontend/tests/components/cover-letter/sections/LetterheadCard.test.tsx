import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LetterheadCard } from '@/components/cover-letter/sections/LetterheadCard'
import { useResumeStore } from '@/lib/store/resumeStore'
import { getAllResumes, getResume } from '@/lib/db/database'

// Mock icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Link: () => <div data-testid="link-icon" />,
  Unlink: () => <div data-testid="unlink-icon" />,
  PencilLine: () => <div data-testid="pencil-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
}))

// Mock DB
vi.mock('@/lib/db/database', () => ({
  getAllResumes: vi.fn().mockResolvedValue([]),
  getResume: vi.fn().mockResolvedValue(null),
}))

describe('LetterheadCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useResumeStore.setState({
      resume: {
        id: 'res-cl',
        sections: [{ id: 'h1', type: 'header', items: { fullName: 'Original Name' } }],
        coverLetter: {
          syncWithResume: false,
          linkedResumeId: null,
        }
      } as any
    })
  })

  it('renders "Connect a Resume" button when sync is off', () => {
    render(<LetterheadCard />)
    expect(screen.getByText(/Connect a Resume/i)).toBeDefined()
  })

  it('shows linked resume info when sync is on', async () => {
    const mockResume = { id: 'res-source', name: 'Master Resume', template: 'modern' }
    ;(getAllResumes as any).mockResolvedValue([mockResume])
    
    useResumeStore.setState({
      resume: {
        id: 'res-cl',
        sections: [{ id: 'h1', type: 'header', items: { fullName: 'Original Name' } }],
        coverLetter: {
          syncWithResume: true,
          linkedResumeId: 'res-source',
        }
      } as any
    })

    render(<LetterheadCard />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Master Resume').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/Mirroring contact info live/i)).toBeDefined()
  })

  it('shows lock icons on inputs when sync is on', () => {
    useResumeStore.setState({
      resume: {
        id: 'res-cl',
        sections: [{ id: 'h1', type: 'header', items: { fullName: 'Original Name' } }],
        coverLetter: { syncWithResume: true }
      } as any
    })
    render(<LetterheadCard />)
    // There should be 4 lock icons (name, title, email, phone)
    expect(screen.getAllByTestId('lock-icon').length).toBeGreaterThan(0)
  })
})
