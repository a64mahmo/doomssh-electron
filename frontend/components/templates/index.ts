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
  mono: { label: 'Mono', description: 'Developer-centric monospace design' },
  blocks: { label: 'Blocks', description: 'Structured grid with bold headers' },
  custom: { label: 'Custom', description: 'User-defined template' },
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
// Shared color reset — always apply when switching templates so multi-mode
// overrides don't bleed through. headingColor matches accentColor.
function colorReset(accent: string) {
  return {
    accentColor:     accent,
    colorMode:       'basic'   as const,
    headingColor:    accent,
    textColor:       '#1a1a1a',
    subtitleColor:   '#4a5568',
    dateColor:       '#4a5568',
    backgroundColor: '#ffffff',
  }
}

export function getTemplateSettings(id: TemplateId): Partial<ResumeSettings> {
  switch (id) {
    case 'modern':
      return {
        ...colorReset('#1e3a5f'),
        columnLayout:                 'two',
        headerAlignment:              'left',
        headerArrangement:            'pipe',
        sectionHeadingStyle:          'underline',
        sectionHeadingSize:           'M',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'none',
        nameSize:                     'L',
        nameBold:                     true,
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        lineHeight:                   1.45,
        marginHorizontal:             18,
        marginVertical:               12,
        entrySpacing:                 1.0,
      }
    case 'classic':
      return {
        ...colorReset('#111111'),
        columnLayout:                 'one',
        headerAlignment:              'center',
        headerArrangement:            'pipe',
        sectionHeadingStyle:          'underline',
        sectionHeadingSize:           'S',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'none',
        nameSize:                     'XL',
        nameBold:                     true,
        fontFamily:                   'Merriweather',
        fontSize:                     10,
        lineHeight:                   1.5,
        marginHorizontal:             20,
        marginVertical:               14,
        entrySpacing:                 1.0,
      }
    case 'minimal':
      return {
        ...colorReset('#333333'),
        columnLayout:                 'one',
        headerAlignment:              'left',
        headerArrangement:            'bullet',
        sectionHeadingStyle:          'none',
        sectionHeadingSize:           'M',
        sectionHeadingCapitalization: 'none',
        sectionHeadingIcon:           'none',
        nameSize:                     'M',
        nameBold:                     false,
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        lineHeight:                   1.6,
        marginHorizontal:             24,
        marginVertical:               18,
        entrySpacing:                 1.1,
      }
    case 'crisp':
      return {
        ...colorReset('#059669'),
        columnLayout:                 'mix',
        headerAlignment:              'left',
        headerArrangement:            'pipe',
        sectionHeadingStyle:          'left-bar',
        sectionHeadingSize:           'S',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'none',
        nameSize:                     'L',
        nameBold:                     true,
        fontFamily:                   'Lato',
        fontSize:                     10.5,
        lineHeight:                   1.45,
        marginHorizontal:             18,
        marginVertical:               12,
        entrySpacing:                 0.95,
      }
    case 'tokyo':
      return {
        ...colorReset('#dc2626'),
        columnLayout:                 'two',
        headerAlignment:              'center',
        headerArrangement:            'bullet',
        sectionHeadingStyle:          'background',
        sectionHeadingSize:           'L',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'filled',
        sectionHeadingIconSize:       1.0,
        nameSize:                     'XL',
        nameBold:                     true,
        fontFamily:                   'Roboto',
        fontSize:                     10,
        lineHeight:                   1.4,
        marginHorizontal:             16,
        marginVertical:               12,
        entrySpacing:                 0.9,
      }
    case 'elite':
      return {
        ...colorReset('#18181b'),
        columnLayout:                 'one',
        headerAlignment:              'right',
        headerArrangement:            'pipe',
        sectionHeadingStyle:          'top-bottom',
        sectionHeadingSize:           'XL',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingLineThickness:  1,
        sectionHeadingIcon:           'none',
        nameSize:                     'XL',
        nameBold:                     true,
        fontFamily:                   'Playfair Display',
        fontSize:                     10,
        lineHeight:                   1.5,
        marginHorizontal:             22,
        marginVertical:               16,
        entrySpacing:                 1.1,
      }
    case 'mono':
      return {
        ...colorReset('#059669'),
        columnLayout:                 'one',
        headerAlignment:              'left',
        headerArrangement:            'pipe',
        sectionHeadingStyle:          'box',
        sectionHeadingSize:           'S',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'none',
        nameSize:                     'L',
        nameBold:                     true,
        fontFamily:                   'IBM Plex Mono',
        fontSize:                     9.5,
        lineHeight:                   1.4,
        marginHorizontal:             16,
        marginVertical:               12,
        entrySpacing:                 1.0,
        listStyle:                    'hyphen',
      }
    case 'blocks':
      return {
        ...colorReset('#2563eb'),
        columnLayout:                 'mix',
        headerAlignment:              'left',
        headerArrangement:            'bullet',
        sectionHeadingStyle:          'background',
        sectionHeadingSize:           'L',
        sectionHeadingCapitalization: 'uppercase',
        sectionHeadingIcon:           'none',
        nameSize:                     'XL',
        nameBold:                     true,
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        lineHeight:                   1.5,
        marginHorizontal:             20,
        marginVertical:               14,
        entrySpacing:                 1.1,
      }
    default:
      return {}
  }
}
