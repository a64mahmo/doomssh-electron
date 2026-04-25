// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Store-specific types for the resume builder
// Core data types are imported from @/lib/shared/types
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Resume,
  ResumeSection,
  ResumeSettings,
  AnySectionItems,
  SectionType,
  CoverLetterData,
  HeaderData
} from '@/lib/shared/types'

export * from '@/lib/shared/types'

// ─── Store Shape ──────────────────────────────────────────────────────────────

export interface ResumeStore {
  resume: Resume | null
  isDirty: boolean
  setResume: (resume: Resume | null, isLoaded?: boolean) => void
  updateResumeName: (name: string) => void
  updateSettings: (settings: Partial<ResumeSettings>) => void
  updateSection: (sectionId: string, updates: Partial<ResumeSection>) => void
  updateSectionItems: (sectionId: string, items: AnySectionItems) => void
  reorderSections: (activeId: string, overId: string) => void
  addSection: (type: SectionType) => void
  removeSection: (sectionId: string) => void
  toggleSectionVisibility: (sectionId: string) => void
  updateCoverLetter: (updates: Partial<CoverLetterData>) => void
  markSaved: () => void
}

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'

export interface UIStore {
  activeSection: string | null
  showAIPanel: boolean
  previewZoom: number
  isExporting: boolean
  selectedText: string
  errors: string[]
  globalDebugMode: boolean
  updateStatus: UpdateStatus
  updateProgress: number
  updateVersion: string | null
  updateError: string | null
  setActiveSection: (id: string | null) => void
  setShowAIPanel: (show: boolean) => void
  setPreviewZoom: (zoom: number) => void
  setIsExporting: (exporting: boolean) => void
  setSelectedText: (text: string) => void
  addError: (error: string) => void
  clearErrors: () => void
  setGlobalDebugMode: (enabled: boolean) => void
  setUpdateStatus: (status: UpdateStatus) => void
  setUpdateProgress: (progress: number) => void
  setUpdateVersion: (version: string | null) => void
  setUpdateError: (error: string | null) => void
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
  photoSize: 'M',
  photoShape: 'circle',
  language: 'en-GB',

  // Layout & Spacing
  columnLayout: 'one',
  columnReverse: false,
  lineHeight: 1.5,
  marginHorizontal: 20,
  marginVertical: 10,
  entrySpacing: 1,
  entryLayout: 'date-location-right',
  columnWidthMode: 'auto',
  columnWidth: 30,
  titleSize: 'M',
  subtitleStyle: 'normal',
  subtitlePlacement: 'next-line',
  indentBody: false,
  listStyle: 'bullet',

  // Design — colors
  colorMode: 'basic',
  themeColorStyle: 'basic',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  headingColor: '#1a2744',
  dateColor: '#4a5568',
  subtitleColor: '#4a5568',

  // Design — accent application
  applyAccentName: true,
  applyAccentJobTitle: true,
  applyAccentHeadings: true,
  applyAccentHeadingLine: true,
  applyAccentHeaderIcons: false,
  applyAccentDotsBarsBubbles: false,
  applyAccentDates: false,
  applyAccentEntrySubtitle: false,
  applyAccentLinkIcons: false,

  // Design — section headings
  sectionHeadingSize: 'M',
  sectionHeadingCapitalization: 'uppercase',
  sectionHeadingIcon: 'none',
  sectionHeadingStyle: 'underline',
  sectionHeadingIconStyle: 'lucide',
  sectionHeadingIconSize: 1.0,
  sectionHeadingLineThickness: 1.5,
  linkUnderline: false,
  linkBlue: false,

  // Header
  headerAlignment: 'center',
  headerArrangement: 'verticalBar',
  nameSize: 'L',
  nameBold: true,
  photoPosition: 'beside',
  photoAlignment: 'center',
  photoVerticalAlign: 'center',
  photoBorderStyle: 'thin',
  photoBorderColor: '#e5e7eb',
  photoGap: 16,
  detailsArrangement: 'wrap',
  detailsPosition: 'below',
  detailsTextAlignment: 'center',
  detailsSpacing: 'comfortable',
  contactIcons: false,
  contactIconStyle: 'none',

  // Footer
  footerPageNumbers: false,
  footerEmail: false,
  footerName: false,

  // Per-section display
  skillDisplay: 'compact',
  skillColumns: 3,
  educationOrder: 'degree-school',
  experienceOrder: 'title-employer',
  groupPromotions: false,

  // Entry title styling
  titleBold: true,

  // Section spacing
  sectionSpacing: 1.0,

  sectionColumns: {},

  // Cover Letter Specific Styles
  clDatePosition: 'left',
  clSignaturePosition: 'left',
  clShowSignatureLine: true,
  clShowDate: true,
  clShowRecipient: true,
  clShowLetterhead: true,
  clShowAutoSignOff: true,
  clParagraphSpacing: 1.0,
  clBodyAlign: 'left',
  clFirstLineIndent: false,

  // Debug
  debugMode: false,
}

export const DEFAULT_HEADER: HeaderData = {
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
