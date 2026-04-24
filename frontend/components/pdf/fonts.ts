import { Font } from '@react-pdf/renderer'
import type { FontOption } from '@/lib/store/types'

// Use local fonts from the public/fonts directory for true offline support.
// We use .woff files as they are reliably parsed by fontkit in all environments.
const FONT_BASE = '/fonts'

type FontSrc = { regular: string; bold: string; italic?: string; boldItalic?: string }

const SOURCES: Record<FontOption, FontSrc> = {
  Inter: {
    regular: `${FONT_BASE}/inter-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/inter-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/inter-latin-400-italic.woff`,
  },
  Roboto: {
    regular: `${FONT_BASE}/roboto-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/roboto-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/roboto-latin-400-italic.woff`,
  },
  Lato: {
    regular: `${FONT_BASE}/lato-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/lato-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/lato-latin-400-italic.woff`,
  },
  Raleway: {
    regular: `${FONT_BASE}/raleway-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/raleway-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/raleway-latin-400-italic.woff`,
  },
  'Source Sans Pro': {
    regular: `${FONT_BASE}/source-sans-3-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/source-sans-3-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/source-sans-3-latin-400-italic.woff`,
  },
  Merriweather: {
    regular:    `${FONT_BASE}/merriweather-latin-400-normal.woff`,
    bold:       `${FONT_BASE}/merriweather-latin-700-normal.woff`,
    italic:     `${FONT_BASE}/merriweather-latin-400-italic.woff`,
    boldItalic: `${FONT_BASE}/merriweather-latin-700-italic.woff`,
  },
  'Playfair Display': {
    regular: `${FONT_BASE}/playfair-display-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/playfair-display-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/playfair-display-latin-400-italic.woff`,
  },
  'IBM Plex Serif': {
    regular: `${FONT_BASE}/ibm-plex-serif-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/ibm-plex-serif-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/ibm-plex-serif-latin-400-italic.woff`,
  },
  'IBM Plex Mono': {
    regular: `${FONT_BASE}/ibm-plex-mono-latin-400-normal.woff`,
    bold:    `${FONT_BASE}/ibm-plex-mono-latin-700-normal.woff`,
    italic:  `${FONT_BASE}/ibm-plex-mono-latin-400-italic.woff`,
  },
}

const registered = new Set<string>()

export function registerFont(family: FontOption): void {
  if (registered.has(family)) return
  const src = SOURCES[family]
  if (!src) return

  Font.register({
    family,
    fonts: [
      { src: src.regular },
      { src: src.bold, fontWeight: 'bold' },
      ...(src.italic     ? [{ src: src.italic,     fontStyle: 'italic' as const }]                               : []),
      ...(src.boldItalic ? [{ src: src.boldItalic, fontWeight: 'bold' as const, fontStyle: 'italic' as const }] : []),
    ],
  })

  registered.add(family)
}

// Disable word hyphenation in PDFs
Font.registerHyphenationCallback((word) => [word])
