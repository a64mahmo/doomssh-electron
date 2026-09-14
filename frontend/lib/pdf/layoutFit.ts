// Width estimates shared by the PDF and HTML renderers. Neither can ask the
// layout engine how wide a run of text will be before laying it out, so these
// approximate from character counts and err on the generous side.
import type { ResumeSettings } from '@/lib/store/types'
import { A4, LETTER, mmToPt } from './styleUtils'

/** Width of the page between the horizontal margins, in pt. */
export function contentWidth(s: ResumeSettings): number {
  const pageW = s.paperSize === 'a4' ? A4.width : LETTER.width
  return pageW - mmToPt(s.marginHorizontal) * 2
}

/**
 * Largest size ≤ `size` at which the name's longest word fits `width` pt. A name
 * is one unbreakable token as far as the layout engine is concerned, so it has
 * to shrink rather than run off the page. 0.58em approximates a bold glyph.
 */
export function fitNameSize(name: string, size: number, width: number, floor = 9): number {
  const longest = name.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0)
  if (!longest) return size
  return Math.max(floor, Math.min(size, Math.floor(width / (longest * 0.58))))
}

// Average glyph advance as a fraction of the font size. Overestimating only
// starts a row early; underestimating lets the renderer wrap the row again,
// which is exactly the stray leading separator this exists to prevent.
const CHAR_EM = 0.56

/**
 * Packs contact items into explicit rows. Left to flexWrap, the separator that
 * travels with an item opens the next line ("| github.com") because the item
 * cannot know it wrapped.
 */
export function packContactRows<T extends { val?: string }>(
  parts: T[],
  opts: { width: number; fontSize: number; sepWidth: number; iconWidth: number },
): T[][] {
  const rows: T[][] = []
  let row: T[] = []
  let used = 0
  for (const p of parts) {
    const w = (p.val?.length ?? 0) * opts.fontSize * CHAR_EM + opts.iconWidth
    if (row.length && used + opts.sepWidth + w > opts.width) {
      rows.push(row)
      row = []
      used = 0
    }
    used += row.length ? opts.sepWidth + w : w
    row.push(p)
  }
  if (row.length) rows.push(row)
  return rows
}
