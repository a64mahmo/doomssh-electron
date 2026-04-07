'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronDown, 
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
  Settings
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSection } from '@/hooks/useResume'
import { cn } from '@/lib/utils'
import type { SectionType } from '@/lib/store/types'

// Static section component map
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

const SECTION_ICONS: Record<SectionType, any> = {
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

interface Props {
  sectionId: string
  type: SectionType
}

export function SectionItem({ sectionId, type }: Props) {
  const { section, update, toggle, remove } = useSection(sectionId)
  const [open, setOpen] = useState(type === 'header')
  const [editingTitle, setEditingTitle] = useState(false)

  const isRequired = type === 'header'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionId,
    disabled: isRequired,
  })

  if (!section) return null

  const SectionComponent = SECTION_COMPONENTS[type]
  const Icon = SECTION_ICONS[type]

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 0,
      }}
      className={cn(
        "group rounded-xl border transition-all duration-200 overflow-hidden mb-2 shadow-sm",
        isDragging ? "border-primary ring-4 ring-primary/10 shadow-xl" : "border-border bg-card hover:border-foreground/20"
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Drag handle */}
          {!isRequired && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-muted-foreground/30 hover:text-foreground transition-colors -ml-1"
            >
              <GripVertical size={16} />
            </div>
          )}

          {/* Icon & Title */}
          <div
            className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer select-none"
            onClick={() => !editingTitle && setOpen((v) => !v)}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              section.visible ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
            )}>
              <Icon size={16} />
            </div>

            {editingTitle ? (
              <Input
                value={section.title}
                onChange={(e) => update({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="h-7 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0"
              />
            ) : (
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    'text-sm font-bold truncate leading-none mb-0.5',
                    section.visible ? 'text-foreground' : 'text-muted-foreground',
                  )}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true) }}
                >
                  {section.title}
                </span>
                {!open && (
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">
                    {type}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!isRequired && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-muted"
                  onClick={(e) => { e.stopPropagation(); toggle(); }}
                >
                  {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); remove(); }}
                >
                  <Trash2 size={14} />
                </Button>
              </>
            )}
            <CollapsibleTrigger
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground transition-all duration-300",
                open ? "rotate-180 bg-muted" : "hover:bg-muted"
              )}
            >
              <ChevronDown size={16} />
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-5 border-t border-border/50 bg-muted/5">
            <div className="pt-5">
              <SectionComponent sectionId={sectionId} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
