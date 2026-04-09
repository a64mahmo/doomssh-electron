'use client'
import { useState } from 'react'
import { useResume } from '@/hooks/useResume'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

  if (!resume) return null

  const sections = resume.sections
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0]

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Icon Nav ──────────────────────────────────────────────── */}
      <nav className="w-12 border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 bg-muted/5 overflow-y-auto no-scrollbar">
        {/* Special 'List' nav to see all sections & reorder */}
        <Tooltip>
          <TooltipTrigger
            type="button"
            onClick={() => setActiveSectionId('list')}
            className={cn(
              'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all mb-2',
              activeSectionId === 'list'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <LayoutList size={16} strokeWidth={activeSectionId === 'list' ? 2.5 : 1.8} />
          </TooltipTrigger>
          <TooltipContent side="right">
            Manage Sections
          </TooltipContent>
        </Tooltip>

        <div className="w-6 h-px bg-border/50 mb-2" />

        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.type] || Settings
          const active = activeSectionId === section.id
          if (!Icon) return null
          
          return (
            <Tooltip key={section.id}>
              <TooltipTrigger
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  !section.visible && !active && 'opacity-40'
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              </TooltipTrigger>
              <TooltipContent side="right">
                {section.title}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="px-4 h-10 border-b border-border flex items-center justify-between shrink-0 bg-background/60 backdrop-blur-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 truncate mr-2">
            {activeSectionId === 'list' ? 'Manage Sections' : activeSection?.title}
          </h3>
          {activeSectionId !== 'list' && activeSection && (
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest border border-border/50 px-1.5 py-0.5 rounded">
              {activeSection.type}
            </span>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
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
