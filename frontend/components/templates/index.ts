import type { TemplateId, ResumeSettings } from '@/lib/store/types'
import type { ComponentType } from 'react'
import type { Resume } from '@/lib/store/types'
import { MasterTemplate } from './MasterTemplate'

// Registry — add new templates here only
export const TEMPLATE_META: Record<TemplateId, { label: string; description: string }> = {
  modern: { label: 'Modern', description: 'Clean sidebar with accent color' },
  classic: { label: 'Classic', description: 'Traditional single-column' },
  minimal: { label: 'Minimal', description: 'Whitespace-forward, elegant' },
  crisp: { label: 'Crisp', description: 'Balanced two-column grid' },
  tokyo: { label: 'Tokyo', description: 'Bold sidebar with icons' },
  elite: { label: 'Elite', description: 'Bold executive design' },
}

export { MasterTemplate, TemplateFooter } from './MasterTemplate'
export interface TemplateProps {
  resume: Resume
  pads?: number[]
  hideFooter?: boolean
  isMeasurement?: boolean
}

// All templates now use the MasterTemplate, but with different initial settings
export async function getTemplateComponent(
  _id: TemplateId
): Promise<ComponentType<TemplateProps>> {
  return MasterTemplate
}

/**
 * Returns the setting overrides for a specific template preset.
 * When a user clicks a template, we apply these settings to their resume.
 */
export function getTemplateSettings(id: TemplateId): Partial<ResumeSettings> {
  switch (id) {
    case 'modern':
      return {
        columnLayout: 'two',
        headerAlignment: 'left',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingSize: 'M',
        nameSize: 'L',
        accentColor: '#1e3a5f',
      }
    case 'classic':
      return {
        columnLayout: 'one',
        headerAlignment: 'center',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingSize: 'S',
        nameSize: 'XL',
        accentColor: '#111111',
        fontFamily: 'Merriweather',
      }
    case 'minimal':
      return {
        columnLayout: 'one',
        headerAlignment: 'left',
        sectionHeadingCapitalization: 'none',
        sectionHeadingSize: 'M',
        nameSize: 'M',
        accentColor: '#444444',
        fontFamily: 'Inter',
        lineHeight: 1.6,
      }
    case 'crisp':
      return {
        columnLayout: 'mix',
        headerAlignment: 'left',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingSize: 'S',
        nameSize: 'L',
        accentColor: '#059669',
      }
    case 'tokyo':
      return {
        columnLayout: 'two',
        headerAlignment: 'center',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingSize: 'L',
        nameSize: 'XL',
        accentColor: '#dc2626',
        fontFamily: 'Roboto',
      }
    case 'elite':
      return {
        columnLayout: 'one',
        headerAlignment: 'right',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingSize: 'XL',
        nameSize: 'XL',
        accentColor: '#18181b',
        fontFamily: 'Playfair Display',
      }
    default:
      return {}
  }
}
