import { describe, it, expect } from 'vitest'
import { collectIntervals, findBreak, splitPages, type Interval } from '@/lib/pdf/paginate'

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
    // The break is just before the block starting at 90, after the gap.
    expect(pages[0]).toEqual({ start: 0, end: 90 })
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

describe('keep entries together', () => {
  /** A flow with one entry spanning 100..300px, its lines 20px apart. */
  function flow() {
    document.body.innerHTML = `
      <div id="root">
        <div data-entry id="entry">
          <div id="head">Engineer</div>
          <div data-entry-desc><div id="l1">One</div><div id="l2">Two</div></div>
        </div>
      </div>`
    const rect = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top, x: 0, y: top, toJSON() {} }) as DOMRect
    const at: Record<string, [number, number]> = { root: [0, 1000], entry: [100, 300], head: [100, 140], l1: [150, 220], l2: [230, 300] }
    for (const [id, [t, b]] of Object.entries(at)) {
      document.getElementById(id)!.getBoundingClientRect = () => rect(t, b)
    }
    const root = document.getElementById('root')!
    Object.defineProperty(root, 'offsetHeight', { value: 1000 })
    return root
  }

  it('adds the whole entry as one block when on', () => {
    const iv = collectIntervals(flow(), undefined, { keepEntries: true })
    expect(iv).toContainEqual({ top: 100, bottom: 300, level: 1 })
    // A page that could end after the first bullet ends before the entry instead.
    expect(findBreak(0, 250, iv)).toBe(100)
  })

  it('is off by default, so the entry can split between bullets', () => {
    const iv = collectIntervals(flow())
    expect(iv).not.toContainEqual({ top: 100, bottom: 300, level: 1 })
    // Between the two bullets (the gap runs from 220 to 230).
    expect(findBreak(0, 250, iv)).toBe(230)
  })
})
