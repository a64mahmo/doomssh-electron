import type { ResumeSettings } from '@/lib/store/types'
import { isLight, resolveColors, nameFontSize, headingFontSize, bulletChar, type ResolvedColors } from './styleUtils'
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
    gap:      pt(s.fontSize * (s.entrySpacing ?? 1.0) * 1.2),
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

/** True when the sidebar panel is painted in its full colour. */
export function isSolidSidebar(s: ResumeSettings): boolean {
  return (
    s.columnLayout !== 'one' &&
    s.sidebarFill === 'solid' &&
    (s.sidebarTheme === 'accent' || (s.sidebarTheme === 'custom' && !!s.sidebarBackgroundColor))
  )
}

/**
 * The context for content inside the sidebar column. On a solid dark panel
 * every colour flips light — text, headings and the accent details (pills,
 * dots, icons) — so nothing renders dark-on-dark. A light accent that differs
 * from the panel is kept. Shared by both renderers.
 */
export function sidebarCtx(ctx: TemplateCtx): TemplateCtx {
  if (!isSolidSidebar(ctx.s)) return ctx
  const bg = ctx.colors.sidebarBg
  if (isLight(bg)) return { ...ctx, colors: { ...ctx.colors, background: bg } }
  const keepAccent = isLight(ctx.colors.accent) && ctx.colors.accent.toLowerCase() !== bg.toLowerCase()
  const accent = keepAccent ? ctx.colors.accent : '#ffffff'
  return {
    ...ctx,
    colors: {
      ...ctx.colors,
      text: '#f8fafc',
      heading: accent,
      subtitle: '#cbd5e1',
      date: '#cbd5e1',
      accent,
      background: bg,
    },
  }
}
