// CSS-based template helpers — replaces the react-pdf-specific helpers in pdfStyles.ts
import type { FontOption } from '@/lib/store/types'

// CSS font stacks for each font option
const CSS_FONT: Record<FontOption, string> = {
  'Inter':            '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  'Roboto':           '"Roboto", ui-sans-serif, system-ui, sans-serif',
  'Lato':             '"Lato", ui-sans-serif, system-ui, sans-serif',
  'Raleway':          '"Raleway", ui-sans-serif, system-ui, sans-serif',
  'Source Sans Pro':  '"Source Sans 3", "Source Sans Pro", ui-sans-serif, system-ui, sans-serif',
  'Merriweather':     '"Merriweather", ui-serif, Georgia, "Times New Roman", serif',
  'Playfair Display': '"Playfair Display", ui-serif, Georgia, "Times New Roman", serif',
  'IBM Plex Serif':   '"IBM Plex Serif", ui-serif, Georgia, "Times New Roman", serif',
}

export function cssFont(font: FontOption): string {
  return CSS_FONT[font] ?? '"Inter", ui-sans-serif, system-ui, sans-serif'
}

// Google Fonts query strings (used as: https://fonts.googleapis.com/css2?{value}&display=swap)
const GFONT: Partial<Record<FontOption, string>> = {
  'Roboto':           'family=Roboto:wght@400;700',
  'Lato':             'family=Lato:wght@400;700',
  'Raleway':          'family=Raleway:wght@400;600;700',
  'Source Sans Pro':  'family=Source+Sans+3:wght@400;700',
  'Merriweather':     'family=Merriweather:ital,wght@0,400;0,700;1,400',
  'Playfair Display': 'family=Playfair+Display:ital,wght@0,400;0,700;1,400',
  'IBM Plex Serif':   'family=IBM+Plex+Serif:ital,wght@0,400;0,700;1,400',
}

/** Returns full Google Fonts URL or null if font is system/already-loaded */
export function googleFontHref(font: FontOption): string | null {
  const q = GFONT[font]
  if (!q) return null
  return `https://fonts.googleapis.com/css2?${q}&display=swap`
}
