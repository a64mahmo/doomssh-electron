// Cleans an imported vault file before anything from it is stored.
//
// Nothing is copied wholesale: every document is rebuilt field by field from
// the shapes the app knows, so unknown keys (including __proto__/constructor),
// wrong types and unknown section types never get through. On top of that:
//  - text: HTML tags and <script>/<style> blocks are removed, along with
//    control characters, and lengths are capped;
//  - links: only http(s), mailto and tel (or a bare address like
//    "linkedin.com/in/me"); javascript:, data:, file: and the rest are cleared;
//  - images: only base64 PNG, JPEG, WebP or GIF data URLs (no SVG, which can
//    carry script, and no remote URLs, which would phone home);
//  - colours: hex, rgb()/hsl() or a plain colour name;
//  - ids: only letters, digits, "_" and "-" (they become file names on desktop).
// Every change is counted so the import screen can say what was cleaned.
import type {
  Resume, ResumeSection, ResumeSettings, SectionType, CoverLetterData,
  JobApplication, JobContact, JobEvent, InterviewPrep,
} from '@/lib/store/types'
import { DEFAULT_SETTINGS } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'

export const VAULT_FORMAT = 'doomssh-vault'
export const VAULT_VERSION = 1

/** Refused before parsing. Real vaults with photos run to tens of MB. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024
const MAX_DOCUMENTS = 2000
const MAX_JOBS = 10000
const MAX_ITEMS = 500
const MAX_TEXT = 50_000
const MAX_SHORT = 500
const MAX_URL = 2048
const MAX_IMAGE = 20 * 1024 * 1024

export class VaultImportError extends Error {}

export interface CleanReport {
  /** How many values were changed or dropped. */
  cleaned: number
  /** A few human-readable examples, for the import screen. */
  notes: string[]
}

export interface SanitizedVault {
  resumes: Resume[]
  coverLetters: Resume[]
  jobs: JobApplication[]
  report: CleanReport
}

// ─── Primitive cleaners ──────────────────────────────────────────────────────

type Obj = Record<string, unknown>

class Cleaner {
  report: CleanReport = { cleaned: 0, notes: [] }

  flag(where: string, what: string) {
    this.report.cleaned++
    if (this.report.notes.length < 25) this.report.notes.push(`${where}: ${what}`)
  }

  text(v: unknown, where: string, max = MAX_TEXT): string {
    if (v == null) return ''
    if (typeof v !== 'string') {
      if (typeof v === 'number' && Number.isFinite(v)) return String(v)
      this.flag(where, 'dropped a value of the wrong type')
      return ''
    }
    let s = v
      .replace(/<\s*(script|style|iframe|object|embed)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/<\/?[a-z][^>]*>/gi, '')
      // Control characters other than tab and newline.
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // eslint-disable-line no-control-regex
    if (s !== v) this.flag(where, 'removed HTML or script')
    if (s.length > max) {
      s = s.slice(0, max)
      this.flag(where, 'shortened very long text')
    }
    return s
  }

  short(v: unknown, where: string): string {
    return this.text(v, where, MAX_SHORT)
  }

  bool(v: unknown, fallback: boolean): boolean {
    return typeof v === 'boolean' ? v : fallback
  }

  num(v: unknown, fallback: number, min = -1e9, max = 1e9): number {
    return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
  }

  oneOf<T extends string>(v: unknown, options: readonly T[], fallback: T): T {
    return typeof v === 'string' && (options as readonly string[]).includes(v) ? (v as T) : fallback
  }

  url(v: unknown, where: string): string {
    if (v == null || v === '') return ''
    if (typeof v !== 'string') {
      this.flag(where, 'dropped a link of the wrong type')
      return ''
    }
    const s = v.trim()
    if (!s) return ''
    const unsafe = () => {
      this.flag(where, 'removed an unsafe link')
      return ''
    }
    if (s.length > MAX_URL || /[\s<>"'`\\\u0000-\u001F]/.test(s)) return unsafe() // eslint-disable-line no-control-regex
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(s)?.[1]?.toLowerCase()
    if (scheme) {
      if (!['http', 'https', 'mailto', 'tel'].includes(scheme)) return unsafe()
      if (scheme === 'http' || scheme === 'https') {
        try {
          new URL(s)
        } catch {
          return unsafe()
        }
      }
      return s
    }
    // A bare address ("linkedin.com/in/me", "me@example.com"): no scheme to abuse.
    return s
  }

  image(v: unknown, where: string): string | undefined {
    if (v == null || v === '') return undefined
    if (typeof v === 'string') {
      const s = v.replace(/\s+/g, '')
      if (s.length <= MAX_IMAGE && /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(s)) return s
    }
    this.flag(where, 'removed an image that is not a safe PNG, JPEG, WebP or GIF')
    return undefined
  }

  color(v: unknown, fallback: string | undefined, where: string): string | undefined {
    if (v == null) return fallback
    if (typeof v === 'string') {
      const s = v.trim()
      if (
        /^#[0-9a-f]{3,8}$/i.test(s) ||
        /^(rgb|rgba|hsl|hsla)\(\s*[-0-9.,%\s/deg]+\)$/i.test(s) ||
        /^[a-z]{3,30}$/i.test(s)
      ) return s
    }
    this.flag(where, 'reset an invalid colour')
    return fallback
  }

  /** Section and entry ids: kept when safe (settings refer to them), otherwise replaced. */
  id(v: unknown, where: string): string {
    if (typeof v === 'string' && /^[\w-]{1,100}$/.test(v)) return v
    if (v != null) this.flag(where, 'replaced an invalid id')
    return generateId()
  }

  obj(v: unknown): Obj | null {
    return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null
  }

  list(v: unknown, where: string, max = MAX_ITEMS): Obj[] {
    if (v == null) return []
    if (!Array.isArray(v)) {
      this.flag(where, 'dropped a list of the wrong type')
      return []
    }
    if (v.length > max) this.flag(where, `kept the first ${max} entries`)
    const out: Obj[] = []
    for (const item of v.slice(0, max)) {
      const o = this.obj(item)
      if (o) out.push(o)
      else this.flag(where, 'dropped an entry of the wrong type')
    }
    return out
  }
}

// ─── Settings ────────────────────────────────────────────────────────────────

const SECTION_TYPES = [
  'header', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications',
  'languages', 'awards', 'volunteering', 'publications', 'references', 'custom',
] as const satisfies readonly SectionType[]

const TEMPLATE_IDS = [
  'modern', 'classic', 'minimal', 'crisp', 'tokyo', 'elite', 'blocks', 'dublin', 'london', 'berlin',
  'oslo', 'zurich', 'milano', 'seoul', 'aspen', 'vega', 'lumen', 'atlas', 'sierra', 'nova', 'custom',
] as const

type Rule =
  | { t: 'bool' }
  | { t: 'num'; min: number; max: number }
  | { t: 'enum'; of: readonly (string | number)[] }
  | { t: 'color' }
  | { t: 'text' }

const b: Rule = { t: 'bool' }
const n = (min: number, max: number): Rule => ({ t: 'num', min, max })
const e = (...of: (string | number)[]): Rule => ({ t: 'enum', of })
const c: Rule = { t: 'color' }
const SIZES = e('XS', 'S', 'M', 'L', 'XL')

/** Every setting with what it may hold. Settings not listed here are dropped. */
const SETTINGS_RULES: Record<string, Rule> = {
  accentColor: c, fontFamily: e('Inter', 'Merriweather', 'Roboto', 'Playfair Display', 'Source Sans Pro', 'Lato', 'Raleway', 'IBM Plex Serif', 'IBM Plex Mono'),
  fontSize: n(4, 30), paperSize: e('a4', 'letter'), dateFormat: e('MM/YYYY', 'MMMM YYYY', 'YYYY', 'YYYY MMM DD', 'MMM YYYY'),
  showSectionLabels: b, photoEnabled: b, photoSize: SIZES, photoShape: e('circle', 'rounded', 'square'), language: { t: 'text' },
  columnLayout: e('one', 'two', 'mix'), headerLayout: e('top', 'main', 'sidebar'), sidebarTheme: e('none', 'accent', 'custom'),
  sidebarBackgroundColor: c, sidebarFill: e('tint', 'solid'), sectionHeadingAlign: e('left', 'center'),
  jobTitleStyle: e('caps', 'normal', 'italic'), jobTitlePlacement: e('below', 'inline'), columnDivider: b,
  keepEntriesTogether: b, sidebarTextColor: c, columnReverse: b, lineHeight: n(0.5, 4), marginHorizontal: n(0, 80),
  marginVertical: n(0, 80), entrySpacing: n(0, 10), entryLayout: e('date-location-right', 'date-location-left', 'date-content-location', 'full-width'),
  columnWidthMode: e('auto', 'manual'), columnWidth: n(5, 95), titleSize: e('S', 'M', 'L'), subtitleStyle: e('normal', 'bold', 'italic'),
  subtitlePlacement: e('same-line', 'next-line'), indentBody: b, listStyle: e('bullet', 'dash', 'hyphen'),
  colorMode: e('basic', 'multi', 'image'), themeColorStyle: e('basic', 'advanced', 'border'), textColor: c, backgroundColor: c,
  headingColor: c, dateColor: c, subtitleColor: c, applyAccentName: b, applyAccentJobTitle: b, applyAccentHeadings: b,
  applyAccentHeadingLine: b, applyAccentHeaderIcons: b, applyAccentDotsBarsBubbles: b, applyAccentDates: b,
  applyAccentEntrySubtitle: b, applyAccentLinkIcons: b, sectionHeadingSize: e('S', 'M', 'L', 'XL'),
  sectionHeadingCapitalization: e('capitalize', 'uppercase', 'none'), sectionHeadingIcon: e('none', 'simple', 'filled', 'knockout'),
  sectionHeadingStyle: e('none', 'underline', 'overline', 'top-bottom', 'box', 'background', 'left-bar'),
  sectionHeadingIconStyle: e('lucide', 'nerd'), sectionHeadingIconSize: n(0.2, 4), sectionHeadingLineThickness: n(0, 10),
  linkUnderline: b, linkBlue: b, headerAlignment: e('left', 'center', 'right'), headerArrangement: e('icon', 'bullet', 'verticalBar', 'none'),
  nameSize: e('XS', 'S', 'M', 'L', 'XL', 'XXL'), nameBold: b, photoPosition: e('beside', 'top', 'bottom'),
  photoAlignment: e('left', 'center', 'right'), photoVerticalAlign: e('top', 'center', 'bottom'),
  photoBorderStyle: e('none', 'thin', 'medium', 'thick'), photoBorderColor: c, photoGap: n(0, 100),
  detailsArrangement: e('column', 'wrap', 'grid'), detailsPosition: e('beside', 'below'), detailsTextAlignment: e('left', 'right', 'center'),
  detailsSpacing: e('compact', 'comfortable'), contactIcons: b,
  contactIconStyle: e('none', 'circle-filled', 'rounded-filled', 'square-filled', 'circle-outline', 'rounded-outline', 'square-outline'),
  footerPageNumbers: b, footerEmail: b, footerName: b, footerPageFormat: e('number', 'of-total', 'page-of'), footerDivider: b,
  footerCustom: b, footerLeft: { t: 'text' }, footerCenter: { t: 'text' }, footerRight: { t: 'text' },
  skillDisplay: e('grid', 'level', 'compact', 'bubble', 'dots'), skillColumns: e(2, 3, 4),
  educationOrder: e('degree-school', 'school-degree'), experienceOrder: e('title-employer', 'employer-title'), groupPromotions: b,
  titleBold: b, sectionSpacing: n(0, 10), clDatePosition: e('left', 'right'), clSignaturePosition: e('left', 'right'),
  clShowSignatureLine: b, clShowDate: b, clShowRecipient: b, clShowLetterhead: b, clShowAutoSignOff: b, clParagraphSpacing: n(0, 10),
  clBodyAlign: e('left', 'justify'), clFirstLineIndent: b, clSignatureSize: e('sm', 'md', 'lg'), debugMode: b,
}

function cleanSettings(k: Cleaner, raw: unknown, where: string): ResumeSettings {
  const src = k.obj(raw) ?? {}
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS }
  for (const [key, rule] of Object.entries(SETTINGS_RULES)) {
    if (!(key in src)) continue
    const v = src[key]
    const at = `${where} › settings.${key}`
    let ok: unknown
    switch (rule.t) {
      case 'bool': ok = typeof v === 'boolean' ? v : undefined; break
      case 'num': ok = typeof v === 'number' && Number.isFinite(v) && v >= rule.min && v <= rule.max ? v : undefined; break
      case 'enum': ok = rule.of.includes(v as string | number) ? v : undefined; break
      case 'color': ok = k.color(v, undefined, at); break
      case 'text': ok = typeof v === 'string' ? k.text(v, at, MAX_SHORT) : undefined; break
    }
    if (ok === undefined) {
      if (rule.t !== 'color' && v !== undefined) k.flag(at, 'reset an invalid setting')
      continue
    }
    out[key] = ok
  }
  // Section → column choices, keyed by section id.
  const cols: Record<string, 'main' | 'sidebar'> = {}
  for (const [id, col] of Object.entries(k.obj(src.sectionColumns) ?? {})) {
    if (/^[\w-]{1,100}$/.test(id) && (col === 'main' || col === 'sidebar')) cols[id] = col
  }
  out.sectionColumns = cols
  if (Array.isArray(src.sidebarSectionTypes)) {
    out.sidebarSectionTypes = src.sidebarSectionTypes.filter((t): t is SectionType => (SECTION_TYPES as readonly unknown[]).includes(t))
  }
  return out as unknown as ResumeSettings
}

// ─── Sections ────────────────────────────────────────────────────────────────

const HEADER_TEXT = [
  'fullName', 'jobTitle', 'email', 'phone', 'location', 'nationality', 'dateOfBirth', 'visa', 'passportOrId',
  'availability', 'genderPronoun', 'disability', 'workMode', 'relocation', 'expectedSalary', 'secondPhone',
  'drivingLicense', 'securityClearance', 'maritalStatus', 'militaryService', 'smoking', 'height', 'weight',
]
const HEADER_LINKS = [
  'website', 'linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'pinterest', 'medium',
  'behance', 'dribbble', 'stackoverflow', 'gitlab', 'bitbucket', 'discord', 'reddit', 'bluesky', 'threads', 'mastodon',
]
const REQUIRED_HEADER = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website', 'linkedin', 'github']
const LEVELS = ['beginner', 'elementary', 'intermediate', 'advanced', 'expert', ''] as const

type Field = 'text' | 'short' | 'url' | 'bool' | 'level'
const ENTRY_FIELDS: Record<Exclude<SectionType, 'header' | 'summary'>, Record<string, Field>> = {
  experience: { company: 'short', position: 'short', location: 'short', startDate: 'short', endDate: 'short', present: 'bool', description: 'text' },
  education: { institution: 'short', degree: 'short', field: 'short', location: 'short', startDate: 'short', endDate: 'short', present: 'bool', gpa: 'short', description: 'text' },
  skills: { name: 'text', level: 'level', category: 'short' },
  projects: { name: 'short', url: 'url', date: 'short', description: 'text' },
  certifications: { name: 'short', issuer: 'short', date: 'short', url: 'url', description: 'text' },
  languages: { language: 'short', level: 'level' },
  awards: { title: 'short', issuer: 'short', date: 'short', description: 'text' },
  volunteering: { organization: 'short', role: 'short', location: 'short', startDate: 'short', endDate: 'short', present: 'bool', description: 'text' },
  publications: { title: 'short', publisher: 'short', date: 'short', url: 'url', description: 'text' },
  references: { name: 'short', company: 'short', position: 'short', email: 'short', phone: 'short' },
  custom: { title: 'short', subtitle: 'short', date: 'short', description: 'text' },
}

function cleanEntry(k: Cleaner, o: Obj, fields: Record<string, Field>, where: string): Obj {
  const out: Obj = { id: k.id(o.id, where) }
  for (const [key, f] of Object.entries(fields)) {
    const at = `${where}.${key}`
    if (f === 'bool') out[key] = k.bool(o[key], false)
    else if (f === 'url') out[key] = k.url(o[key], at)
    else if (f === 'level') out[key] = k.oneOf(o[key], LEVELS, '')
    else out[key] = f === 'short' ? k.short(o[key], at) : k.text(o[key], at)
  }
  return out
}

function cleanSection(k: Cleaner, o: Obj, where: string): ResumeSection | null {
  const type = o.type
  if (!(SECTION_TYPES as readonly unknown[]).includes(type)) {
    k.flag(where, `dropped a section of unknown type`)
    return null
  }
  const t = type as SectionType
  const at = `${where} › ${typeof o.title === 'string' ? o.title.slice(0, 40) : t}`
  let items: unknown
  if (t === 'header') {
    const h = k.obj(o.items) ?? {}
    const out: Obj = {}
    for (const key of HEADER_TEXT) if (key in h || REQUIRED_HEADER.includes(key)) out[key] = k.short(h[key], `${at}.${key}`)
    for (const key of HEADER_LINKS) if (key in h || REQUIRED_HEADER.includes(key)) out[key] = k.url(h[key], `${at}.${key}`)
    const photo = k.image(h.photo, `${at}.photo`)
    if (photo) out.photo = photo
    items = out
  } else if (t === 'summary') {
    items = { text: k.text(k.obj(o.items)?.text, `${at}.text`) }
  } else {
    items = k.list(o.items, at).map((entry) => cleanEntry(k, entry, ENTRY_FIELDS[t], at))
  }
  return {
    id: k.id(o.id, at),
    type: t,
    title: k.short(o.title, `${at}.title`),
    visible: k.bool(o.visible, true),
    items: items as ResumeSection['items'],
  }
}

function cleanCoverLetter(k: Cleaner, raw: unknown, where: string): CoverLetterData {
  const o = k.obj(raw) ?? {}
  const r = k.obj(o.recipient) ?? {}
  const sig = k.obj(o.signature) ?? {}
  const image = k.image(sig.image, `${where} › signature`)
  return {
    syncWithResume: k.bool(o.syncWithResume, false),
    date: k.short(o.date, `${where} › date`),
    recipient: {
      hrName: k.short(r.hrName, `${where} › recipient`),
      company: k.short(r.company, `${where} › recipient`),
      address: k.text(r.address, `${where} › recipient`, 2000),
    },
    body: k.text(o.body, `${where} › body`, 200_000),
    signature: {
      fullName: k.short(sig.fullName, `${where} › signature`),
      place: k.short(sig.place, `${where} › signature`),
      date: k.short(sig.date, `${where} › signature`),
      ...(image ? { image } : {}),
    },
    // Remapped to the new ids by the importer.
    linkedJobId: typeof o.linkedJobId === 'string' ? o.linkedJobId : null,
    linkedResumeId: typeof o.linkedResumeId === 'string' ? o.linkedResumeId : null,
  }
}

/** A clean copy of one resume or cover letter. Its id is kept only for remapping links; the importer replaces it. */
function cleanDocument(k: Cleaner, raw: Obj, kind: 'resume' | 'coverLetter', index: number): Resume {
  const name = k.short(raw.name, `Title of ${kind === 'coverLetter' ? 'cover letter' : 'resume'} ${index + 1}`) || (kind === 'coverLetter' ? 'Imported Cover Letter' : 'Imported Resume')
  const where = `“${name.slice(0, 40)}”`
  const sections = k.list(raw.sections, `${where} › sections`, 100)
    .map((s) => cleanSection(k, s, where))
    .filter((s): s is ResumeSection => s !== null)
  // Exactly one header, first.
  const headers = sections.filter((s) => s.type === 'header')
  if (headers.length > 1) k.flag(where, 'removed extra header sections')
  const header: ResumeSection = headers[0] ?? {
    id: generateId(), type: 'header', title: 'Header', visible: true,
    items: Object.fromEntries(REQUIRED_HEADER.map((key) => [key, ''])) as unknown as ResumeSection['items'],
  }
  const now = Date.now()
  return {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 200) : '',
    name,
    createdAt: k.num(raw.createdAt, now, 0, 8.64e15),
    updatedAt: k.num(raw.updatedAt, now, 0, 8.64e15),
    ...(kind === 'coverLetter' ? { kind: 'coverLetter' as const } : {}),
    template: k.oneOf(raw.template, TEMPLATE_IDS, 'custom'),
    settings: cleanSettings(k, raw.settings, where),
    sections: [header, ...sections.filter((s) => s.type !== 'header')],
    ...(kind === 'coverLetter' ? { coverLetter: cleanCoverLetter(k, raw.coverLetter, where) } : {}),
  }
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

const JOB_STATUS = ['wishlist', 'applied', 'phone-screen', 'technical', 'onsite', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted'] as const
const JOB_SOURCE = ['linkedin', 'indeed', 'glassdoor', 'company-website', 'referral', 'recruiter', 'angellist', 'hacker-news', 'other'] as const
const EVENT_TYPES = ['status-change', 'note', 'interview', 'follow-up', 'deadline-passed', 'deadline-change', 'other'] as const
const Q_CATEGORIES = ['technical', 'behavioral', 'situational', 'general'] as const

function dateOrNull(k: Cleaner, v: unknown, where: string): string | null {
  return typeof v === 'string' && v ? k.short(v, where) : null
}

function cleanJob(k: Cleaner, o: Obj, index: number): JobApplication {
  const company = k.short(o.company, `Job ${index + 1} › company`)
  const where = `Job “${(company || String(index + 1)).slice(0, 40)}”`
  const now = Date.now()
  const contacts: JobContact[] = k.list(o.contacts, `${where} › contacts`).map((ct) => ({
    id: k.id(ct.id, `${where} › contact`),
    name: k.short(ct.name, `${where} › contact`),
    role: k.short(ct.role, `${where} › contact`),
    email: k.short(ct.email, `${where} › contact`),
    phone: k.short(ct.phone, `${where} › contact`),
    linkedin: k.url(ct.linkedin, `${where} › contact.linkedin`),
    notes: k.text(ct.notes, `${where} › contact`),
  }))
  const events: JobEvent[] = k.list(o.events, `${where} › events`, 2000).map((ev) => ({
    id: k.id(ev.id, `${where} › event`),
    type: k.oneOf(ev.type, EVENT_TYPES, 'other'),
    date: k.short(ev.date, `${where} › event`),
    title: k.short(ev.title, `${where} › event`),
    description: k.text(ev.description, `${where} › event`),
  }))
  const prepRaw = k.obj(o.interviewPrep)
  const interviewPrep: InterviewPrep | undefined = prepRaw
    ? {
        questions: k.list(prepRaw.questions, `${where} › questions`).map((q) => ({
          id: k.id(q.id, `${where} › question`),
          question: k.text(q.question, `${where} › question`),
          category: k.oneOf(q.category, Q_CATEGORIES, 'general'),
          answer: k.text(q.answer, `${where} › answer`),
        })),
        companyNotes: k.text(prepRaw.companyNotes, `${where} › company notes`),
        cheatSheet: (Array.isArray(prepRaw.cheatSheet) ? prepRaw.cheatSheet.slice(0, MAX_ITEMS) : [])
          .map((line) => k.text(line, `${where} › cheat sheet`, 5000)),
        reflections: k.list(prepRaw.reflections, `${where} › reflections`).map((r) => ({
          id: k.id(r.id, `${where} › reflection`),
          date: k.short(r.date, `${where} › reflection`),
          wentWell: k.text(r.wentWell, `${where} › reflection`),
          wasDifficult: k.text(r.wasDifficult, `${where} › reflection`),
          followUp: k.text(r.followUp, `${where} › reflection`),
        })),
      }
    : undefined
  const money = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null)
  return {
    id: typeof o.id === 'string' ? o.id.slice(0, 200) : '',
    company,
    role: k.short(o.role, `${where} › role`),
    status: k.oneOf(o.status, JOB_STATUS, 'wishlist'),
    priority: k.oneOf(o.priority, ['low', 'medium', 'high'] as const, 'medium'),
    url: k.url(o.url, `${where} › url`),
    source: k.oneOf(o.source, JOB_SOURCE, 'other'),
    location: k.short(o.location, `${where} › location`),
    workMode: k.oneOf(o.workMode, ['remote', 'hybrid', 'onsite', ''] as const, ''),
    salaryMin: money(o.salaryMin),
    salaryMax: money(o.salaryMax),
    salaryCurrency: k.short(o.salaryCurrency, `${where} › currency`).slice(0, 10) || 'USD',
    resumeId: typeof o.resumeId === 'string' ? o.resumeId : null,
    coverLetterId: typeof o.coverLetterId === 'string' ? o.coverLetterId : null,
    coverLetter: k.text(o.coverLetter, `${where} › cover letter`, 200_000),
    notes: k.text(o.notes, `${where} › notes`),
    contacts,
    events,
    appliedDate: dateOrNull(k, o.appliedDate, where),
    responseDate: dateOrNull(k, o.responseDate, where),
    deadlineDate: dateOrNull(k, o.deadlineDate, where),
    createdAt: k.num(o.createdAt, now, 0, 8.64e15),
    updatedAt: k.num(o.updatedAt, now, 0, 8.64e15),
    archivedAt: typeof o.archivedAt === 'number' && Number.isFinite(o.archivedAt) ? o.archivedAt : null,
    ...(interviewPrep ? { interviewPrep } : {}),
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Parses and cleans an exported vault. Also accepts a single resume or cover
 * letter saved with "Export JSON". Throws VaultImportError for anything else.
 */
export function sanitizeVault(text: string): SanitizedVault {
  if (text.length > MAX_FILE_BYTES) throw new VaultImportError('This file is too large to import.')
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new VaultImportError('This file is not valid JSON.')
  }
  const k = new Cleaner()
  const top = k.obj(raw)
  if (!top) throw new VaultImportError('This file is not a DoomSSH vault.')

  // A single document exported on its own.
  if (top.format === undefined && Array.isArray(top.sections) && typeof top.name === 'string') {
    const kind = top.kind === 'coverLetter' ? 'coverLetter' : 'resume'
    const doc = cleanDocument(k, top, kind, 0)
    return { resumes: kind === 'resume' ? [doc] : [], coverLetters: kind === 'coverLetter' ? [doc] : [], jobs: [], report: k.report }
  }

  if (top.format !== VAULT_FORMAT) throw new VaultImportError('This file is not a DoomSSH vault.')
  if (top.version !== VAULT_VERSION) throw new VaultImportError('This vault was made by a newer version of DoomSSH. Update the app, then try again.')

  const resumes = k.list(top.resumes, 'Resumes', MAX_DOCUMENTS).map((d, i) => cleanDocument(k, d, 'resume', i))
  const coverLetters = k.list(top.coverLetters, 'Cover letters', MAX_DOCUMENTS).map((d, i) => cleanDocument(k, d, 'coverLetter', i))
  const jobs = k.list(top.jobs, 'Jobs', MAX_JOBS).map((j, i) => cleanJob(k, j, i))
  return { resumes, coverLetters, jobs, report: k.report }
}
