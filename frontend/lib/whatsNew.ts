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
  title: string
  items: { tag: WhatsNewTag; text: string }[]
}

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    id: '2026-09-14-builder-polish',
    date: 'September 2026',
    title: 'A friendlier start',
    items: [
      { tag: 'new', text: 'Start from an example resume (product manager, designer or new grad) on your first visit.' },
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
