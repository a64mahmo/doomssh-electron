import type { Resume } from '@/lib/store/types'
import { SECTION_LABELS } from '@/lib/store/types'

/**
 * Every setting in the Customize panel, and every section and main field of
 * the Content panel, for the builder search (⌘P / Ctrl+P).
 *
 * `label` and `group` must match the text the panel shows: the search finds the
 * control by its `data-setting-label` inside the `data-control-group` of that
 * name (see EditorPrimitives). When a control is not on screen (it depends on
 * another setting), the search scrolls to its group instead; `note` says why.
 *
 * Add an entry here when you add a control to the panel.
 */

export type CustomizeTab = 'templates' | 'layout' | 'typography' | 'entry' | 'colors' | 'header' | 'sections'

/** 'content' is the Content panel; the rest are Customize tabs in the Style panel. */
export type SearchTab = CustomizeTab | 'content'

export const TAB_LABELS: Record<SearchTab, string> = {
  content: 'Content',
  templates: 'Templates',
  layout: 'Layout',
  typography: 'Typography',
  entry: 'Entry',
  colors: 'Colors',
  header: 'Header',
  sections: 'Sections',
}

export interface SettingEntry {
  /** Stable key. */
  id: string
  label: string
  tab: SearchTab
  /** Content entries: the editor section to open (a resume section id, or a cover letter card id). */
  contentSection?: string
  /** The ControlGroup title it sits under, if any. */
  group?: string
  /** Other words people may type for it. */
  keywords?: string[]
  /** Which documents show it. Default: both. */
  scope?: 'resume' | 'coverLetter' | 'both'
  /** Shown in the result when the control appears only in some cases. */
  note?: string
}

const TWO_COLUMNS = 'With two columns'

export const SETTINGS_INDEX: SettingEntry[] = [
  // ── Templates ──
  { id: 'templates', label: 'Templates', tab: 'templates', keywords: ['theme', 'design', 'preset', 'look', 'style'] },

  // ── Layout ──
  { id: 'paper-size', label: 'Paper Size', tab: 'layout', group: 'Page Format', keywords: ['a4', 'letter', 'page size'] },
  { id: 'date-format', label: 'Date Format', tab: 'layout', group: 'Page Format', keywords: ['month', 'year', 'dates'] },
  { id: 'language', label: 'Language', tab: 'layout', group: 'Page Format', keywords: ['locale', 'translate'] },
  { id: 'column-layout', label: 'Column Layout', tab: 'layout', group: 'Resume Structure', scope: 'resume', keywords: ['columns', 'one column', 'two columns', 'sidebar', 'mix'] },
  { id: 'sidebar-position', label: 'Sidebar Position', tab: 'layout', group: 'Resume Structure', scope: 'resume', note: TWO_COLUMNS, keywords: ['left', 'right', 'reverse', 'columns'] },
  { id: 'margin-h', label: 'Horizontal Margin', tab: 'layout', group: 'Margins & Spacing', keywords: ['padding', 'side margin', 'left', 'right'] },
  { id: 'margin-v', label: 'Vertical Margin', tab: 'layout', group: 'Margins & Spacing', keywords: ['padding', 'top margin', 'bottom margin'] },
  { id: 'entry-spacing', label: 'Entry Spacing', tab: 'layout', group: 'Margins & Spacing', scope: 'resume', keywords: ['gap', 'space between jobs'] },
  { id: 'section-spacing', label: 'Section Spacing', tab: 'layout', group: 'Margins & Spacing', scope: 'resume', keywords: ['gap', 'space between sections'] },
  { id: 'keep-entries', label: 'Keep entries together', tab: 'layout', group: 'Page Breaks', scope: 'resume', keywords: ['page break', 'split', 'next page', 'overflow', 'widow', 'orphan'] },
  { id: 'section-placement', label: 'Section Placement', tab: 'layout', group: 'Section Placement', scope: 'resume', note: TWO_COLUMNS, keywords: ['move section', 'sidebar', 'main column', 'drag'] },
  { id: 'debug', label: 'Debug Mode (Show Errors)', tab: 'layout', group: 'Settings', keywords: ['errors', 'developer'] },
  { id: 'cl-blocks', label: 'Visible Blocks', tab: 'layout', group: 'Visible Blocks', scope: 'coverLetter', keywords: ['letterhead', 'recipient', 'date', 'sincerely', 'sign off'] },
  { id: 'cl-text-align', label: 'Text Alignment', tab: 'layout', group: 'Body Typography', scope: 'coverLetter', keywords: ['justify', 'left', 'body'] },
  { id: 'cl-paragraph-spacing', label: 'Paragraph Spacing', tab: 'layout', group: 'Body Typography', scope: 'coverLetter' },
  { id: 'cl-indent', label: 'Indent First Line', tab: 'layout', group: 'Body Typography', scope: 'coverLetter' },
  { id: 'cl-date-position', label: 'Date Position', tab: 'layout', group: 'Date & Signature Placement', scope: 'coverLetter' },
  { id: 'cl-signature-side', label: 'Signature Side', tab: 'layout', group: 'Date & Signature Placement', scope: 'coverLetter' },
  { id: 'cl-signature-divider', label: 'Signature Divider', tab: 'layout', group: 'Date & Signature Placement', scope: 'coverLetter' },
  { id: 'cl-signature-scale', label: 'Signature Scale', tab: 'layout', group: 'Date & Signature Placement', scope: 'coverLetter', keywords: ['signature size'] },

  // ── Typography ──
  { id: 'font-family', label: 'Font Family', tab: 'typography', group: 'Font Family', keywords: ['font', 'typeface', 'inter', 'serif', 'sans'] },
  { id: 'font-size', label: 'Base Font Size', tab: 'typography', group: 'Sizes', keywords: ['text size', 'font size', 'bigger', 'smaller'] },
  { id: 'line-height', label: 'Line Height', tab: 'typography', group: 'Sizes', keywords: ['leading', 'line spacing'] },

  // ── Entry ──
  { id: 'entry-layout', label: 'Entry Layout', tab: 'entry', group: 'Entry Layout', scope: 'resume', keywords: ['date position', 'location', 'job layout'] },
  { id: 'column-width', label: 'Column Width', tab: 'entry', group: 'Entry Layout', scope: 'resume', note: TWO_COLUMNS, keywords: ['sidebar width', 'auto', 'manual'] },
  { id: 'sidebar-fill', label: 'Sidebar Fill', tab: 'entry', group: 'Entry Layout', scope: 'resume', note: TWO_COLUMNS, keywords: ['sidebar color', 'background', 'tint', 'solid'] },
  { id: 'title-size', label: 'Title Size', tab: 'entry', group: 'Typography & Style', scope: 'resume', keywords: ['job title size', 'position'] },
  { id: 'subtitle-style', label: 'Subtitle Style', tab: 'entry', group: 'Typography & Style', scope: 'resume', keywords: ['company', 'italic', 'bold'] },
  { id: 'subtitle-placement', label: 'Subtitle Placement', tab: 'entry', group: 'Typography & Style', scope: 'resume', keywords: ['company', 'same line', 'next line'] },
  { id: 'list-style', label: 'List Style', tab: 'entry', group: 'Typography & Style', scope: 'resume', keywords: ['bullets', 'dashes', 'points'] },
  { id: 'bold-titles', label: 'Bold entry titles', tab: 'entry', group: 'Typography & Style', scope: 'resume' },
  { id: 'indent-body', label: 'Indent body text', tab: 'entry', group: 'Typography & Style', scope: 'resume', keywords: ['bullets indent'] },

  // ── Colors ──
  { id: 'accent', label: 'Accent Color', tab: 'colors', group: 'Accent Color', keywords: ['color', 'colour', 'brand', 'primary'] },
  { id: 'acc-name', label: 'Name', tab: 'colors', group: 'Accent Targets', keywords: ['accent name', 'name color'] },
  { id: 'acc-job', label: 'Job title', tab: 'colors', group: 'Accent Targets', keywords: ['accent job title'] },
  { id: 'acc-headings', label: 'Headings', tab: 'colors', group: 'Accent Targets', keywords: ['accent headings', 'section title color'] },
  { id: 'acc-heading-line', label: 'Heading line', tab: 'colors', group: 'Accent Targets', keywords: ['accent line', 'underline color'] },
  { id: 'acc-header-icons', label: 'Header icons', tab: 'colors', group: 'Accent Targets', keywords: ['contact icons color'] },
  { id: 'acc-dots', label: 'Dots / bars', tab: 'colors', group: 'Accent Targets', keywords: ['skill level', 'bubbles', 'pills'] },
  { id: 'acc-dates', label: 'Dates', tab: 'colors', group: 'Accent Targets', keywords: ['date color'] },
  { id: 'acc-subtitle', label: 'Subtitle', tab: 'colors', group: 'Accent Targets', keywords: ['company color'] },
  { id: 'acc-links', label: 'Link icons', tab: 'colors', group: 'Accent Targets', keywords: ['link color'] },
  { id: 'theme-style', label: 'Theme Style', tab: 'colors', group: 'Theme Style', keywords: ['band', 'border', 'header band', 'advanced'] },
  { id: 'color-mode', label: 'Color Mode', tab: 'colors', group: 'Color Mode', keywords: ['text color', 'heading color', 'basic', 'custom colors'] },
  { id: 'background', label: 'Background', tab: 'colors', group: 'Background', keywords: ['page color', 'paper color'] },

  // ── Header ──
  { id: 'header-position', label: 'Header Position', tab: 'header', group: 'Header Layout', scope: 'resume', note: TWO_COLUMNS, keywords: ['header left', 'header right', 'sidebar header'] },
  { id: 'header-align', label: 'Text Alignment', tab: 'header', group: 'Header Layout', keywords: ['center name', 'left', 'right', 'header alignment'] },
  { id: 'details-position', label: 'Details Position', tab: 'header', group: 'Header Layout', keywords: ['contact beside', 'below name'] },
  { id: 'name-size', label: 'Name Size', tab: 'header', group: 'Header Layout', keywords: ['big name', 'name font'] },
  { id: 'bold-name', label: 'Bold Name', tab: 'header', group: 'Header Layout' },
  { id: 'job-title-style', label: 'Job Title', tab: 'header', group: 'Header Layout', keywords: ['caps', 'italic', 'inline', 'role'] },
  { id: 'contact-arrangement', label: 'Arrangement', tab: 'header', group: 'Contact Details', keywords: ['contact layout', 'grid', 'column', 'inline'] },
  { id: 'delimiter', label: 'Delimiter Style', tab: 'header', group: 'Contact Details', keywords: ['separator', 'pipe', 'bullet', 'contact'] },
  { id: 'contact-icons', label: 'Show Contact Icons', tab: 'header', group: 'Contact Details', keywords: ['email icon', 'phone icon'] },
  { id: 'photo', label: 'Enable Photo', tab: 'header', group: 'Photo Settings', keywords: ['picture', 'headshot', 'image', 'avatar'] },
  { id: 'photo-size', label: 'Size', tab: 'header', group: 'Photo Settings', keywords: ['photo size', 'picture size'] },
  { id: 'photo-shape', label: 'Shape', tab: 'header', group: 'Photo Settings', keywords: ['photo shape', 'circle', 'square', 'rounded'] },
  { id: 'photo-position', label: 'Position', tab: 'header', group: 'Photo Settings', keywords: ['photo position', 'beside', 'top'] },
  { id: 'photo-gap', label: 'Photo Gap', tab: 'header', group: 'Photo Settings', keywords: ['photo spacing'] },
  { id: 'page-numbers', label: 'Show Page Numbers', tab: 'header', group: 'Footer Settings', keywords: ['footer', 'page number'] },
  { id: 'footer-name', label: 'Show Name in Footer', tab: 'header', group: 'Footer Settings', keywords: ['footer'] },
  { id: 'footer-email', label: 'Show Email in Footer', tab: 'header', group: 'Footer Settings', keywords: ['footer'] },

  // ── Sections ──
  { id: 'section-labels', label: 'Show section labels', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['headings', 'titles'] },
  { id: 'heading-size', label: 'Size', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['heading size', 'section title size'] },
  { id: 'heading-caps', label: 'Capitalization', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['uppercase', 'caps', 'heading case'] },
  { id: 'heading-decoration', label: 'Decoration Style', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['heading line', 'underline', 'box', 'bar'] },
  { id: 'heading-align', label: 'Alignment', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['heading alignment', 'center headings'] },
  { id: 'heading-line', label: 'Line Thickness', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['heading line', 'rule'] },
  { id: 'heading-icon', label: 'Icon', tab: 'sections', group: 'Section Headings', scope: 'resume', keywords: ['heading icons', 'section icons'] },
  { id: 'heading-icon-size', label: 'Icon Size', tab: 'sections', group: 'Section Headings', scope: 'resume' },
  { id: 'skills-display', label: 'Display Style', tab: 'sections', group: 'Skills', scope: 'resume', keywords: ['skills', 'pills', 'bubbles', 'levels', 'compact'] },
  { id: 'skills-columns', label: 'Grid Columns', tab: 'sections', group: 'Skills', scope: 'resume', keywords: ['skills columns'] },
  { id: 'order-experience', label: 'Experience', tab: 'sections', group: 'Entry Order', scope: 'resume', keywords: ['sort jobs', 'newest first', 'order'] },
  { id: 'order-education', label: 'Education', tab: 'sections', group: 'Entry Order', scope: 'resume', keywords: ['sort degrees', 'order'] },
  { id: 'underline-links', label: 'Underline links', tab: 'sections', group: 'Links & Misc', scope: 'resume' },
  { id: 'blue-links', label: 'Blue links', tab: 'sections', group: 'Links & Misc', scope: 'resume', keywords: ['link color'] },
  { id: 'group-promotions', label: 'Group promotions', tab: 'sections', group: 'Links & Misc', scope: 'resume', keywords: ['same company', 'roles'] },
]

export function settingsFor(kind: 'resume' | 'coverLetter'): SettingEntry[] {
  return SETTINGS_INDEX.filter((e) => (e.scope ?? 'both') === 'both' || e.scope === kind)
}

// ── Content panel ─────────────────────────────────────────────────────────────

/** Header fields always shown in the resume header editor (components/editor/sections/HeaderSection). */
const HEADER_FIELDS: { label: string; group: string; keywords?: string[] }[] = [
  { label: 'Full Name', group: 'Profile Image & Identity', keywords: ['name'] },
  { label: 'Job Title', group: 'Profile Image & Identity', keywords: ['role', 'headline', 'position'] },
  { label: 'Photo', group: 'Profile Image & Identity', keywords: ['picture', 'headshot', 'upload image', 'avatar'] },
  { label: 'Email', group: 'Contact Information', keywords: ['mail', 'contact'] },
  { label: 'Phone', group: 'Contact Information', keywords: ['mobile', 'telephone', 'contact'] },
  { label: 'Location', group: 'Contact Information', keywords: ['city', 'address'] },
  { label: 'Website', group: 'Contact Information', keywords: ['portfolio', 'url', 'link'] },
  {
    label: 'Social Profiles & Additional Details',
    group: 'Social Profiles & Additional Details',
    keywords: ['linkedin', 'github', 'twitter', 'instagram', 'passport', 'nationality', 'visa', 'date of birth', 'driving license', 'pronoun'],
  },
]

/** Cover letter cards (components/cover-letter/CoverLetterEditorPanel) and their main fields. */
const COVER_LETTER_CONTENT: { card: string; title: string; keywords?: string[]; fields: { label: string; group?: string; keywords?: string[] }[] }[] = [
  { card: 'target', title: 'Target Job', keywords: ['job', 'application', 'role'], fields: [{ label: 'Select Saved Job', group: 'Application Context', keywords: ['job tracker'] }] },
  {
    card: 'letterhead', title: 'Letterhead', keywords: ['your details', 'contact'],
    fields: [
      { label: 'Full Name', keywords: ['name'] },
      { label: 'Job Title', keywords: ['role'] },
      { label: 'Email Address', keywords: ['mail'] },
      { label: 'Phone Number', keywords: ['mobile'] },
    ],
  },
  {
    card: 'recipient', title: 'Recipient', keywords: ['hiring manager', 'to'],
    fields: [
      { label: 'Letter Date', group: 'Date & Timing', keywords: ['date'] },
      { label: 'Contact Person', group: 'Target Recipient', keywords: ['hiring manager', 'name'] },
      { label: 'Company Name', group: 'Target Recipient', keywords: ['employer'] },
      { label: 'Office Address', group: 'Target Recipient', keywords: ['address'] },
    ],
  },
  { card: 'body', title: 'Letter Body', keywords: ['text', 'write', 'paragraphs', 'letter'], fields: [] },
  {
    card: 'signature', title: 'Signature', keywords: ['sign off', 'closing'],
    fields: [
      { label: 'Sign-off Name', group: 'Closing & Details', keywords: ['sincerely', 'name'] },
      { label: 'Location (Place)', group: 'Closing & Details', keywords: ['city'] },
      { label: 'Signing Date', group: 'Closing & Details', keywords: ['date'] },
      { label: 'Visual Signature', group: 'Visual Signature', keywords: ['signature image', 'upload', 'handwritten'] },
    ],
  },
]

/**
 * Content panel entries for this document: each resume section by its current
 * title (renamed and custom sections too), Manage Sections and the header
 * fields; or the cover letter's cards and fields.
 */
export function contentEntries(resume: Pick<Resume, 'kind' | 'sections'>): SettingEntry[] {
  if (resume.kind === 'coverLetter') {
    return COVER_LETTER_CONTENT.flatMap((c) => [
      { id: `content-${c.card}`, label: c.title, tab: 'content' as const, contentSection: c.card, keywords: c.keywords },
      ...c.fields.map((f) => ({
        id: `content-${c.card}-${f.label}`,
        label: f.label,
        tab: 'content' as const,
        contentSection: c.card,
        group: f.group ?? c.title,
        keywords: f.keywords,
      })),
    ])
  }
  const entries: SettingEntry[] = [
    { id: 'content-list', label: 'Manage Sections', tab: 'content', contentSection: 'list', keywords: ['add section', 'reorder', 'hide section', 'show section', 'remove section'] },
  ]
  for (const sec of resume.sections) {
    const typeLabel = SECTION_LABELS[sec.type]
    entries.push({
      id: `content-${sec.id}`,
      label: sec.title || typeLabel,
      tab: 'content',
      contentSection: sec.id,
      keywords: [typeLabel, sec.type].filter((k) => k && k !== sec.title),
    })
    if (sec.type === 'header') {
      for (const f of HEADER_FIELDS) {
        entries.push({
          id: `content-header-${f.label}`,
          label: f.label,
          tab: 'content',
          contentSection: sec.id,
          group: f.group,
          keywords: f.keywords,
        })
      }
    }
  }
  return entries
}

/**
 * Fuzzy match like VS Code's quick open: every query character must appear in
 * order. Higher is better; null means no match. Matches at the start of a word
 * and runs of consecutive characters score more.
 */
export function fuzzyScore(query: string, text: string): { score: number; positions: number[] } | null {
  const q = query.toLowerCase().replace(/\s+/g, '')
  const t = text.toLowerCase()
  if (!q) return { score: 0, positions: [] }
  const positions: number[] = []
  let score = 0
  let ti = 0
  let prev = -2
  for (const ch of q) {
    let found = -1
    for (let i = ti; i < t.length; i++) {
      if (t[i] === ch) { found = i; break }
    }
    if (found < 0) return null
    const wordStart = found === 0 || /[\s/&(),.-]/.test(t[found - 1])
    score += 1 + (found === prev + 1 ? 5 : 0) + (wordStart ? 8 : 0) + (found === 0 ? 4 : 0)
    positions.push(found)
    prev = found
    ti = found + 1
  }
  // Shorter labels win ties: a full match of a short label is more specific.
  return { score: score - t.length * 0.05, positions }
}

export interface SettingResult {
  entry: SettingEntry
  score: number
  /** Matched character positions in `entry.label`, for highlighting. */
  labelPositions: number[]
}

/** Best matches first. An empty query lists everything in panel order. */
export function searchSettings(entries: SettingEntry[], query: string): SettingResult[] {
  if (!query.trim()) return entries.map((entry) => ({ entry, score: 0, labelPositions: [] }))
  const results: SettingResult[] = []
  for (const entry of entries) {
    const label = fuzzyScore(query, entry.label)
    // The label counts most; group, tab and keywords help find it by context.
    const context = [entry.group, TAB_LABELS[entry.tab], ...(entry.keywords ?? [])]
      .filter(Boolean)
      .map((t) => fuzzyScore(query, t as string))
      .filter((m): m is NonNullable<typeof m> => m !== null)
    const best = Math.max(label ? label.score * 1.5 : -Infinity, ...context.map((m) => m.score))
    if (best === -Infinity) continue
    results.push({ entry, score: best, labelPositions: label?.positions ?? [] })
  }
  return results.sort((a, b) => b.score - a.score)
}
