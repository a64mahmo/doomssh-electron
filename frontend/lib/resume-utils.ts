import type { 
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
