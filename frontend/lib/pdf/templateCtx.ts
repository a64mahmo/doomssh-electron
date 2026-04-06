import type { ResumeSettings } from '@/lib/store/types'
import { resolveColors, nameFontSize, headingFontSize, bulletChar, type ResolvedColors } from './pdfStyles'
import { cssFont, googleFontHref } from './templateHelpers'

export interface TemplateCtx {
  colors:   ResolvedColors
  base:     number          // font-size number; use pt() for CSS
  lh:       number          // unitless line-height
  gap:      string          // entry spacing, e.g. '8pt'
  bullet:   string
  hSize:    number
  hCap:     'uppercase' | 'capitalize' | undefined
  nameSize: number
  font:     string
  fontHref: string | null
  s:        ResumeSettings
  pt:       (n: number) => string
}

export function buildCtx(s: ResumeSettings): TemplateCtx {
  const pt = (n: number) => `${n}pt`
  return {
    colors:   resolveColors(s),
    base:     s.fontSize,
    lh:       s.lineHeight,
    gap:      `${8 * s.entrySpacing}pt`,
    bullet:   bulletChar(s.listStyle),
    hSize:    headingFontSize(s.sectionHeadingSize),
    hCap:     s.sectionHeadingCapitalization !== 'none' ? s.sectionHeadingCapitalization : undefined,
    nameSize: nameFontSize(s.nameSize),
    font:     cssFont(s.fontFamily),
    fontHref: googleFontHref(s.fontFamily),
    s,
    pt,
  }
}
