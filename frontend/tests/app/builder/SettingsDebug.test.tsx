import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'
import { useUIStore } from '@/lib/store/uiStore'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/builder',
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}))

describe('Sidebar Settings & Bug Mode', () => {
  const mockElectron = {
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
  })

  async function openSettings() {
    const settingsBtn = screen.getByText(/Settings/i)
    await act(async () => {
      fireEvent.click(settingsBtn)
    })
  }

  it('should load Bug Mode state from electron on mount', async () => {
    await act(async () => {
      render(
        <TooltipProvider>
          <Sidebar />
        </TooltipProvider>
      )
    })

    await waitFor(() => {
      expect(mockElectron.getDebugMode).toHaveBeenCalled()
    })

    expect(useUIStore.getState().globalDebugMode).toBe(true)
  })

  it('should persist Bug Mode state to electron when saving settings', async () => {
    await act(async () => {
      render(
        <TooltipProvider>
          <Sidebar />
        </TooltipProvider>
      )
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
      render(
        <TooltipProvider>
          <Sidebar />
        </TooltipProvider>
      )
    })
    await openSettings()
    
    expect(screen.getByText(/Enable persistent error notifications for debugging/i)).toBeTruthy()
  })
})
