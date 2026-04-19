import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import BuilderDashboard from '@/app/builder/page'
import { useUIStore } from '@/lib/store/uiStore'
import { getAllResumes } from '@/lib/db/database'

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

describe('BuilderDashboard Settings & Bug Mode', () => {
  const mockElectron = {
    vault: {
      getPath: vi.fn().mockResolvedValue('/mock/vault'),
      setPath: vi.fn().mockResolvedValue('/mock/vault'),
    },
    getApiKey: vi.fn().mockResolvedValue('sk-test-key'),
    getDebugMode: vi.fn().mockResolvedValue(true),
    setDebugMode: vi.fn().mockResolvedValue(undefined),
    setApiKey: vi.fn().mockResolvedValue(undefined),
    getAppVersion: vi.fn().mockResolvedValue('1.0.0'),
    checkForUpdates: vi.fn().mockResolvedValue(undefined),
    restartAndInstall: vi.fn().mockResolvedValue(undefined),
    platform: 'darwin',
    onUpdateChecking: vi.fn(() => () => {}),
    onUpdateAvailable: vi.fn(() => () => {}),
    onUpdateNotAvailable: vi.fn(() => () => {}),
    onUpdateProgress: vi.fn(() => () => {}),
    onUpdateDownloaded: vi.fn(() => () => {}),
    onUpdateError: vi.fn(() => () => {}),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.window.electron = mockElectron as any
    useUIStore.getState().setGlobalDebugMode(false)
    vi.mocked(getAllResumes).mockResolvedValue([])
  })

  async function openSettings() {
    await waitFor(() => {
      expect(screen.queryByText(/My Resumes/i)).toBeTruthy()
    })
    
    const settingsBtn = screen.getByText(/Settings/i)
    await act(async () => {
      fireEvent.click(settingsBtn)
    })
  }

  it('should load Bug Mode state from electron on mount', async () => {
    await act(async () => {
      render(<BuilderDashboard />)
    })

    await waitFor(() => {
      expect(mockElectron.getDebugMode).toHaveBeenCalled()
    })

    expect(useUIStore.getState().globalDebugMode).toBe(true)
  })

  it('should persist Bug Mode state to electron when saving settings', async () => {
    await act(async () => {
      render(<BuilderDashboard />)
    })

    await openSettings()

    // Find the Bug Mode switch
    const bugModeSwitch = screen.getByRole('switch', { name: /Bug Mode/i })
    
    // Toggle it off (it was true from mount)
    await act(async () => {
      fireEvent.click(bugModeSwitch)
    })
    
    expect(useUIStore.getState().globalDebugMode).toBe(false)

    // Save
    const saveBtn = screen.getByText(/Save Changes/i)
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    expect(mockElectron.setDebugMode).toHaveBeenCalledWith(false)
  })

  it('should show the bug mode description in settings', async () => {
    await act(async () => {
      render(<BuilderDashboard />)
    })
    await openSettings()
    
    expect(screen.getByText(/Enable persistent error notifications for debugging/i)).toBeTruthy()
  })
})
