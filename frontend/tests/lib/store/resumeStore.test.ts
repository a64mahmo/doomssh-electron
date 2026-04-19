import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useResumeStore } from '@/lib/store/resumeStore'
import { DEFAULT_SETTINGS } from '@/lib/store/types'

vi.mock('@/lib/db/database', () => ({
  saveResume: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/store/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      addError: vi.fn(),
    }),
  },
}))

const baseResume = {
  id: 'test-123',
  name: 'Test Resume',
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
    {
      id: 'exp-1',
      type: 'experience' as const,
      title: 'Experience',
      visible: true,
      items: [
        { id: '1', company: 'Test Co', position: 'Developer', location: 'Remote', startDate: '2020', endDate: '', present: true, description: 'Test work' },
      ],
    },
  ],
}

describe('useResumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({ resume: null, isDirty: false })
    vi.clearAllMocks()
  })

  describe('setResume', () => {
    it('sets isDirty true when setting a new resume (not from load)', () => {
      useResumeStore.getState().setResume({ ...baseResume })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('sets isDirty false when loading a resume from storage', () => {
      useResumeStore.getState().setResume({ ...baseResume }, true)
      expect(useResumeStore.getState().isDirty).toBe(false)
    })

    it('preserves resume data when setting', () => {
      useResumeStore.getState().setResume({ ...baseResume }, true)
      expect(useResumeStore.getState().resume?.name).toBe('Test Resume')
      expect(useResumeStore.getState().resume?.id).toBe('test-123')
    })
  })

  describe('updateSettings', () => {
    it('marks isDirty true when settings are updated', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('updates the settings value', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      expect(useResumeStore.getState().resume?.settings.fontSize).toBe(14)
    })

    it('keeps headingColor in sync with accentColor in basic mode', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSettings({ accentColor: '#ff0000' })
      expect(useResumeStore.getState().resume?.settings.headingColor).toBe('#ff0000')
    })

    it('switches to custom template when settings are modified', () => {
      useResumeStore.setState({ resume: { ...baseResume, template: 'modern' }, isDirty: false })
      useResumeStore.getState().updateSettings({ fontSize: 14 })
      expect(useResumeStore.getState().resume?.template).toBe('custom')
    })

    it('switches to custom when settings are updated (including template)', () => {
      useResumeStore.setState({ resume: { ...baseResume, template: 'modern' }, isDirty: false })
      useResumeStore.getState().updateSettings({ template: 'classic' })
      expect(useResumeStore.getState().resume?.template).toBe('custom')
    })
  })

  describe('updateSectionItems', () => {
    it('marks isDirty true when section items are updated', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSectionItems('header-1', { ...baseResume.sections[0].items, fullName: 'New Name' })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('updates the section items', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSectionItems('header-1', { ...baseResume.sections[0].items, fullName: 'New Name' })
      expect(useResumeStore.getState().resume?.sections[0].items.fullName).toBe('New Name')
    })

    it('does nothing if section not found', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSectionItems('non-existent', { fullName: 'Test' })
      expect(useResumeStore.getState().isDirty).toBe(false)
    })
  })

  describe('updateResumeName', () => {
    it('marks isDirty true when name is updated', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateResumeName('New Name')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('updates the resume name', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateResumeName('New Name')
      expect(useResumeStore.getState().resume?.name).toBe('New Name')
    })
  })

  describe('addSection', () => {
    it('marks isDirty true when a section is added', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().addSection('skills')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('adds a new section to the resume', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().addSection('skills')
      const sections = useResumeStore.getState().resume?.sections
      expect(sections?.some(s => s.type === 'skills')).toBe(true)
    })
  })

  describe('removeSection', () => {
    it('marks isDirty true when a section is removed', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().removeSection('header-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('removes the section from the resume', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().removeSection('header-1')
      const sections = useResumeStore.getState().resume?.sections
      expect(sections?.some(s => s.id === 'header-1')).toBe(false)
    })
  })

  describe('toggleSectionVisibility', () => {
    it('marks isDirty true when section visibility is toggled', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().toggleSectionVisibility('header-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('toggles the section visibility', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      const wasVisible = useResumeStore.getState().resume?.sections[0].visible
      useResumeStore.getState().toggleSectionVisibility('header-1')
      expect(useResumeStore.getState().resume?.sections[0].visible).toBe(!wasVisible)
    })
  })

  describe('reorderSections', () => {
    it('marks isDirty true when sections are reordered', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().reorderSections('header-1', 'exp-1')
      expect(useResumeStore.getState().isDirty).toBe(true)
    })
  })

  describe('markSaved', () => {
    it('sets isDirty to false', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: true })
      useResumeStore.getState().markSaved()
      expect(useResumeStore.getState().isDirty).toBe(false)
    })
  })

  describe('isDirty state transitions', () => {
    it('remains dirty if save is not triggered', () => {
      useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
      useResumeStore.getState().updateSettings({ fontSize: 12 })
      expect(useResumeStore.getState().isDirty).toBe(true)
    })

    it('isDirty starts as false with no resume', () => {
      useResumeStore.setState({ resume: null })
      expect(useResumeStore.getState().isDirty).toBe(false)
    })
  })
})
