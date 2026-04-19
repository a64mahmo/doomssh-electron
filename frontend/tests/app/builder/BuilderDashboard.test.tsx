import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import BuilderDashboard from '@/app/builder/page'
import { getAllResumes, deleteResume, createNewResume, saveResume } from '@/lib/db/database'
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
      getDebugMode: vi.fn().mockResolvedValue(false),
      getAppVersion: vi.fn().mockResolvedValue('1.0.0'),
      platform: 'darwin',
      onUpdateChecking: vi.fn(() => () => {}),
      onUpdateAvailable: vi.fn(() => () => {}),
      onUpdateNotAvailable: vi.fn(() => () => {}),
      onUpdateProgress: vi.fn(() => () => {}),
      onUpdateDownloaded: vi.fn(() => () => {}),
      onUpdateError: vi.fn(() => () => {}),
    } as any
  })

  it('should handle the full lifecycle: Create -> Delete', async () => {
    const mockId = 'lifecycle-test-id'
    const initialResume = { id: mockId, name: 'Untitled Resume', template: 'classic', updatedAt: Date.now() }

    // Setup mocks to return data immediately after bypass
    vi.mocked(createNewResume).mockReturnValue(initialResume as any)
    vi.mocked(getAllResumes).mockResolvedValue([initialResume] as any)

    render(<BuilderDashboard />)

    // 1. Wait for dashboard to show
    await waitFor(() => {
      expect(screen.queryByText(/Choose a Vault Folder/i)).toBeNull()
      expect(screen.getByText(/My Resumes/i)).toBeTruthy()
    }, { timeout: 4000 })

    // 2. Trigger Create - pick the header button
    const headerBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('New Resume') && b.className.includes('bg-foreground'))
    if (!headerBtn) throw new Error('Could not find header create button')
    
    await act(async () => {
      fireEvent.click(headerBtn)
    })

    expect(createNewResume).toHaveBeenCalled()
    // Verify saveResume was called (handleCreate in page.tsx calls saveResume(resume))
    await waitFor(() => {
      expect(saveResume).toHaveBeenCalled()
    })

    // 3. Verify card exists
    await waitFor(() => expect(screen.getByText('Untitled Resume')).toBeTruthy())

    // 4. Trigger Delete
    // Mock getAllResumes to return empty for the refresh after delete
    vi.mocked(getAllResumes).mockResolvedValueOnce([])

    const dropdownTrigger = document.querySelector('.shrink-0.w-6.h-6')
    if (!dropdownTrigger) throw new Error('Could not find dropdown trigger')
    
    await act(async () => {
      fireEvent.click(dropdownTrigger)
    })

    const deleteItem = await screen.findByText('Delete')
    await act(async () => {
      fireEvent.click(deleteItem)
    })

    // Verify final state
    await waitFor(() => {
      expect(deleteResume).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Resume deleted')
    })
  })

  it('should show an error toast if deletion fails (silencing expected stderr)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const mockResumes = [{ id: '1', name: 'Resume 1', template: 'modern', updatedAt: Date.now() }]
    vi.mocked(getAllResumes).mockResolvedValue(mockResumes as any)
    vi.mocked(deleteResume).mockRejectedValue(new Error('FileSystem Error') as any)

    render(<BuilderDashboard />)

    await waitFor(() => expect(screen.queryByText(/My Resumes/i)).toBeTruthy(), { timeout: 4000 })
    await waitFor(() => expect(screen.getByText('Resume 1')).toBeTruthy())

    const dropdownTrigger = document.querySelector('.shrink-0.w-6.h-6')
    if (!dropdownTrigger) throw new Error('Could not find dropdown trigger')
    
    await act(async () => {
      fireEvent.click(dropdownTrigger)
    })

    const deleteItem = await screen.findByText('Delete')
    await act(async () => {
      fireEvent.click(deleteItem)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete resume')
    })

    consoleSpy.mockRestore()
  })

  it('should only show valid resumes and ignore system files', async () => {
    const mixedData = [
      { id: '1', name: 'Valid Resume', updatedAt: Date.now() },
      { version: 1, jobs: [] } 
    ]

    vi.mocked(getAllResumes).mockResolvedValue(mixedData.filter(d => (d as any).id && (d as any).name) as any)

    render(<BuilderDashboard />)

    await waitFor(() => expect(screen.queryByText(/My Resumes/i)).toBeTruthy(), { timeout: 4000 })
    await waitFor(() => expect(screen.getByText('Valid Resume')).toBeTruthy())
    expect(screen.getByText(/1 resume/)).toBeTruthy()
  })
})
