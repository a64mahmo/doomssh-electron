import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useResumeStore } from './resumeStore'
import { DEFAULT_SETTINGS } from './types'

// Mock persistence manager entirely to avoid timer conflicts
vi.mock('./persistenceManager', () => ({
  initPersistence: vi.fn(),
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
    useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
  })

  it('marks isDirty true when name is updated', () => {
    useResumeStore.getState().updateResumeName('New Name')
    expect(useResumeStore.getState().resume?.name).toBe('New Name')
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('marks isDirty true when settings are updated', () => {
    useResumeStore.getState().setResume(useResumeStore.getState().resume!, true)
    useResumeStore.getState().updateSettings({ fontSize: 14 })
    expect(useResumeStore.getState().resume?.settings.fontSize).toBe(14)
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('marks isDirty true when section items are updated', () => {
    const resume = useResumeStore.getState().resume
    if (!resume) return
    const sectionId = resume.sections[0]?.id
    if (sectionId) {
      useResumeStore.getState().updateSectionItems(sectionId, [{ id: '1', name: 'Test' }])
      expect(useResumeStore.getState().isDirty).toBe(true)
    }
  })

  it('keeps headingColor in sync with accentColor in basic mode', () => {
    useResumeStore.getState().updateSettings({ colorMode: 'basic', accentColor: '#ff0000' })
    
    let settings = useResumeStore.getState().resume?.settings
    expect(settings?.colorMode).toBe('basic')
    expect(settings?.headingColor).toBe('#ff0000')
    expect(settings?.accentColor).toBe('#ff0000')

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

  it('sets isDirty false when markSaved is called', () => {
    useResumeStore.getState().updateResumeName('Test')
    expect(useResumeStore.getState().isDirty).toBe(true)
    useResumeStore.getState().markSaved()
    expect(useResumeStore.getState().isDirty).toBe(false)
  })
})
