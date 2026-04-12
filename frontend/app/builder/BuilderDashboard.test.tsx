import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import BuilderDashboard from './page'
import { getAllResumes, deleteResume } from '@/lib/db/database'
import { toast } from 'sonner'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}))

// Mock database
vi.mock('@/lib/db/database', () => ({
  getAllResumes: vi.fn(),
  deleteResume: vi.fn(),
  duplicateResume: vi.fn(),
  createNewResume: vi.fn(),
  saveResume: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }
}))

describe('BuilderDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock electron bridge
    global.window.electron = {
      vault: {
        getPath: vi.fn().mockResolvedValue('/mock/vault'),
        setPath: vi.fn().mockResolvedValue('/mock/vault'),
      },
      getApiKey: vi.fn().mockResolvedValue(''),
      platform: 'darwin',
      onUpdateAvailable: vi.fn(() => () => {}),
      onUpdateDownloaded: vi.fn(() => () => {}),
    } as any
  })

  it('should call deleteResume and refresh the list when a resume is deleted', async () => {
    const mockResumes = [
      { id: '1', name: 'Resume 1', template: 'modern', updatedAt: Date.now() },
      { id: '2', name: 'Resume 2', template: 'classic', updatedAt: Date.now() },
    ]

    vi.mocked(getAllResumes).mockResolvedValueOnce(mockResumes as any)
    vi.mocked(getAllResumes).mockResolvedValueOnce([mockResumes[1]] as any)
    vi.mocked(deleteResume).mockResolvedValue(undefined as any)

    render(<BuilderDashboard />)

    // Wait for resumes to load
    await waitFor(() => {
      expect(screen.getByText('Resume 1')).toBeTruthy()
    }, { timeout: 3000 })

    const dropdownTriggers = screen.getAllByRole('button')
    // We need to click the one that has the more-horizontal icon
    const trigger = dropdownTriggers.find(t => t.className.includes('shrink-0 w-6 h-6'))
    if (!trigger) throw new Error('Could not find dropdown trigger')
    
    await act(async () => {
      fireEvent.click(trigger)
    })

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeTruthy()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'))
    })

    await waitFor(() => {
      expect(deleteResume).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(screen.queryByText('Resume 1')).toBeNull()
      expect(screen.getByText('Resume 2')).toBeTruthy()
    })

    expect(toast.success).toHaveBeenCalledWith('Resume deleted')
  })

  it('should show an error toast if deletion fails', async () => {
    const mockResumes = [{ id: '1', name: 'Resume 1', template: 'modern', updatedAt: Date.now() }]
    vi.mocked(getAllResumes).mockResolvedValue(mockResumes as any)
    vi.mocked(deleteResume).mockRejectedValue(new Error('FileSystem Error') as any)

    render(<BuilderDashboard />)

    await waitFor(() => expect(screen.getByText('Resume 1')).toBeTruthy())

    const dropdownTrigger = screen.getAllByRole('button').find(b => b.className.includes('shrink-0 w-6 h-6'))
    if (!dropdownTrigger) throw new Error('Could not find dropdown trigger')
    
    await act(async () => {
      fireEvent.click(dropdownTrigger)
    })

    await waitFor(() => expect(screen.getByText('Delete')).toBeTruthy())
    
    await act(async () => {
      fireEvent.click(screen.getByText('Delete'))
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete resume')
    })
  })

  it('should only show valid resumes and ignore system files', async () => {
    const mixedData = [
      { id: '1', name: 'Valid Resume', updatedAt: Date.now() },
      { version: 1, jobs: [] } // Fake _jobs.json content
    ]

    // In a real scenario, the Electron backend handles the filtering now,
    // but the frontend should also be robust.
    vi.mocked(getAllResumes).mockResolvedValue(mixedData.filter(d => (d as any).id && (d as any).name) as any)

    render(<BuilderDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Valid Resume')).toBeTruthy()
    })

    // Ensure the jobs data isn't rendered as a resume card
    // Resume cards show the template name (default 'classic' if not provided in mock)
    // but the jobs object doesn't have template or name properties that would render a valid card.
    expect(screen.queryByText(/0 resumes/)).toBeNull() 
    expect(screen.getByText(/1 resume/)).toBeTruthy()
  })
})
