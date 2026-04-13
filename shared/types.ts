// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES — Common types used by both Electron (main) and Frontend (renderer)
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateInfo {
  version: string
}

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
  | 'mono'
  | 'blocks'
  | 'dublin'
  | 'london'
  | 'berlin'
  | 'custom'

export type FontOption =
  | 'Inter'
  | 'Merriweather'
  | 'Roboto'
  | 'Playfair Display'
  | 'Source Sans Pro'
  | 'Lato'
  | 'Raleway'
  | 'IBM Plex Serif'
  | 'IBM Plex Mono'

export type DateFormat = 'MM/YYYY' | 'MMMM YYYY' | 'YYYY' | 'YYYY MMM DD' | 'MMM YYYY'
export type PaperSize = 'a4' | 'letter'
export type ProficiencyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert'
export type ColumnLayout = 'one' | 'two' | 'mix'
export type ListStyle = 'bullet' | 'dash' | 'hyphen'
export type SubtitleStyle = 'normal' | 'bold' | 'italic'
export type SubtitlePlacement = 'same-line' | 'next-line'
export type SectionHeadingSize = 'S' | 'M' | 'L' | 'XL'
export type SectionHeadingCapitalization = 'capitalize' | 'uppercase' | 'none'
export type SectionHeadingIcon = 'none' | 'simple' | 'filled' | 'knockout'
export type SectionHeadingStyle = 'none' | 'underline' | 'overline' | 'top-bottom' | 'box' | 'background' | 'left-bar'
export type SectionHeadingIconStyle = 'lucide' | 'nerd'
export type HeaderAlignment = 'left' | 'center' | 'right'
export type HeaderArrangement = 'icon' | 'bullet' | 'verticalBar' | 'none'
export type NameSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ColorMode = 'basic' | 'multi' | 'image'
export type ThemeColorStyle = 'basic' | 'advanced' | 'border'
export type FontStyle = 'serif' | 'sans' | 'mono'
export type SkillDisplayOption = 'grid' | 'level' | 'compact' | 'bubble'
export type EntryLayout = 'date-location-right' | 'date-location-left' | 'date-content-location' | 'full-width'
export type ColumnWidthMode = 'auto' | 'manual'
export type EducationOrder = 'degree-school' | 'school-degree'
export type ExperienceOrder = 'title-employer' | 'employer-title'
export type PhotoSize = 'S' | 'M'
export type PhotoShape = 'circle' | 'rounded'
export type PhotoPosition = 'beside' | 'top' | 'bottom'
export type DetailsArrangement = 'column' | 'wrap' | 'grid'
export type DetailsPosition = 'beside' | 'below'
export type DetailsTextAlignment = 'left' | 'right' | 'center'
export type DetailsSpacing = 'compact' | 'comfortable'
export type ContactIconStyle =
  | 'none'
  | 'circle-filled'
  | 'rounded-filled'
  | 'square-filled'
  | 'circle-outline'
  | 'rounded-outline'
  | 'square-outline'

// ─── Section Item Types ───────────────────────────────────────────────────────

export interface HeaderData {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  photo?: string // base64
  // Personal details
  nationality?: string
  dateOfBirth?: string
  visa?: string
  passportOrId?: string
  availability?: string
  genderPronoun?: string
  disability?: string
  workMode?: string
  relocation?: string
  expectedSalary?: string
  secondPhone?: string
  drivingLicense?: string
  securityClearance?: string
  maritalStatus?: string
  militaryService?: string
  smoking?: string
  height?: string
  weight?: string
  // Social profiles
  twitter?: string
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  pinterest?: string
  medium?: string
  behance?: string
  dribbble?: string
  stackoverflow?: string
  gitlab?: string
  bitbucket?: string
  discord?: string
  reddit?: string
  bluesky?: string
  threads?: string
  mastodon?: string
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
  | HeaderData
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
  photoSize: PhotoSize
  photoShape: PhotoShape
  language: string          // e.g. 'en-GB'

  // Layout & Spacing
  columnLayout: ColumnLayout
  columnReverse: boolean
  lineHeight: number        // e.g. 1.5
  marginHorizontal: number  // mm, e.g. 20
  marginVertical: number    // mm, e.g. 10
  entrySpacing: number      // multiplier 0.8-1.4
  entryLayout: EntryLayout
  columnWidthMode: ColumnWidthMode
  columnWidth: number       // percentage for manual mode
  titleSize: 'S' | 'M' | 'L'
  subtitleStyle: SubtitleStyle
  subtitlePlacement: SubtitlePlacement
  indentBody: boolean
  listStyle: ListStyle

  // Design — colors
  colorMode: ColorMode
  themeColorStyle: ThemeColorStyle
  textColor: string
  backgroundColor: string
  headingColor: string
  dateColor: string
  subtitleColor: string

  // Design — accent application
  applyAccentName: boolean
  applyAccentJobTitle: boolean
  applyAccentHeadings: boolean
  applyAccentHeadingLine: boolean
  applyAccentHeaderIcons: boolean
  applyAccentDotsBarsBubbles: boolean
  applyAccentDates: boolean
  applyAccentEntrySubtitle: boolean
  applyAccentLinkIcons: boolean

  // Design — section headings
  sectionHeadingSize: SectionHeadingSize
  sectionHeadingCapitalization: SectionHeadingCapitalization
  sectionHeadingIcon: SectionHeadingIcon
  sectionHeadingStyle: SectionHeadingStyle
  sectionHeadingIconStyle: SectionHeadingIconStyle
  sectionHeadingIconSize: number // multiplier e.g. 1.0
  sectionHeadingLineThickness: number
  linkUnderline: boolean
  linkBlue: boolean

  // Header
  headerAlignment: HeaderAlignment
  headerArrangement: HeaderArrangement
  nameSize: NameSize
  nameBold: boolean
  photoPosition: PhotoPosition
  detailsArrangement: DetailsArrangement
  detailsPosition: DetailsPosition
  detailsTextAlignment: DetailsTextAlignment
  detailsSpacing: DetailsSpacing
  contactIcons: boolean
  contactIconStyle: ContactIconStyle

  // Footer
  footerPageNumbers: boolean
  footerEmail: boolean
  footerName: boolean

  // Per-section display
  skillDisplay: SkillDisplayOption
  skillColumns: 2 | 3 | 4
  educationOrder: EducationOrder
  experienceOrder: ExperienceOrder
  groupPromotions: boolean

  // Entry title styling
  titleBold: boolean

  // Section spacing (multiplier on top of entry spacing)
  sectionSpacing: number

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

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobContact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  linkedin: string
  notes: string
}

export interface JobEvent {
  id: string
  type: string
  date: string
  title: string
  description: string
}

export interface JobApplication {
  id: string
  company: string
  role: string
  status: string
  priority: string
  url: string
  source: string
  location: string
  workMode: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  resumeId: string | null
  coverLetter: string
  notes: string
  contacts: JobContact[]
  events: JobEvent[]
  appliedDate: string | null
  responseDate: string | null
  deadlineDate: string | null
  createdAt: number
  updatedAt: number
  archivedAt: number | null
}

export interface JobsVaultFile {
  version: number
  jobs: JobApplication[]
}
