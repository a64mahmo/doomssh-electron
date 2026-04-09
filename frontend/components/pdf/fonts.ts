import { Font } from '@react-pdf/renderer'
import type { FontOption } from '@/lib/store/types'

// No version pin — jsDelivr resolves to the current latest stable release.
// Pinning a version risks 404s as @fontsource packages get republished.
const CDN = 'https://cdn.jsdelivr.net/npm'

type FontSrc = { regular: string; bold: string; italic?: string; boldItalic?: string }

// @react-pdf/renderer's fontkit woff2 decoder fails in browser environments
// (Brotli decompression issues). Use .woff files — zlib-compressed, reliably
// parsed by fontkit in both Node and browser contexts.
const SOURCES: Record<FontOption, FontSrc> = {
  Inter: {
    regular: `${CDN}/@fontsource/inter/files/inter-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/inter/files/inter-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/inter/files/inter-latin-400-italic.woff`,
  },
  Roboto: {
    regular: `${CDN}/@fontsource/roboto/files/roboto-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/roboto/files/roboto-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/roboto/files/roboto-latin-400-italic.woff`,
  },
  Lato: {
    regular: `${CDN}/@fontsource/lato/files/lato-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/lato/files/lato-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/lato/files/lato-latin-400-italic.woff`,
  },
  Raleway: {
    regular: `${CDN}/@fontsource/raleway/files/raleway-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/raleway/files/raleway-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/raleway/files/raleway-latin-400-italic.woff`,
  },
  'Source Sans Pro': {
    regular: `${CDN}/@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff`,
  },
  Merriweather: {
    regular:    `${CDN}/@fontsource/merriweather/files/merriweather-latin-400-normal.woff`,
    bold:       `${CDN}/@fontsource/merriweather/files/merriweather-latin-700-normal.woff`,
    italic:     `${CDN}/@fontsource/merriweather/files/merriweather-latin-400-italic.woff`,
    boldItalic: `${CDN}/@fontsource/merriweather/files/merriweather-latin-700-italic.woff`,
  },
  'Playfair Display': {
    regular: `${CDN}/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff`,
  },
  'IBM Plex Serif': {
    regular: `${CDN}/@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-italic.woff`,
  },
  'IBM Plex Mono': {
    regular: `${CDN}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff`,
    bold:    `${CDN}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff`,
    italic:  `${CDN}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff`,
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
