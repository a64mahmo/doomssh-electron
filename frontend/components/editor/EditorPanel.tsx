'use client'
import { useRef, useState } from 'react'
import { useResume } from '@/hooks/useResume'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RailNav, RailItem, RailDivider, RailTooltipBody } from '@/components/ui/rail-nav'
import { SECTION_DESCRIPTIONS } from '@/lib/store/types'
import { SearchButton } from '@/components/settings-search/SettingsPalette'
import { useRevealSetting } from '@/components/settings-search/useRevealSetting'
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderCode,
  Award,
  Languages,
  Trophy,
  Heart,
  BookOpen,
  Users,
  Settings,
  LayoutList,
  type LucideIcon
} from 'lucide-react'
import type { SectionType } from '@/lib/store/types'
import { SectionList } from './SectionList'

// Section component map
import { HeaderSection }        from './sections/HeaderSection'
import { SummarySection }       from './sections/SummarySection'
import { ExperienceSection }    from './sections/ExperienceSection'
import { EducationSection }     from './sections/EducationSection'
import { SkillsSection }        from './sections/SkillsSection'
import { ProjectsSection }      from './sections/ProjectsSection'
import { CertificationsSection } from './sections/CertificationsSection'
import { LanguagesSection }     from './sections/LanguagesSection'
import { AwardsSection }        from './sections/AwardsSection'
import { VolunteeringSection }  from './sections/VolunteeringSection'
import { PublicationsSection }  from './sections/PublicationsSection'
import { ReferencesSection }    from './sections/ReferencesSection'
import { CustomSection }        from './sections/CustomSection'

const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  header:         User,
  summary:        FileText,
  experience:     Briefcase,
  education:      GraduationCap,
  skills:         Wrench,
  projects:       FolderCode,
  certifications: Award,
  languages:      Languages,
  awards:         Trophy,
  volunteering:   Heart,
  publications:   BookOpen,
  references:     Users,
  custom:         Settings,
}

const SECTION_COMPONENTS: Record<SectionType, React.ComponentType<{ sectionId: string }>> = {
  header:         HeaderSection,
  summary:        SummarySection,
  experience:     ExperienceSection,
  education:      EducationSection,
  skills:         SkillsSection,
  projects:       ProjectsSection,
  certifications: CertificationsSection,
  languages:      LanguagesSection,
  awards:         AwardsSection,
  volunteering:   VolunteeringSection,
  publications:   PublicationsSection,
  references:     ReferencesSection,
  custom:         CustomSection,
}

export function EditorPanel() {
  const { resume } = useResume()
  const [activeSectionId, setActiveSectionId] = useState<string>('header')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Builder search: open the section, then highlight and focus the field.
  useRevealSetting(
    scrollRef,
    (entry) => entry.tab === 'content' && !!entry.contentSection,
    (entry) => setActiveSectionId(entry.contentSection!),
  )

  if (!resume) return null

  const sections = resume.sections
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0]

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Icon Nav ──────────────────────────────────────────────── */}
      <RailNav label="Resume sections">
        {/* Special 'List' nav to see all sections & reorder */}
        <RailItem
          icon={LayoutList}
          label="Manage Sections"
          tooltip={<RailTooltipBody label="Manage Sections" description="Reorder, add, hide or remove sections" />}
          active={activeSectionId === 'list'}
          onClick={() => setActiveSectionId('list')}
        />

        <RailDivider />

        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.type] || Settings
          if (!Icon) return null
          return (
            <RailItem
              key={section.id}
              icon={Icon}
              label={section.title}
              tooltip={
                <RailTooltipBody
                  label={section.title}
                  description={SECTION_DESCRIPTIONS[section.type]}
                  note={section.visible === false ? 'Hidden on your resume' : undefined}
                />
              }
              active={activeSectionId === section.id}
              muted={!section.visible}
              onClick={() => setActiveSectionId(section.id)}
            />
          )
        })}
      </RailNav>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="px-4 h-10 border-b border-border flex items-center shrink-0 bg-background/60 backdrop-blur-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 truncate">
            {activeSectionId === 'list' ? 'Manage Sections' : activeSection?.title}
          </h3>
          <SearchButton className="ml-auto" />
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="px-4 py-5 space-y-6 pb-24"
            >
              {activeSectionId === 'list' ? (
                <SectionList />
              ) : (
                activeSection && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(() => {
                      const Component = SECTION_COMPONENTS[activeSection.type]
                      return Component ? <Component sectionId={activeSection.id} /> : null
                    })()}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
