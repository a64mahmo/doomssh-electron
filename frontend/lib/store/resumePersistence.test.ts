import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useResumeStore } from './resumeStore'
import { saveResume } from '@/lib/db/database'
import { DEFAULT_SETTINGS } from './types'
import { useUIStore } from './uiStore'

// Mock dependencies
vi.mock('@/lib/db/database', () => ({
  saveResume: vi.fn().mockResolvedValue(undefined)
}))

const baseResume = {
  id: 'pers-123',
  name: 'Persistence Test',
  createdAt: 1000,
  updatedAt: 1000,
  template: 'classic' as const,
  settings: { ...DEFAULT_SETTINGS },
  sections: [],
}

describe('resumeStore Persistence logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
    useUIStore.getState().clearErrors()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces multiple saves into one', async () => {
    const store = useResumeStore.getState()
    
    // Trigger 3 updates rapidly
    store.updateSettings({ fontSize: 14 })
    store.updateSettings({ fontSize: 16 })
    store.updateResumeName('New Name')
    
    expect(saveResume).not.toHaveBeenCalled()
    
    // Advance timers by 500ms
    vi.advanceTimersByTime(500)
    
    expect(saveResume).toHaveBeenCalledTimes(1)
    expect(saveResume).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Name',
      settings: expect.objectContaining({ fontSize: 16 })
    }))
  })

  it('updates name and schedules save', () => {
    useResumeStore.getState().updateResumeName('Renamed Resume')
    expect(useResumeStore.getState().resume?.name).toBe('Renamed Resume')
    expect(useResumeStore.getState().isDirty).toBe(true)
    
    vi.advanceTimersByTime(500)
    expect(saveResume).toHaveBeenCalled()
  })

  it('adds an error to uiStore when save fails', async () => {
    vi.mocked(saveResume).mockRejectedValueOnce(new Error('Disk Full'))
    
    useResumeStore.getState().updateResumeName('Failed Save')
    expect(useResumeStore.getState().isDirty).toBe(true)
    
    vi.advanceTimersByTime(500)
    
    // Wait for the async timeout callback to finish
    await vi.runAllTimersAsync()
    
    expect(saveResume).toHaveBeenCalled()
    const errors = useUIStore.getState().errors
    expect(errors).toContain('Persistence Error: Disk Full')
    // Should still be dirty if save failed
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('clears isDirty flag after successful save', async () => {
    vi.mocked(saveResume).mockResolvedValueOnce(undefined)
    
    useResumeStore.getState().updateResumeName('Success Save')
    expect(useResumeStore.getState().isDirty).toBe(true)
    
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    
    expect(saveResume).toHaveBeenCalled()
    expect(useResumeStore.getState().isDirty).toBe(false)
  })

  it('keeps headingColor in sync with accentColor in basic mode', () => {
    // Start with basic mode
    useResumeStore.getState().updateSettings({ colorMode: 'basic', accentColor: '#ff0000' })
    
    // Check they match
    let settings = useResumeStore.getState().resume?.settings
    expect(settings?.colorMode).toBe('basic')
    expect(settings?.headingColor).toBe('#ff0000')
    expect(settings?.accentColor).toBe('#ff0000')

    // Update accentColor and check headingColor follows
    useResumeStore.getState().updateSettings({ accentColor: '#0000ff' })
    settings = useResumeStore.getState().resume?.settings
    expect(settings?.accentColor).toBe('#0000ff')
    expect(settings?.headingColor).toBe('#0000ff')
  })

  it('switches to custom template when settings are modified manually', () => {
    useResumeStore.setState({ 
      resume: { ...baseResume, template: 'modern' }, 
      isDirty: false 
    })
    
    useResumeStore.getState().updateSettings({ fontSize: 13 })
    expect(useResumeStore.getState().resume?.template).toBe('custom')
  })
})
