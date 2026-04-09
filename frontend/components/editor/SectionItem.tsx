'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
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
  Pencil,
  type LucideIcon
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSection } from '@/hooks/useResume'
import { cn } from '@/lib/utils'
import type { SectionType } from '@/lib/store/types'

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

interface Props {
  sectionId: string
  type: SectionType
}

export function SectionItem({ sectionId, type }: Props) {
  const { section, update, toggle, remove } = useSection(sectionId)
  const [editingTitle, setEditingTitle] = useState(false)

  const isRequired = type === 'header'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionId,
    disabled: isRequired,
  })

  if (!section) return null
  const Icon = SECTION_ICONS[type] || Settings

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
        "group flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200 shadow-sm",
        isDragging 
          ? "border-primary ring-4 ring-primary/10 shadow-xl bg-background" 
          : "border-border/60 bg-card hover:border-foreground/20 hover:shadow-md",
        !section.visible && "opacity-60"
      )}
    >
      {/* Drag handle */}
      {!isRequired && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/20 hover:text-foreground/40 transition-colors shrink-0"
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-inner",
        section.visible ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
      )}>
        <Icon size={16} />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <Input
            value={section.title}
            onChange={(e) => update({ title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            autoFocus
            className="h-8 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0"
          />
        ) : (
          <div className="flex flex-col min-w-0">
            <span
              className={cn(
                'text-[13px] font-bold truncate leading-tight mb-0.5',
                section.visible ? 'text-foreground' : 'text-muted-foreground',
              )}
              onDoubleClick={() => setEditingTitle(true)}
            >
              {section.title}
            </span>
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em] font-bold">
              {type}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isRequired && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/50 hover:bg-foreground/5 hover:text-foreground rounded-lg transition-all"
              onClick={() => setEditingTitle(true)}
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/50 hover:bg-foreground/5 hover:text-foreground rounded-lg transition-all"
              onClick={toggle}
            >
              {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
              onClick={remove}
            >
              <Trash2 size={14} />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
