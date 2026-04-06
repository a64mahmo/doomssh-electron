// Shared template utilities — pure functions, no framework dependency
import type { ResumeSettings, FontOption, NameSize, SectionHeadingSize, ListStyle } from '@/lib/store/types'

export const A4 = { width: 595.28, height: 841.89 }
export const LETTER = { width: 612, height: 792 }

// Parse bullet points from description string
export function parseBullets(text: string): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)
}

// ── Settings → PDF values ─────────────────────────────────────────────────────

/** 1 mm = 2.83465 pt */
export function mmToPt(mm: number): number {
  return mm * 2.83465
}

const SERIF_FONTS: FontOption[] = ['Merriweather', 'Playfair Display', 'IBM Plex Serif']

export function pdfFont(fontFamily: FontOption): string {
  return SERIF_FONTS.includes(fontFamily) ? 'Times-Roman' : 'Helvetica'
}
export function pdfFontBold(fontFamily: FontOption): string {
  return SERIF_FONTS.includes(fontFamily) ? 'Times-Bold' : 'Helvetica-Bold'
}
export function pdfFontItalic(fontFamily: FontOption): string {
  return SERIF_FONTS.includes(fontFamily) ? 'Times-Italic' : 'Helvetica-Oblique'
}

const NAME_PT: Record<NameSize, number> = { XS: 16, S: 18, M: 20, L: 22, XL: 26 }
export function nameFontSize(size: NameSize): number {
  return NAME_PT[size] ?? 20
}

const HEADING_PT: Record<SectionHeadingSize, number> = { S: 7.5, M: 8.5, L: 10, XL: 12 }
export function headingFontSize(size: SectionHeadingSize): number {
  return HEADING_PT[size] ?? 8.5
}

const BULLET_CHAR: Record<ListStyle, string> = { bullet: '•', dash: '—', hyphen: '-' }
export function bulletChar(style: ListStyle): string {
  return BULLET_CHAR[style] ?? '•'
}

export interface ResolvedColors {
  text: string
  heading: string
  subtitle: string
  date: string
  background: string
  accent: string
}

export function resolveColors(s: ResumeSettings): ResolvedColors {
  if (s.colorMode === 'multi') {
    return {
      text: s.textColor,
      heading: s.headingColor,
      subtitle: s.subtitleColor,
      date: s.dateColor,
      background: s.backgroundColor,
      accent: s.accentColor,
    }
  }
  // basic mode
  return {
    text: '#1a1a1a',
    heading: s.accentColor,
    subtitle: '#4a5568',
    date: '#4a5568',
    background: '#ffffff',
    accent: s.accentColor,
  }
}

