import type { ResumeSettings } from '@/lib/store/types'

/** Placeholders a custom footer column can use, in the order the editor offers them. */
export const FOOTER_PLACEHOLDERS = [
  { key: 'name', label: 'Name', token: '{{name}}' },
  { key: 'phone', label: 'Phone', token: '{{phone}}' },
  { key: 'email', label: 'Email', token: '{{email}}' },
  { key: 'pages', label: 'Page numbers', token: '{{page}} / {{pages}}' },
] as const

export interface FooterValues {
  name?: string
  phone?: string
  email?: string
  /** This page, from 1. */
  page?: number
  /** Total pages, once known. */
  pages?: number
}

/**
 * Fills `{{name}}`, `{{phone}}`, `{{email}}`, `{{page}}` and `{{pages}}` in a
 * custom footer column. Case and inner spaces are ignored (`{{ Page }}`);
 * unknown placeholders are left as typed so a typo stays visible.
 */
export function fillFooterTemplate(template: string, values: FooterValues): string {
  if (!template) return ''
  return template.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, raw: string) => {
    const key = raw.toLowerCase()
    switch (key) {
      case 'name': return values.name ?? ''
      case 'phone': return values.phone ?? ''
      case 'email': return values.email ?? ''
      case 'page': return values.page !== undefined ? String(values.page) : ''
      case 'pages': return values.pages !== undefined ? String(values.pages) : ''
      default: return match
    }
  })
}

// ─── Footer layout presets (Style → Header → Footer) ─────────────────────────


export type FooterPreset = 'off' | 'page' | 'name-page' | 'full' | 'centered' | 'custom'

const CENTERED_PAGE = '{{page}} / {{pages}}'

/** The preset the settings currently match, or null for a mix none of them describes. */
export function detectFooterPreset(s: ResumeSettings): FooterPreset | null {
  if (s.footerCustom) {
    const blank = (t?: string) => !t?.trim()
    return blank(s.footerLeft) && s.footerCenter?.trim() === CENTERED_PAGE && blank(s.footerRight) ? 'centered' : 'custom'
  }
  const key = `${s.footerName ? 1 : 0}${s.footerEmail ? 1 : 0}${s.footerPageNumbers ? 1 : 0}`
  switch (key) {
    case '000': return 'off'
    case '001': return 'page'
    case '101': return 'name-page'
    case '111': return 'full'
    default: return null
  }
}

/** Settings that apply a preset. "custom" is left to the custom footer switch (it seeds its columns). */
export function footerPresetUpdates(preset: Exclude<FooterPreset, 'custom'>): Partial<ResumeSettings> {
  const simple = (name: boolean, email: boolean, pages: boolean): Partial<ResumeSettings> =>
    ({ footerCustom: false, footerName: name, footerEmail: email, footerPageNumbers: pages })
  switch (preset) {
    case 'off': return simple(false, false, false)
    case 'page': return simple(false, false, true)
    case 'name-page': return simple(true, false, true)
    case 'full': return simple(true, true, true)
    case 'centered':
      return { footerCustom: true, footerLeft: '', footerCenter: CENTERED_PAGE, footerRight: '' }
  }
}

/** "2", "2 / 3" or "Page 2 of 3". */
export function formatPageNumber(
  format: ResumeSettings['footerPageFormat'],
  page: number,
  pages?: number,
): string {
  if (format === 'of-total' && pages) return `${page} / ${pages}`
  if (format === 'page-of' && pages) return `Page ${page} of ${pages}`
  return String(page)
}
