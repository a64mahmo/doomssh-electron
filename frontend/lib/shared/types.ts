// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES — Common data structures used by Electron and Frontend
// ─────────────────────────────────────────────────────────────────────────────

// ─── Resume Unions ───────────────────────────────────────────────────────────

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
export type SkillDisplayOption = 'grid' | 'level' | 'compact' | 'bubble' | 'dots'
export type EntryLayout = 'date-location-right' | 'date-location-left' | 'date-content-location' | 'full-width'
export type ColumnWidthMode = 'auto' | 'manual'
export type EducationOrder = 'degree-school' | 'school-degree'
export type ExperienceOrder = 'title-employer' | 'employer-title'
export type PhotoSize = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type PhotoShape = 'circle' | 'rounded' | 'square'
export type PhotoPosition = 'beside' | 'top' | 'bottom'
export type PhotoAlignment = 'left' | 'center' | 'right'
export type PhotoVerticalAlign = 'top' | 'center' | 'bottom'
export type PhotoBorderStyle = 'none' | 'thin' | 'medium' | 'thick'
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

// ─── Resume Section Items ─────────────────────────────────────────────────────

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

export interface ResumeSection<T = AnySectionItems> {
  id: string
  type: SectionType
  title: string
  visible: boolean
  items: T
}

// ─── Resume Settings & Main ──────────────────────────────────────────────────

export interface ResumeSettings {
  // Basics
  accentColor: string
  fontFamily: FontOption
  fontSize: number
  paperSize: PaperSize
  dateFormat: DateFormat
  showSectionLabels: boolean
  photoEnabled: boolean
  photoSize: PhotoSize
  photoShape: PhotoShape
  language: string

  // Layout & Spacing
  columnLayout: ColumnLayout
  headerLayout?: 'top' | 'sidebar'
  sidebarTheme?: 'none' | 'accent' | 'custom'
  sidebarBackgroundColor?: string
  sidebarTextColor?: string
  columnReverse: boolean
  lineHeight: number
  marginHorizontal: number
  marginVertical: number
  entrySpacing: number
  entryLayout: EntryLayout
  columnWidthMode: ColumnWidthMode
  columnWidth: number
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
  sectionHeadingIconSize: number
  sectionHeadingLineThickness: number
  linkUnderline: boolean
  linkBlue: boolean

  // Header
  headerAlignment: HeaderAlignment
  headerArrangement: HeaderArrangement
  nameSize: NameSize
  nameBold: boolean
  photoPosition: PhotoPosition
  photoAlignment: PhotoAlignment
  photoVerticalAlign: PhotoVerticalAlign
  photoBorderStyle: PhotoBorderStyle
  photoBorderColor: string
  photoGap: number
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

  // Section spacing
  sectionSpacing: number

  // Section Column Mapping
  sectionColumns: Record<string, 'main' | 'sidebar'>

  // Cover Letter Specific Styles
  clDatePosition?: 'left' | 'right'
  clSignaturePosition?: 'left' | 'right'
  clShowSignatureLine?: boolean
  clShowDate?: boolean
  clShowRecipient?: boolean
  clShowLetterhead?: boolean
  clShowAutoSignOff?: boolean
  clParagraphSpacing?: number
  clBodyAlign?: 'left' | 'justify'
  clFirstLineIndent?: boolean
  clSignatureSize?: 'sm' | 'md' | 'lg'

  // Debug
  debugMode: boolean
}

export interface CoverLetterRecipient {
  hrName: string
  company: string
  address: string
}

export interface CoverLetterSignature {
  fullName: string
  place: string
  date: string
  image?: string // dataURL
}

export interface CoverLetterData {
  syncWithResume: boolean
  date: string
  recipient: CoverLetterRecipient
  body: string // markdown
  signature: CoverLetterSignature
  linkedJobId?: string | null
  linkedResumeId?: string | null
}

export interface Resume {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  kind?: 'resume' | 'coverLetter'
  template: TemplateId
  settings: ResumeSettings
  sections: ResumeSection[]
  coverLetter?: CoverLetterData
}

// ─── Jobs Unions ─────────────────────────────────────────────────────────────

export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'phone-screen'
  | 'technical'
  | 'onsite'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'ghosted'

export type JobSource =
  | 'linkedin'
  | 'indeed'
  | 'glassdoor'
  | 'company-website'
  | 'referral'
  | 'recruiter'
  | 'angellist'
  | 'hacker-news'
  | 'other'

export type JobPriority = 'low' | 'medium' | 'high'

export type WorkMode = 'remote' | 'hybrid' | 'onsite' | ''

export type JobEventType =
  | 'status-change'
  | 'note'
  | 'interview'
  | 'follow-up'
  | 'deadline-passed'
  | 'deadline-change'
  | 'other'

export type QuestionCategory = 'technical' | 'behavioral' | 'situational' | 'general'

// ─── Jobs Data Structures ─────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: string
  question: string
  category: QuestionCategory
  answer: string
}

export interface PostInterviewReflection {
  id: string
  date: string
  wentWell: string
  wasDifficult: string
  followUp: string
}

export interface InterviewPrep {
  questions: InterviewQuestion[]
  companyNotes: string
  cheatSheet: string[]
  reflections: PostInterviewReflection[]
}

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
  type: JobEventType
  date: string
  title: string
  description: string
}

export interface JobApplication {
  id: string
  company: string
  role: string
  status: JobStatus
  priority: JobPriority
  url: string
  source: JobSource
  location: string
  workMode: WorkMode
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  resumeId: string | null
  coverLetterId: string | null
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
  interviewPrep?: InterviewPrep
}

export interface JobsVaultFile {
  version: 1
  jobs: JobApplication[]
}

// ─── Misc ───────────────────────────────────────────────────────────────────

export interface UpdateInfo {
  version: string
}
