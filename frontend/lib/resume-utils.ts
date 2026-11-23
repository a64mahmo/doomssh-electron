import type { ResumeSection, 
  ExperienceItem, 
  EducationItem, 
  ResumeSettings 
} from '@/lib/store/types'
import { formatDateRange } from '@/lib/utils/dates'

export interface EntryData {
  id: string
  title: string
  subtitle?: string
  location?: string
  date: string
  description: string
}

export function transformExperienceItem(item: ExperienceItem, settings: ResumeSettings): EntryData {
  const title = settings.experienceOrder === 'employer-title' ? item.company : item.position
  const sub = settings.experienceOrder === 'employer-title' ? item.position : item.company
  
  return {
    id: item.id,
    title,
    subtitle: sub || undefined,
    location: item.location,
    date: formatDateRange(item.startDate, item.endDate, item.present, settings.dateFormat),
    description: item.description,
  }
}

export function transformEducationItem(item: EducationItem, settings: ResumeSettings): EntryData {
  const degreeStr = [item.degree, item.field].filter(Boolean).join(', ')
  const title = settings.educationOrder === 'school-degree' ? item.institution : (degreeStr || item.institution)
  const sub = settings.educationOrder === 'school-degree' ? degreeStr : item.institution
  
  return {
    id: item.id,
    title,
    subtitle: sub || undefined,
    location: item.location,
    date: formatDateRange(item.startDate, item.endDate, item.present, settings.dateFormat),
    description: item.description,
  }
}

/**
 * Whether a section shows on the resume: switched on, with something in it (a
 * summary with text, or at least one entry). Hidden or empty sections are left
 * out of lists like Section Placement, where there is nothing to place.
 */
export function sectionHasContent(section: ResumeSection): boolean {
  if (section.visible === false) return false
  const items = section.items as unknown
  if (Array.isArray(items)) return items.length > 0
  if (section.type === 'summary') return Boolean((items as { text?: string })?.text?.trim())
  return items != null
}
