import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DebugToast } from '@/components/DebugToast'
import { useUIStore } from '@/lib/store/uiStore'
import { useResumeStore } from '@/lib/store/resumeStore'
import { toast } from 'sonner'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe('DebugToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not show toast when debugMode is false', () => {
    useUIStore.setState({ errors: ['Test error'] })
    useResumeStore.setState({ resume: { settings: { debugMode: false } } as any })
    
    render(<DebugToast />)
    
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should not show toast when there are no errors', () => {
    useUIStore.setState({ errors: [] })
    useResumeStore.setState({ resume: { settings: { debugMode: true } } as any })
    
    render(<DebugToast />)
    
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should show toast when globalDebugMode is true and there are errors', () => {
    useUIStore.setState({ errors: ['Global error'], globalDebugMode: true })
    useResumeStore.setState({ resume: { settings: { debugMode: false } } as any })
    
    render(<DebugToast />)
    
    expect(toast.error).toHaveBeenCalledWith('System Errors Detected', expect.any(Object))
  })

  it('should not show toast when both debug modes are false', () => {
    useUIStore.setState({ errors: ['Some error'], globalDebugMode: false })
    useResumeStore.setState({ resume: { settings: { debugMode: false } } as any })
    
    render(<DebugToast />)
    
    expect(toast.error).not.toHaveBeenCalled()
  })
})
