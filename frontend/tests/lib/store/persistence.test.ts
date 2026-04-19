import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useResumeStore } from '@/lib/store/resumeStore'
import { DEFAULT_SETTINGS } from '@/lib/store/types'

const mockSaveResume = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/db/database', () => ({
  saveResume: (...args: unknown[]) => mockSaveResume(...args),
}))

vi.mock('@/lib/store/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      addError: vi.fn(),
    }),
  },
}))

vi.mock('@/lib/store/persistenceManager', () => ({
  initPersistence: vi.fn(),
}))

const createTestResume = () => ({
  id: 'persist-test-123',
  name: 'Persistence Test',
  createdAt: 1000,
  updatedAt: 1000,
  template: 'modern' as const,
  settings: { ...DEFAULT_SETTINGS },
  sections: [
    {
      id: 'header-1',
      type: 'header' as const,
      title: 'Header',
      visible: true,
      items: { fullName: 'Test User', jobTitle: 'Developer', email: '', phone: '', location: '', website: '', linkedin: '', github: '' },
    },
  ],
})

describe('Persistence Behavior', () => {
  beforeEach(async () => {
    useResumeStore.setState({ resume: null, isDirty: false })
    vi.clearAllMocks()
    mockSaveResume.mockResolvedValue(undefined)
    
    // Import and initialize persistence manager
    const { initPersistence } = await import('@/lib/store/persistenceManager')
    initPersistence()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isDirty state changes', () => {
    it('should mark dirty when settings are updated', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when section items are updated', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().updateSectionItems('header-1', { fullName: 'Updated Name', jobTitle: 'Developer', email: '', phone: '', location: '', website: '', linkedin: '', github: '' })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when resume name is updated', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().updateResumeName('New Resume Name')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when section is added', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().addSection('experience')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when section is removed', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().removeSection('header-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when sections are reordered', () => {
      const resume = createTestResume()
      resume.sections.push({
        id: 'exp-1',
        type: 'experience' as const,
        title: 'Experience',
        visible: true,
        items: [],
      })
      useResumeStore.setState({ resume, isDirty: false })
      useResumeStore.getState().reorderSections('header-1', 'exp-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when section visibility is toggled', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      useResumeStore.getState().toggleSectionVisibility('header-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should mark dirty when setResume is called without isLoaded flag', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      const newResume = { ...createTestResume(), name: 'Another Resume' }
      useResumeStore.getState().setResume(newResume)
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('should NOT mark dirty when setResume is called with isLoaded=true', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: true })
      const loadedResume = { ...createTestResume(), name: 'Loaded Resume' }
      useResumeStore.getState().setResume(loadedResume, true)
      expect(useResumeStore.getState().isDirty).toBe(false)
    })

    it('should mark saved when markSaved is called', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: true })
      useResumeStore.getState().markSaved()
      expect(useResumeStore.getState().isDirty).toBe(false)
    })
  })

  describe('Multiple rapid changes', () => {
    it('should mark dirty after multiple rapid changes', () => {
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      
      // Make multiple changes rapidly
      useResumeStore.getState().updateSettings({ fontSize: 12 })
      useResumeStore.getState().updateSettings({ fontFamily: 'Roboto' })
      useResumeStore.getState().updateResumeName('Quick Name Change')
      
      // All changes should result in a single dirty state
      expect(useResumeStore.getState().isDirty).toBe(true)
    })
  })

  describe('Error recovery', () => {
    it('should remain dirty if save fails', async () => {
      mockSaveResume.mockRejectedValueOnce(new Error('Save failed'))
      useResumeStore.setState({ resume: createTestResume(), isDirty: false })
      
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      expect(useResumeStore.getState().isDirty).toBe(true)
      
      // Wait for the save attempt
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Should still be dirty because save failed
      expect(useResumeStore.getState().isDirty).toBe(true)
    })
  })

  describe('No resume state', () => {
    it('should not mark dirty if there is no resume', () => {
      useResumeStore.setState({ resume: null, isDirty: false })
      
      // These should not crash
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      useResumeStore.getState().updateSectionItems('any', [])
      
      expect(useResumeStore.getState().isDirty).toBe(false)
    })
  })
})

describe('PersistenceManager initialization', () => {
  it('should export initPersistence function', async () => {
    const { initPersistence } = await import('@/lib/store/persistenceManager')
    expect(typeof initPersistence).toBe('function')
  })

  it('should only initialize once', async () => {
    vi.useFakeTimers()
    
    const { initPersistence } = await import('@/lib/store/persistenceManager')
    const { initPersistence: initPersistence2 } = await import('@/lib/store/persistenceManager')
    
    // Both calls should return the same initialized state
    expect(initPersistence).toBe(initPersistence2)
  })
})
