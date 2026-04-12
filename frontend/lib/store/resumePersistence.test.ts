import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useResumeStore } from './resumeStore'
import { saveResume } from '@/lib/db/database'
import { DEFAULT_SETTINGS } from './types'

// Mock dependencies
vi.mock('@/lib/db/database', () => ({
  saveResume: vi.fn().mockResolvedValue(undefined)
}))

const baseResume = {
  id: 'pers-123',
  name: 'Persistence Test',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  template: 'classic' as const,
  settings: { ...DEFAULT_SETTINGS },
  sections: [],
}

describe('resumeStore Persistence logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
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
