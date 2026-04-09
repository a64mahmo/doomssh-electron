import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  Resume,
  ResumeSection,
  ResumeSettings,
  AnySectionItems,
  SectionType,
  ResumeStore,
} from '@/lib/store/types'
import { SECTION_LABELS } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { saveResume } from '@/lib/db/database'

// Default items factory — one place that defines empty state per section type
function createDefaultItems(type: SectionType): AnySectionItems {
  switch (type) {
    case 'header':
      return { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '' }
    case 'summary':
      return { text: '' }
    case 'experience':
    case 'education':
    case 'skills':
    case 'projects':
    case 'certifications':
    case 'languages':
    case 'awards':
    case 'volunteering':
    case 'publications':
    case 'references':
    case 'custom':
      return []
    default:
      return []
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

// immer produces a Proxy during the set() callback — that Proxy is revoked
// once the mutation is done. We must NOT close over the draft directly.
// Instead we schedule a re-read from the store's finalized state.
function scheduleSave(getState: () => { resume: Resume | null }) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const resume = getState().resume
    if (resume) saveResume(resume)
  }, 500)
}

export const useResumeStore = create<ResumeStore>()(
  immer((set, get) => ({
    resume: null,
    isDirty: false,

    setResume: (resume) => set({ resume, isDirty: false }),

    updateSettings: (updates) =>
      set((state) => {
        if (!state.resume) return
        
        const newSettings = { ...state.resume.settings, ...updates }

        // If in basic mode, we MUST keep headingColor in sync with accentColor
        if (newSettings.colorMode === 'basic') {
          newSettings.headingColor = newSettings.accentColor
        }

        state.resume.settings = newSettings
        
        // If they adjust settings manually, it's now a custom template
        if (state.resume.template !== 'custom') {
          state.resume.template = 'custom'
        }
        state.isDirty = true
        scheduleSave(get)
      }),

    updateSection: (sectionId, updates) =>
      set((state) => {
        if (!state.resume) return
        const idx = state.resume.sections.findIndex((s) => s.id === sectionId)
        if (idx === -1) return
        state.resume.sections[idx] = { ...state.resume.sections[idx], ...updates }
        state.isDirty = true
        scheduleSave(get)
      }),

    updateSectionItems: (sectionId, items) =>
      set((state) => {
        if (!state.resume) return
        const idx = state.resume.sections.findIndex((s) => s.id === sectionId)
        if (idx === -1) return
        state.resume.sections[idx].items = items
        state.isDirty = true
        scheduleSave(get)
      }),

    reorderSections: (activeId, overId) =>
      set((state) => {
        if (!state.resume) return
        const sections = state.resume.sections
        const activeIdx = sections.findIndex((s) => s.id === activeId)
        const overIdx = sections.findIndex((s) => s.id === overId)
        if (activeIdx === -1 || overIdx === -1) return
        const [moved] = sections.splice(activeIdx, 1)
        sections.splice(overIdx, 0, moved)
        state.isDirty = true
        scheduleSave(get)
      }),

    addSection: (type) =>
      set((state) => {
        if (!state.resume) return
        const newSection: ResumeSection = {
          id: generateId(),
          type,
          title: SECTION_LABELS[type],
          visible: true,
          items: createDefaultItems(type),
        }
        state.resume.sections.push(newSection)
        state.isDirty = true
        scheduleSave(get)
      }),

    removeSection: (sectionId) =>
      set((state) => {
        if (!state.resume) return
        state.resume.sections = state.resume.sections.filter((s) => s.id !== sectionId)
        state.isDirty = true
        scheduleSave(get)
      }),

    toggleSectionVisibility: (sectionId) =>
      set((state) => {
        if (!state.resume) return
        const section = state.resume.sections.find((s) => s.id === sectionId)
        if (section) {
          section.visible = !section.visible
          state.isDirty = true
          scheduleSave(get)
        }
      }),

    markSaved: () => set({ isDirty: false }),
  }))
)
