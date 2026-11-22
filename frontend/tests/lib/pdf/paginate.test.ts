import { describe, it, expect } from 'vitest'
import { findBreak, splitPages, type Interval } from '@/lib/pdf/paginate'

/** `n` lines of height `h` starting at `top`, separated by `gap`. */
function lines(n: number, h = 20, gap = 0, top = 0): Interval[] {
  return Array.from({ length: n }, (_, i) => ({ top: top + i * (h + gap), bottom: top + i * (h + gap) + h, level: 0 as const }))
}

describe('findBreak', () => {
  it('breaks at the limit when it falls between lines', () => {
    expect(findBreak(0, 100, lines(10))).toBe(100)
  })

  it('never cuts a line', () => {
    expect(findBreak(0, 110, lines(10))).toBe(100)
  })

  it('moves a keep-together block whole to the next page', () => {
    const iv = [...lines(10), { top: 60, bottom: 140, level: 1 as const }]
    expect(findBreak(0, 110, iv)).toBe(60)
  })

  it('splits a keep-together block taller than the page between its lines', () => {
    const iv = [...lines(20), { top: 0, bottom: 400, level: 1 as const }]
    expect(findBreak(0, 110, iv)).toBe(100)
  })

  it('cuts at the limit only when a single line is taller than the page', () => {
    expect(findBreak(0, 100, [{ top: 0, bottom: 500, level: 0 }])).toBe(100)
  })
})

describe('splitPages', () => {
  it('keeps short content on one page', () => {
    expect(splitPages(lines(3), 60, 500, 400)).toEqual([{ start: 0, end: 60 }])
  })

  it('gives later pages their own capacity and skips the gap between blocks', () => {
    // Blocks 20 tall with 10 between: a break lands after a block, and the next
    // page starts at the next block, not in the gap.
    const iv = lines(20, 20, 10)
    const pages = splitPages(iv, 590, 100, 80)
    // The break is after the block ending at 80; the window runs 4px into the gap.
    expect(pages[0]).toEqual({ start: 0, end: 84 })
    expect(pages[1].start).toBe(90)
    for (const p of pages) expect(p.end).toBeGreaterThan(p.start)
    expect(pages[pages.length - 1].end).toBe(590)
    // Every line lies wholly inside exactly one page.
    for (const l of iv) {
      expect(pages.filter((p) => l.top >= p.start && l.bottom <= p.end)).toHaveLength(1)
    }
  })

  it('never lets the slack reach the next page\'s first line', () => {
    // Blocks 20 tall with 2 between: the slack stops at the next block.
    const pages = splitPages(lines(20, 20, 2), 438, 100, 100)
    expect(pages[0].end).toBe(88)
    expect(pages[1].start).toBe(88)
  })

  it('terminates with zero measurements (jsdom)', () => {
    expect(splitPages([], 0, 1000, 900)).toEqual([{ start: 0, end: 0 }])
  })

  it('terminates when the page has no room', () => {
    expect(splitPages(lines(100), 2000, 0, 0)).toHaveLength(1)
  })

  it('caps the page count', () => {
    expect(splitPages(lines(10000, 20), 200000, 100, 100).length).toBeLessThanOrEqual(30)
  })
})
