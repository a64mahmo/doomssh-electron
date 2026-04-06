// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — all TypeScript types for the resume builder
// Never define resume-related types anywhere else. Import from here.
// ─────────────────────────────────────────────────────────────────────────────

export type SectionType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'awards'
  | 'volunteering'
  | 'publications'
  | 'references'
  | 'custom'

export type TemplateId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'crisp'
  | 'tokyo'
  | 'elite'

export type FontOption =
  | 'Inter'
  | 'Merriweather'
  | 'Roboto'
  | 'Playfair Display'
  | 'Source Sans Pro'
  | 'Lato'
  | 'Raleway'
  | 'IBM Plex Serif'

export type DateFormat = 'MM/YYYY' | 'MMMM YYYY' | 'YYYY' | 'YYYY MMM DD' | 'MMM YYYY'
export type PaperSize = 'a4' | 'letter'
export type ProficiencyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert'
export type ColumnLayout = 'one' | 'two' | 'mix'
export type ListStyle = 'bullet' | 'dash' | 'hyphen'
export type SubtitleStyle = 'normal' | 'bold' | 'italic'
export type SubtitlePlacement = 'same-line' | 'next-line'
export type SectionHeadingSize = 'S' | 'M' | 'L' | 'XL'
export type SectionHeadingCapitalization = 'capitalize' | 'uppercase' | 'none'
export type SectionHeadingIcon = 'none' | 'outline' | 'filled'
export type HeaderAlignment = 'left' | 'center' | 'right'
export type HeaderArrangement = 'icon' | 'bullet' | 'pipe' | 'bar'
export type NameSize = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type ColorMode = 'basic' | 'multi' | 'image'
export type FontStyle = 'serif' | 'sans' | 'mono'
export type SkillDisplayOption = 'grid' | 'level' | 'compact' | 'bubble'
export type EducationOrder = 'degree-school' | 'school-degree'
export type ExperienceOrder = 'title-employer' | 'employer-title'

// ─── Section Item Types ───────────────────────────────────────────────────────

export interface HeaderItem {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  photo?: string // base64
}

export interface SummaryItem {
  text: string
}

export interface ExperienceItem {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  present: boolean
  description: string
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  present: boolean
  gpa: string
  description: string
}

export interface SkillItem {
  id: string
  name: string
  level: ProficiencyLevel | ''
  category: string
}

export interface ProjectItem {
  id: string
  name: string
  url: string
  date: string
  description: string
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

export interface LanguageItem {
  id: string
  language: string
  level: ProficiencyLevel | ''
}

export interface AwardItem {
  id: string
  title: string
  issuer: string
  date: string
  description: string
}

export interface VolunteeringItem {
  id: string
  organization: string
  role: string
  startDate: string
  endDate: string
  present: boolean
  description: string
}

export interface PublicationItem {
  id: string
  title: string
  publisher: string
  date: string
  url: string
  description: string
}

export interface ReferenceItem {
  id: string
  name: string
  company: string
  position: string
  email: string
  phone: string
}

export interface CustomItem {
  id: string
  title: string
  subtitle: string
  date: string
  description: string
}

// ─── Section Item Union ───────────────────────────────────────────────────────

export type AnySectionItems =
  | HeaderItem
  | SummaryItem
  | ExperienceItem[]
  | EducationItem[]
  | SkillItem[]
  | ProjectItem[]
  | CertificationItem[]
  | LanguageItem[]
  | AwardItem[]
  | VolunteeringItem[]
  | PublicationItem[]
  | ReferenceItem[]
  | CustomItem[]

// ─── Section ─────────────────────────────────────────────────────────────────

export interface ResumeSection<T = AnySectionItems> {
  id: string
  type: SectionType
  title: string
  visible: boolean
  items: T
}

// ─── Resume Settings ──────────────────────────────────────────────────────────

export interface ResumeSettings {
  // Basics
  accentColor: string
  fontFamily: FontOption
  fontSize: number          // pt, e.g. 10.5
  paperSize: PaperSize
  dateFormat: DateFormat
  showSectionLabels: boolean
  photoEnabled: boolean
  language: string          // e.g. 'en-GB'

  // Layout & Spacing
  columnLayout: ColumnLayout
  lineHeight: number        // e.g. 1.5
  marginHorizontal: number  // mm, e.g. 20
  marginVertical: number    // mm, e.g. 10
  entrySpacing: number      // multiplier 0.8-1.4
  titleSize: 'S' | 'M' | 'L'
  subtitleStyle: SubtitleStyle
  subtitlePlacement: SubtitlePlacement
  indentBody: boolean
  listStyle: ListStyle

  // Design — colors
  colorMode: ColorMode
  textColor: string
  backgroundColor: string
  headingColor: string
  dateColor: string
  subtitleColor: string

  // Design — section headings
  sectionHeadingSize: SectionHeadingSize
  sectionHeadingCapitalization: SectionHeadingCapitalization
  sectionHeadingIcon: SectionHeadingIcon
  linkUnderline: boolean
  linkBlue: boolean

  // Header
  headerAlignment: HeaderAlignment
  headerArrangement: HeaderArrangement
  nameSize: NameSize
  nameBold: boolean

  // Footer
  footerPageNumbers: boolean
  footerEmail: boolean
  footerName: boolean

  // Per-section display
  skillDisplay: SkillDisplayOption
  educationOrder: EducationOrder
  experienceOrder: ExperienceOrder
  groupPromotions: boolean

  // Section Column Mapping (sectionId -> 'main' | 'sidebar')
  sectionColumns: Record<string, 'main' | 'sidebar'>
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export interface Resume {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  template: TemplateId
  settings: ResumeSettings
  sections: ResumeSection[]
}

// ─── Store Shape ──────────────────────────────────────────────────────────────

export interface ResumeStore {
  resume: Resume | null
  isDirty: boolean
  setResume: (resume: Resume) => void
  updateSettings: (settings: Partial<ResumeSettings>) => void
  updateSection: (sectionId: string, updates: Partial<ResumeSection>) => void
  updateSectionItems: (sectionId: string, items: AnySectionItems) => void
  reorderSections: (activeId: string, overId: string) => void
  addSection: (type: SectionType) => void
  removeSection: (sectionId: string) => void
  toggleSectionVisibility: (sectionId: string) => void
  markSaved: () => void
}

export interface UIStore {
  activeSection: string | null
  showAIPanel: boolean
  previewZoom: number
  isExporting: boolean
  selectedText: string
  setActiveSection: (id: string | null) => void
  setShowAIPanel: (show: boolean) => void
  setPreviewZoom: (zoom: number) => void
  setIsExporting: (exporting: boolean) => void
  setSelectedText: (text: string) => void
}

// ─── Default Values ───────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: ResumeSettings = {
  // Basics
  accentColor: '#1a2744',
  fontFamily: 'Inter',
  fontSize: 10.5,
  paperSize: 'letter',
  dateFormat: 'MMM YYYY',
  showSectionLabels: true,
  photoEnabled: false,
  language: 'en-GB',

  // Layout & Spacing
  columnLayout: 'one',
  lineHeight: 1.5,
  marginHorizontal: 20,
  marginVertical: 10,
  entrySpacing: 1,
  titleSize: 'M',
  subtitleStyle: 'normal',
  subtitlePlacement: 'next-line',
  indentBody: false,
  listStyle: 'bullet',

  // Design — colors
  colorMode: 'basic',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  headingColor: '#1a2744',
  dateColor: '#4a5568',
  subtitleColor: '#4a5568',

  // Design — section headings
  sectionHeadingSize: 'M',
  sectionHeadingCapitalization: 'uppercase',
  sectionHeadingIcon: 'none',
  linkUnderline: false,
  linkBlue: false,

  // Header
  headerAlignment: 'center',
  headerArrangement: 'pipe',
  nameSize: 'L',
  nameBold: true,

  // Footer
  footerPageNumbers: false,
  footerEmail: false,
  footerName: false,

  // Per-section display
  skillDisplay: 'compact',
  educationOrder: 'degree-school',
  experienceOrder: 'title-employer',
  groupPromotions: false,
  sectionColumns: {},
}

export const DEFAULT_HEADER: HeaderItem = {
  fullName: 'Your Name',
  jobTitle: 'Your Job Title',
  email: 'email@example.com',
  phone: '+1 (555) 000-0000',
  location: 'City, Country',
  website: '',
  linkedin: '',
  github: '',
}

export const SECTION_LABELS: Record<SectionType, string> = {
  header: 'Header',
  summary: 'Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  volunteering: 'Volunteering',
  publications: 'Publications',
  references: 'References',
  custom: 'Custom Section',
}
