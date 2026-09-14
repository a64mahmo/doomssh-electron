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

// Line breaking.
//
// Returning [word] disables hyphenation entirely, which reads well — but a word
// wider than its container then has nowhere to break and simply overflows: long
// URLs escape the page, and a location like "Kitchener–Waterloo–Cambridge"
// spills out of a sidebar. So: leave normal words intact, and offer break points
// only inside tokens too long to fit anywhere sensible.
//
// @react-pdf appends a hyphen wherever it breaks, and the character is not
// configurable, so a break inside a token that already contains punctuation
// renders a doubled mark ("and--"). That is the cost of not overflowing; the
// threshold is set high enough that ordinary content never reaches it.
// Deliberately high. @react-pdf breaks greedily: any break point it is offered
// may be taken even when the whole token would have fitted on the next line, so
// a low threshold hyphenates ordinary compound surnames. Only tokens long enough
// to overflow a narrow sidebar on their own get break points at all.
const MAX_UNBROKEN_CHARS = 32
const HARD_CHUNK = 16

export function breakLongWord(word: string): string[] {
  if (word.length <= MAX_UNBROKEN_CHARS) return [word]

  // Prefer breaking after existing punctuation, keeping it on the leading part.
  const segments = word.split(/(?<=[-–—_/.,:])/)
  const out: string[] = []
  for (const seg of segments) {
    if (seg.length <= MAX_UNBROKEN_CHARS) {
      out.push(seg)
      continue
    }
    // Still too long (e.g. one enormous run of letters) — chunk it.
    for (let i = 0; i < seg.length; i += HARD_CHUNK) out.push(seg.slice(i, i + HARD_CHUNK))
  }
  return out
}

Font.registerHyphenationCallback(breakLongWord)
