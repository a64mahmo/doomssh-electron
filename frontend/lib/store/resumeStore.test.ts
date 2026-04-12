import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useResumeStore } from './resumeStore'
import { generateId } from '@/lib/utils/ids'
import { DEFAULT_SETTINGS } from './types'

// Mock dependencies
vi.mock('@/lib/utils/ids', () => ({
  generateId: vi.fn(() => 'test-id')
}))

vi.mock('@/lib/db/database', () => ({
  saveResume: vi.fn()
}))

const baseResume = {
  id: '123',
  name: 'My Resume',
  createdAt: 1000,
  updatedAt: 1000,
  template: 'classic' as const,
  settings: { ...DEFAULT_SETTINGS },
  sections: [],
}

describe('resumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({ resume: { ...baseResume }, isDirty: false })
    vi.clearAllMocks()
  })

  it('sets a new resume', () => {
    const newResume = { ...baseResume, id: '456', name: 'New' }
    useResumeStore.getState().setResume(newResume)
    expect(useResumeStore.getState().resume).toEqual(newResume)
    expect(useResumeStore.getState().isDirty).toBe(false)
  })

  it('updates settings', () => {
    useResumeStore.getState().updateSettings({ fontSize: 14 })
    expect(useResumeStore.getState().resume?.settings.fontSize).toBe(14)
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('adds a section', () => {
    useResumeStore.getState().addSection('experience')
    const sections = useResumeStore.getState().resume?.sections
    expect(sections).toHaveLength(1)
    expect(sections?.[0].type).toBe('experience')
    expect(sections?.[0].id).toBe('test-id')
  })

  it('removes a section', () => {
    useResumeStore.getState().addSection('experience')
    useResumeStore.getState().removeSection('test-id')
    expect(useResumeStore.getState().resume?.sections).toHaveLength(0)
  })

  it('toggles section visibility', () => {
    useResumeStore.getState().addSection('experience')
    useResumeStore.getState().toggleSectionVisibility('test-id')
    expect(useResumeStore.getState().resume?.sections[0].visible).toBe(false)
    useResumeStore.getState().toggleSectionVisibility('test-id')
    expect(useResumeStore.getState().resume?.sections[0].visible).toBe(true)
  })

  it('reorders sections', () => {
    vi.mocked(generateId).mockReturnValueOnce('id-1')
    useResumeStore.getState().addSection('experience')
    vi.mocked(generateId).mockReturnValueOnce('id-2')
    useResumeStore.getState().addSection('education')

    const before = useResumeStore.getState().resume?.sections
    expect(before?.[0].id).toBe('id-1')
    expect(before?.[1].id).toBe('id-2')

    useResumeStore.getState().reorderSections('id-1', 'id-2')

    const after = useResumeStore.getState().resume?.sections
    expect(after?.[0].id).toBe('id-2')
    expect(after?.[1].id).toBe('id-1')
  })

  it('updates section items', () => {
    useResumeStore.getState().addSection('header')
    const newItems = { 
      fullName: 'Updated Name', 
      jobTitle: 'Developer',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
    }
    const sectionId = useResumeStore.getState().resume?.sections[0].id || 'id'
    useResumeStore.getState().updateSectionItems(sectionId, newItems)
    
    const section = useResumeStore.getState().resume?.sections[0]
    expect(section?.items).toEqual(newItems)
    expect(useResumeStore.getState().isDirty).toBe(true)
  })

  it('marks resume as saved', () => {
    useResumeStore.getState().updateSettings({ fontSize: 12 })
    expect(useResumeStore.getState().isDirty).toBe(true)
    
    useResumeStore.getState().markSaved()
    expect(useResumeStore.getState().isDirty).toBe(false)
  })
})
