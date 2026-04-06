'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { GripVertical, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSection } from '@/hooks/useResume'
import { cn } from '@/lib/utils'
import type { SectionType } from '@/lib/store/types'

// Static section component map — avoids async loading and double-trigger issues
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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Drag handle — hidden for required sections */}
          {isRequired ? (
            <div className="w-[14px] shrink-0" />
          ) : (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Title — click to toggle, double-click to rename */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => !editingTitle && setOpen((v) => !v)}
          >
            {editingTitle ? (
              <Input
                value={section.title}
                onChange={(e) => update({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="h-6 text-xs font-medium"
              />
            ) : (
              <span
                className={cn(
                  'text-sm font-medium block truncate select-none',
                  section.visible ? 'text-foreground' : 'text-muted-foreground',
                )}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true) }}
              >
                {section.title}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Visibility toggle — hidden for required sections */}
            {!isRequired && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={toggle}
              >
                {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </Button>
            )}
            {/* Delete — hidden for required sections */}
            {!isRequired && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={remove}
              >
                <Trash2 size={13} />
              </Button>
            )}
            {/* Single CollapsibleTrigger — chevron only */}
            <CollapsibleTrigger
              render={<button className="h-6 w-6 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-accent transition-colors" />}
            >
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-3 pb-3 border-t border-border/50">
            <div className="pt-3">
              <SectionComponent sectionId={sectionId} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
