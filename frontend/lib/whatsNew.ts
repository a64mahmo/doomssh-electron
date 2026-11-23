/**
 * User-facing release notes shown in the "What's New" dialog.
 *
 * Hand-written for people using the app, newest first. CHANGELOG.md is the
 * engineering log; add an entry here only for changes users will notice.
 * Each `id` must be unique and never change: the unread dot compares it.
 */
export type WhatsNewTag = 'new' | 'improved' | 'fixed'

export interface WhatsNewEntry {
  id: string
  /** Shown as written, e.g. "September 2026". */
  date: string
  /**
   * When the entry went out (ISO date). A returning user whose last look at
   * What's New is older than the newest `publishedAt` gets a prompt.
   */
  publishedAt?: string
  title: string
  items: { tag: WhatsNewTag; text: string }[]
}

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    id: '2026-11-22-history-and-footer',
    date: 'November 2026',
    // A time, not just a day: the notes above went out earlier the same day.
    publishedAt: '2026-11-23T04:45:00Z',
    title: 'Version history, a new footer, and your whole vault in one file',
    items: [
      { tag: 'new', text: 'Version history: press History in the builder to see earlier versions of a resume or cover letter, preview them page by page, and restore one. Restoring keeps the version you replaced, and you can undo it.' },
      { tag: 'new', text: 'A version is kept when you start editing, every 10 minutes while you edit, each time you download a PDF, and whenever you press Save version.' },
      { tag: 'new', text: 'Thumbnails: the Resumes and Cover Letters pages show each document’s real pages. Hover a card and use the arrows, swipe sideways, or press ← → to flip through them.' },
      { tag: 'new', text: 'Footer tab in Style: pick a layout (page number, name and page, name · email · page, centered, or your own), a page number style (2, 2 / 3 or Page 2 of 3) and an optional line above the footer.' },
      { tag: 'new', text: 'Custom footer: write your own left, center and right text with {{name}}, {{phone}}, {{email}}, {{page}} and {{pages}}.' },
      { tag: 'new', text: 'Export your whole vault (resumes, cover letters and job applications) to one file in Settings, and import it on another computer. Imports are added next to what you have, and are checked for scripts, unsafe links and unsafe images first.' },
      { tag: 'improved', text: 'On two-column resumes the footer runs across the whole page, so the page number sits at the right edge.' },
      { tag: 'improved', text: 'Section Placement only lists sections that are switched on and have content.' },
      { tag: 'fixed', text: 'Links in your documents only open web, email and phone addresses.' },
    ],
  },
  {
    id: '2026-11-22-real-pages',
    date: 'November 2026',
    publishedAt: '2026-11-22',
    title: 'Real pages, and a faster way to find settings',
    items: [
      { tag: 'new', text: 'Search the builder: press ⌘P (Ctrl+P on Windows), type a section, field or setting, and press Enter to jump straight to it.' },
      { tag: 'new', text: 'Show names in the builder’s side navigation: use the button at the bottom of the icon column to expand it.' },
      { tag: 'new', text: 'Keep entries together (Style › Layout › Page Breaks): a job, degree or project that does not fit moves to the next page as a whole instead of splitting.' },
      { tag: 'improved', text: 'The preview shows real pages, the same ones your PDF gets, with a margin at the top and bottom of every page.' },
      { tag: 'improved', text: 'Two-column resumes: the header sits at the top of the left or right column, and both columns and the sidebar colour run the full height of every page.' },
      { tag: 'improved', text: 'Each column continues onto the next page on its own, so a long sidebar no longer leaves gaps in the main column.' },
      { tag: 'improved', text: 'The example resumes are longer, written in plain language, and come with photos.' },
      { tag: 'improved', text: 'A cleaner page: no line between the columns and no line above the footer.' },
      { tag: 'fixed', text: 'Page numbers in the footer now appear in your PDF.' },
      { tag: 'fixed', text: 'Dropdowns show the same text closed as in their list (“Large (L)”, not “L”), at the same size.' },
      { tag: 'fixed', text: 'Text no longer runs to the bottom edge of the paper or gets cut in half at a page break.' },
    ],
  },
  {
    id: '2026-09-14-builder-polish',
    date: 'September 2026',
    publishedAt: '2026-09-14',
    title: 'A friendlier start',
    items: [
      { tag: 'new', text: 'Start from an example resume (product manager, designer or new grad) on the Resumes page.' },
      { tag: 'new', text: 'This What’s New panel, so you can see what changed.' },
      { tag: 'new', text: 'A System option in the theme switcher that follows your device.' },
      { tag: 'improved', text: 'Pages open faster: the builder loads directly and files are cached between visits.' },
      { tag: 'improved', text: 'New resumes start blank with hints instead of placeholder details that could end up in your PDF.' },
      { tag: 'improved', text: 'The sidebar tucks itself away on small screens and while you edit.' },
      { tag: 'improved', text: 'Rarely used personal details (marital status, height, weight…) are tucked behind “More personal details”.' },
      { tag: 'fixed', text: 'The Job Tracker board scrolls sideways, so every column is reachable.' },
      { tag: 'fixed', text: 'Clearer labels and better contrast across the Job Tracker, Interview Prep and editor.' },
    ],
  },
  {
    id: 'web-launch',
    date: 'Summer 2026',
    title: 'DoomSSH in your browser',
    items: [
      { tag: 'new', text: 'Use the builder on the web. Everything stays in this browser; there is no account and no server copy.' },
      { tag: 'new', text: 'New templates: Aspen, Vega, Lumen, Atlas, Sierra and Nova.' },
      { tag: 'new', text: 'More layout options: solid sidebars, centred headings, job title styles and photo placement.' },
      { tag: 'improved', text: 'Downloaded PDFs match the live preview exactly.' },
      { tag: 'improved', text: 'AI writing tools are available in the desktop app.' },
    ],
  },
  {
    id: '1.7.0',
    date: 'April 23, 2026',
    title: 'Cover letters, rebuilt',
    items: [
      { tag: 'new', text: 'A card-based cover letter editor: target job, letterhead, recipient, letter and signature.' },
      { tag: 'new', text: 'Upload a handwritten signature image.' },
      { tag: 'improved', text: 'All template fonts are bundled, so they work offline.' },
    ],
  },
  {
    id: '1.6.0',
    date: 'April 19, 2026',
    title: 'One sidebar for everything',
    items: [
      { tag: 'new', text: 'Move between Resumes, Cover Letters, Job Tracker and Interview Prep from one sidebar.' },
      { tag: 'new', text: 'Cover letters can copy your contact details from a resume.' },
    ],
  },
  {
    id: '1.5.0',
    date: 'April 15, 2026',
    title: 'Interview Prep',
    items: [
      { tag: 'new', text: 'Prepare for each job: STAR answers, company notes, a cheat sheet and post-interview reflections.' },
      { tag: 'new', text: 'Generate practice questions for a role (desktop app).' },
    ],
  },
]

export const WHATS_NEW_STORAGE_KEY = 'doomssh:whats-new-seen'

export const latestWhatsNewId = (): string => WHATS_NEW[0]?.id ?? ''

/**
 * Whether to show the unread dot. Someone who has never opened the panel is only
 * nudged if they already had documents (they used the app before this panel
 * existed); a brand-new user has nothing to catch up on.
 */
export function hasUnseenWhatsNew(seenId: string | null, hasExistingData: boolean): boolean {
  if (seenId === latestWhatsNewId()) return false
  if (seenId === null) return hasExistingData
  return true
}

/** Stored per browser. Storage can be blocked (private windows), so failures are ignored. */
export function readSeenWhatsNew(): string | null {
  try {
    return window.localStorage.getItem(WHATS_NEW_STORAGE_KEY)
  } catch {
    return null
  }
}

export function markWhatsNewSeen(): void {
  try {
    window.localStorage.setItem(WHATS_NEW_STORAGE_KEY, latestWhatsNewId())
  } catch {
    // Unavailable storage just means the dot may show again next visit.
  }
}

// ── "New since your last visit" ─────────────────────────────────────────────

/**
 * When this browser last looked at What's New, as epoch ms. Kept in a cookie
 * (as asked for: it survives clearing site storage in some browsers and is easy
 * to inspect) and mirrored to localStorage, which also works where cookies do
 * not stick (the desktop app's app:// pages).
 */
export const WHATS_NEW_SEEN_AT_COOKIE = 'doomssh_whats_new_seen_at'
const SEEN_AT_STORAGE_KEY = 'doomssh:whats-new-seen-at'
/** The release a returning user was last prompted about, so the toast shows once per release. */
const PROMPTED_STORAGE_KEY = 'doomssh:whats-new-prompted'
const TWO_YEARS_S = 60 * 60 * 24 * 365 * 2

/** Epoch ms of the newest entry with a `publishedAt`, or 0. */
export function latestWhatsNewAt(): number {
  const at = WHATS_NEW.find((e) => e.publishedAt)?.publishedAt
  return at ? Date.parse(at) : 0
}

export function readSeenAt(): number | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${WHATS_NEW_SEEN_AT_COOKIE}=(\\d+)`))
    if (m) return Number(m[1])
  } catch {}
  try {
    const v = window.localStorage.getItem(SEEN_AT_STORAGE_KEY)
    if (v && /^\d+$/.test(v)) return Number(v)
  } catch {}
  return null
}

export function writeSeenAt(at: number = Date.now()): void {
  try {
    document.cookie = `${WHATS_NEW_SEEN_AT_COOKIE}=${at}; max-age=${TWO_YEARS_S}; path=/; SameSite=Lax`
  } catch {}
  try {
    window.localStorage.setItem(SEEN_AT_STORAGE_KEY, String(at))
  } catch {}
}

export function readPromptedId(): string | null {
  try {
    return window.localStorage.getItem(PROMPTED_STORAGE_KEY)
  } catch {
    return null
  }
}

export function markPrompted(): void {
  try {
    window.localStorage.setItem(PROMPTED_STORAGE_KEY, latestWhatsNewId())
  } catch {}
}

export interface WhatsNewState {
  /** Epoch ms from the cookie, or null when this browser has none. */
  seenAt: number | null
  /** The older localStorage marker (the id of the last entry opened), if any. */
  legacySeenId: string | null
  /** Whether this browser already holds resumes or cover letters. */
  hasExistingData: boolean
  /** The release the user was last prompted about. */
  promptedId: string | null
}

export interface WhatsNewDecision {
  /** Show the dot on "What's New". */
  unread: boolean
  /** Show the "see what's new" toast now. */
  prompt: boolean
  /** Store this timestamp now (a new user starts caught up). */
  initSeenAt: number | null
}

/**
 * What a visit should show. A new user (no timestamp, no old marker, no
 * documents) starts caught up and is never prompted. A returning user whose
 * timestamp is older than the newest notes sees the dot, and the toast once
 * per release. Someone who opened the latest notes before the timestamp
 * existed counts as caught up.
 */
export function decideWhatsNew(state: WhatsNewState, now: number = Date.now()): WhatsNewDecision {
  const latestAt = latestWhatsNewAt()
  const latestId = latestWhatsNewId()
  let seenAt = state.seenAt
  let initSeenAt: number | null = null

  if (seenAt === null) {
    if (state.legacySeenId === latestId) {
      // Opened the latest notes under the old marker: caught up.
      return { unread: false, prompt: false, initSeenAt: now }
    }
    if (state.legacySeenId === null && !state.hasExistingData) {
      // Brand new: nothing to catch up on.
      return { unread: false, prompt: false, initSeenAt: now }
    }
    // Used the app before the timestamp existed and has not seen these notes.
    seenAt = 0
    initSeenAt = null
  }

  const unread = seenAt < latestAt
  return { unread, prompt: unread && state.promptedId !== latestId, initSeenAt }
}
