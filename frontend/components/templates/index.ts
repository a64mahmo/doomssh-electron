import type { TemplateId } from '@/lib/store/types'
import type { ComponentType } from 'react'
import type { Resume } from '@/lib/store/types'

// Registry — add new templates here only
export const TEMPLATE_META: Record<TemplateId, { label: string; description: string }> = {
  modern: { label: 'Modern', description: 'Clean sidebar with accent color' },
  classic: { label: 'Classic', description: 'Traditional single-column' },
  minimal: { label: 'Minimal', description: 'Whitespace-forward, elegant' },
  crisp: { label: 'Crisp', description: 'Balanced two-column grid' },
  tokyo: { label: 'Tokyo', description: 'Bold sidebar with icons' },
  elite: { label: 'Elite', description: 'Bold executive design' },
}

export interface TemplateProps {
  resume: Resume
}

export async function getTemplateComponent(
  id: TemplateId
): Promise<ComponentType<TemplateProps>> {
  switch (id) {
    case 'modern':
      return (await import('./ModernTemplate')).ModernTemplate
    case 'classic':
      return (await import('./ClassicTemplate')).ClassicTemplate
    case 'minimal':
      return (await import('./MinimalTemplate')).MinimalTemplate
    case 'crisp':
      return (await import('./CrispTemplate')).CrispTemplate
    case 'tokyo':
      return (await import('./TokyoTemplate')).TokyoTemplate
    case 'elite':
      return (await import('./EliteTemplate')).EliteTemplate
    default:
      return (await import('./ModernTemplate')).ModernTemplate
  }
}
