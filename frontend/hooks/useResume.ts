'use client'
import { useCallback } from 'react'
import { useResumeStore } from '@/lib/store/resumeStore'
import type { SectionType, ResumeSection, AnySectionItems } from '@/lib/store/types'

export function useResume() {
  const store = useResumeStore()
  return {
    resume: store.resume,
    isDirty: store.isDirty,
    setResume: store.setResume,
    updateSettings: store.updateSettings,
  }
}

export function useSection(sectionId: string) {
  const store = useResumeStore()
  const section = store.resume?.sections.find((s) => s.id === sectionId)

  const update = useCallback(
    (updates: Partial<ResumeSection>) => store.updateSection(sectionId, updates),
    [sectionId, store]
  )

  const updateItems = useCallback(
    (items: AnySectionItems) => store.updateSectionItems(sectionId, items),
    [sectionId, store]
  )

  const toggle = useCallback(
    () => store.toggleSectionVisibility(sectionId),
    [sectionId, store]
  )

  const remove = useCallback(
    () => store.removeSection(sectionId),
    [sectionId, store]
  )

  return { section, update, updateItems, toggle, remove }
}

export function useSections() {
  const store = useResumeStore()
  return {
    sections: store.resume?.sections ?? [],
    addSection: store.addSection,
    reorderSections: store.reorderSections,
  }
}
