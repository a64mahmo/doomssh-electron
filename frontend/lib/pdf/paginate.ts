/**
 * Page breaks for the HTML resume (see components/web/PagedResume.tsx).
 *
 * The template is measured as one continuous flow. Every piece that must not
 * be cut becomes a vertical interval:
 *  - each rendered line of text, and each image (level 0: never cut, unless a
 *    single one is taller than a page);
 *  - each keep-together block: `data-keep`, a bullet or description line, the
 *    header, an entry's head together with its first line, and a section
 *    heading together with what follows it (level 1: dropped if a block is
 *    taller than a page, so the page still breaks between lines).
 * A page ends at the lowest point that cuts no interval and fits the page.
 *
 * With "Keep entries together" (`keepEntries`), each entry (`data-entry`) and
 * the summary (`data-unit`) is one more keep-together block: a page never ends
 * inside one, so the whole entry moves to the next page.
 *
 * With a sidebar (`data-column` on both columns) each column is its own flow:
 * it breaks wherever suits it and continues on the next page from there. The
 * page shows each column through its own window, so neither column waits for
 * a gap the other happens to share.
 */

export interface Page {
  /** Top of the slice, in px from the top of the flow. */
  start: number
  /** Bottom of the slice (exclusive), in px from the top of the flow. */
  end: number
}

/** A vertical strip of the page, in px from the flow's left edge. */
export interface Region {
  left: number
  right: number
  /** The column in this strip, if the page is split into columns. */
  column?: string
  /** That column's content box (inside its padding and border). */
  contentLeft?: number
  contentRight?: number
}

/** What each page shows: one slice per region, in region order; null once that column has run out. */
export interface PageLayout {
  slices: (Page | null)[]
}

/** The flow's padding plus border on each side, in px: the page margins. */
export interface Insets {
  top: number
  bottom: number
  left: number
  right: number
}

export interface Interval {
  top: number
  bottom: number
  /** 0: a line or image. 1: a block kept together or with what follows. */
  level: 0 | 1
}

const EPS = 0.5
const MAX_PAGES = 30
/** Extra px a page window may show below its break, inside the gap that follows. */
const SLACK = 4

/** True if a break at `y` cuts none of `intervals` at `maxLevel` or below. */
function canBreakAt(y: number, intervals: Interval[], maxLevel: number) {
  for (const iv of intervals) {
    if (iv.level <= maxLevel && iv.top < y - EPS && iv.bottom > y + EPS) return false
  }
  return true
}

/**
 * The lowest break in (start, limit] that cuts nothing, trying keep-together
 * rules first and then lines alone; `limit` if even a line is too tall.
 */
export function findBreak(start: number, limit: number, intervals: Interval[]): number {
  for (const maxLevel of [1, 0]) {
    let best = -1
    if (canBreakAt(limit, intervals, maxLevel)) best = limit
    // A page can end just after a block or just before one.
    for (const iv of intervals) {
      for (const y of [iv.bottom, iv.top]) {
        if (y > start + EPS && y <= limit && y > best && canBreakAt(y, intervals, maxLevel)) best = y
      }
    }
    if (best > start + EPS) return best
  }
  return limit
}

/**
 * Splits a flow of height `contentEnd` into pages. Page 1 shows the flow from
 * 0 (its top margin is the flow's own padding) and holds `firstCapacity` px;
 * later pages hold `capacity` px each and start at the next content after the
 * previous break, so no page opens with leftover spacing.
 */
export function splitPages(
  intervals: Interval[],
  contentEnd: number,
  firstCapacity: number,
  capacity: number,
): Page[] {
  const pages: Page[] = []
  let start = 0
  let cap = firstCapacity
  while (pages.length < MAX_PAGES) {
    const limit = start + Math.max(cap, 1)
    if (contentEnd <= limit || cap <= 1) {
      pages.push({ start, end: Math.max(contentEnd, start) })
      break
    }
    const end = findBreak(start, limit, intervals)
    let next = Infinity
    for (const iv of intervals) if (iv.top >= end - EPS && iv.top < next) next = iv.top
    // Let the window run a few px into the gap below its last line, so a
    // sub-pixel difference between the measured and the printed layout never
    // clips a descender. It stops short of the next page's first line.
    pages.push({ start, end: Math.max(end, Math.min(end + SLACK, next)) })
    if (!(next < contentEnd)) break
    // Never step backwards, whatever the measurements say.
    start = Math.max(next, end)
    cap = capacity
  }
  return pages
}

/** Rects of each rendered line of text and each image under `root`. */
function lineRects(root: HTMLElement): DOMRect[] {
  const rects: DOMRect[] = []
  const doc = root.ownerDocument
  if (typeof doc.createRange !== 'function') return rects
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = doc.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue
    range.selectNodeContents(node)
    if (typeof range.getClientRects !== 'function') return rects
    for (const r of Array.from(range.getClientRects())) if (r.height > 0) rects.push(r)
  }
  root.querySelectorAll('img, svg').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.height > 0) rects.push(r)
  })
  return rects
}

/** Unscaled px from the top of `root` (the preview zooms with a CSS transform). */
function measurer(root: HTMLElement) {
  const rootRect = root.getBoundingClientRect()
  const scale = root.offsetHeight > 0 && rootRect.height > 0 ? rootRect.height / root.offsetHeight : 1
  return {
    y: (y: number) => (y - rootRect.top) / scale,
    x: (x: number) => (x - rootRect.left) / scale,
  }
}

/**
 * The intervals of everything inside `scope` (default: the whole flow), in px
 * from the top of `root`, unscaled.
 */
export function collectIntervals(
  root: HTMLElement,
  scope: HTMLElement = root,
  { keepEntries = false }: { keepEntries?: boolean } = {},
): Interval[] {
  const toY = measurer(root).y
  const intervals: Interval[] = []
  const add = (top: number, bottom: number, level: 0 | 1) => {
    if (bottom - top > 0) intervals.push({ top: toY(top), bottom: toY(bottom), level })
  }

  for (const r of lineRects(scope)) add(r.top, r.bottom, 0)

  const blocks = Array.from(
    scope.querySelectorAll<HTMLElement>(
      keepEntries
        ? '[data-keep], [data-entry-desc] > div, [data-header], [data-entry], [data-unit]'
        : '[data-keep], [data-entry-desc] > div, [data-header]',
    ),
  )
  for (const el of blocks) {
    const r = el.getBoundingClientRect()
    add(r.top, r.bottom, 1)
  }

  // An entry's head stays with its first description line.
  scope.querySelectorAll<HTMLElement>('[data-entry]').forEach((entry) => {
    const head = entry.firstElementChild as HTMLElement | null
    if (!head) return
    const first = entry.querySelector<HTMLElement>('[data-entry-desc] > div') ?? (head.nextElementSibling as HTMLElement | null)
    const r = head.getBoundingClientRect()
    add(r.top, Math.max(r.bottom, first?.getBoundingClientRect().bottom ?? r.bottom), 1)
  })

  // A section heading stays with the first line or block below it.
  scope.querySelectorAll<HTMLElement>('[data-section-heading]').forEach((heading) => {
    const section = heading.closest('[data-section]') ?? heading.parentElement
    const hr = heading.getBoundingClientRect()
    // The block that starts first below the heading: a line, or a whole
    // keep-together block or entry head if one starts there.
    let firstTop = Infinity
    let firstBottom = hr.bottom
    const consider = (r: DOMRect) => {
      if (r.top < hr.bottom - EPS) return
      if (r.top < firstTop - EPS || (Math.abs(r.top - firstTop) <= EPS && r.bottom > firstBottom)) {
        firstTop = r.top
        firstBottom = r.bottom
      }
    }
    if (section) {
      lineRects(section as HTMLElement).forEach(consider)
      section
        .querySelectorAll<HTMLElement>('[data-keep], [data-entry] > :first-child')
        .forEach((el) => consider(el.getBoundingClientRect()))
    }
    add(hr.top, Math.max(hr.bottom, firstBottom), 1)
  })

  return intervals
}

/** Page margins from the flow root's padding and border, in px. */
export function readInsets(root: HTMLElement): Insets {
  const cs = root.ownerDocument.defaultView?.getComputedStyle(root)
  const px = (v: string | undefined) => parseFloat(v || '0') || 0
  return {
    top: px(cs?.paddingTop) + px(cs?.borderTopWidth),
    bottom: px(cs?.paddingBottom) + px(cs?.borderBottomWidth),
    left: px(cs?.paddingLeft) + px(cs?.borderLeftWidth),
    right: px(cs?.paddingRight) + px(cs?.borderRightWidth),
  }
}

/**
 * Pages for the flow rooted at `root` (a `data-resume-page` element laid out
 * with no page height). `footerReserve` is the space a page keeps above its
 * bottom margin for the footer; with columns, only `footerColumn` keeps it
 * (the footer sits under that column alone) and the others run to the margin,
 * or every column keeps it when `footerColumn` is '*' (a full-width footer). Returns the regions each page is cut into
 * (the full width, or one strip per column) and each page's slice of each.
 */
export function paginate(
  root: HTMLElement,
  {
    pageHeight,
    footerReserve,
    footerColumn = 'main',
    keepEntries = false,
  }: { pageHeight: number; footerReserve: number; footerColumn?: string; keepEntries?: boolean },
): { pages: PageLayout[]; regions: Region[]; insets: Insets } {
  const insets = readInsets(root)
  const contentEnd = root.offsetHeight - insets.bottom
  const firstCapacity = pageHeight - insets.bottom - footerReserve
  const capacity = pageHeight - insets.top - insets.bottom - footerReserve
  const m = measurer(root)

  const columns = Array.from(root.querySelectorAll<HTMLElement>('[data-column]'))
  if (columns.length < 2) {
    const pages = splitPages(collectIntervals(root, root, { keepEntries }), contentEnd, firstCapacity, capacity)
    return { pages: pages.map((p) => ({ slices: [p] })), regions: [{ left: 0, right: root.offsetWidth }], insets }
  }

  // Left to right. Strips meet where the columns do, so the divider (on the
  // main column's edge) and each column's padding stay with their column; the
  // outer strips run to the paper edges.
  const placed = columns
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .sort((a, b) => a.rect.left - b.rect.left)
  const px = (v: string) => parseFloat(v) || 0
  const regions: Region[] = placed.map((c, i) => {
    const cs = root.ownerDocument.defaultView?.getComputedStyle(c.el)
    return {
      left: i === 0 ? 0 : m.x(c.rect.left),
      right: i === placed.length - 1 ? root.offsetWidth : m.x(placed[i + 1].rect.left),
      column: c.el.dataset.column,
      contentLeft: m.x(c.rect.left) + px(cs?.paddingLeft ?? '') + px(cs?.borderLeftWidth ?? ''),
      contentRight: m.x(c.rect.right) - px(cs?.paddingRight ?? '') - px(cs?.borderRightWidth ?? ''),
    }
  })
  const perColumn = placed.map((c) => {
    const end = Math.min(contentEnd, m.y(c.rect.bottom))
    const reserve = footerColumn === '*' || c.el.dataset.column === footerColumn ? footerReserve : 0
    return splitPages(collectIntervals(root, c.el, { keepEntries }), end, firstCapacity + footerReserve - reserve, capacity + footerReserve - reserve)
  })
  const count = Math.max(...perColumn.map((p) => p.length))
  const pages: PageLayout[] = Array.from({ length: count }, (_, i) => ({
    // A column that has run out shows nothing on the remaining pages.
    slices: perColumn.map((p) => p[i] ?? null),
  }))
  return { pages, regions, insets }
}
