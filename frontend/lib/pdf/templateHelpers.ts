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
  'IBM Plex Mono':    '"IBM Plex Mono", monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

export function cssFont(font: FontOption): string {
  return CSS_FONT[font] ?? '"Inter", ui-sans-serif, system-ui, sans-serif'
}

/** All fonts are now loaded locally via fonts.css. Returns null to disable external Google requests. */
export function googleFontHref(font: FontOption): string | null {
  return null
}
