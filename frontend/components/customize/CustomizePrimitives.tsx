'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { getTemplateSettings } from '@/components/web'
import type { TemplateId, SectionHeadingStyle, SectionType, FontOption } from '@/lib/store/types'
import { GripVertical } from 'lucide-react'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const FONTS: FontOption[] = [
  'Inter', 'Lato', 'Roboto', 'Source Sans Pro', 'Raleway',
  'Merriweather', 'Playfair Display', 'IBM Plex Serif', 'IBM Plex Mono',
]

export const ACCENT_PRESETS = [
  '#18181b', '#1e3a5f', '#4f46e5', '#7c3aed',
  '#dc2626', '#d97706', '#059669', '#0891b2',
]

export const HEADING_STYLES: { id: SectionHeadingStyle; label: string }[] = [
  { id: 'none',       label: 'None'     },
  { id: 'underline',  label: 'Under'    },
  { id: 'overline',   label: 'Over'     },
  { id: 'top-bottom', label: 'Both'     },
  { id: 'left-bar',   label: 'Left bar' },
  { id: 'box',        label: 'Box'      },
  { id: 'background', label: 'Fill'     },
]

export function VisualSegmentGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
  showLabel = true,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; render: () => React.ReactNode; label: string }[]
  columns?: number
  showLabel?: boolean
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4")}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="group flex flex-col items-center gap-1.5 cursor-pointer outline-none"
          >
            <div className={cn(
              "w-full h-12 flex items-center justify-center rounded-xl border transition-all duration-200 relative overflow-hidden",
              active 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_1px_inset_rgba(var(--primary),0.1)]" 
                : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:border-border hover:bg-muted/40"
            )}>
              {active && (
                <div className="absolute inset-0 bg-primary/5 animate-in fade-in duration-500" />
              )}
              <div className="relative z-10 w-full flex items-center justify-center">
                {o.render()}
              </div>
            </div>
            {showLabel && (
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
              )}>
                {o.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SortableSectionItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-sm transition-all',
        isDragging ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border hover:border-foreground/20',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0"
      >
        <GripVertical size={14} />
      </div>
      <span className="text-xs font-medium truncate select-none">{title}</span>
    </div>
  )
}

export function DroppableColumn({ id, title, items, resumeSections }: {
  id: string; title: string; items: string[]; resumeSections: { id: string; title: string }[]
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="min-h-[140px] p-2 rounded-xl bg-muted/30 border border-dashed border-border/60 space-y-1">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((sectionId) => {
            const sec = resumeSections.find(s => s.id === sectionId)
            return <SortableSectionItem key={sectionId} id={sectionId} title={sec?.title || 'Unknown'} />
          })}
        </SortableContext>
      </div>
    </div>
  )
}

export function TemplateVisual({ id }: { id: TemplateId }) {
  const settings = getTemplateSettings(id)
  const layout = settings.columnLayout || 'one'
  const isSidebar = layout === 'two' || layout === 'mix'
  const isReverse = settings.columnReverse
  const headerAlign = settings.headerAlignment || 'left'
  const accent = settings.accentColor || '#3b82f6'

  return (
    <div className="flex-1 bg-white p-4 flex flex-col gap-4 overflow-hidden select-none transition-colors">
      <div className={cn(
        "flex flex-col gap-2 pb-3 border-b border-gray-200",
        headerAlign === 'center' && "items-center text-center",
        headerAlign === 'right' && "items-end text-right"
      )}>
        <div className="h-2.5 w-2/3 rounded-full" style={{ backgroundColor: accent }} />
        <div className={cn("flex gap-1.5 w-full",
          headerAlign === 'center' ? "justify-center" :
          headerAlign === 'right' ? "justify-end" : "justify-start"
        )}>
          <div className="h-1 w-3 bg-gray-300 rounded-full" />
          <div className="h-1 w-5 bg-gray-300 rounded-full" />
          <div className="h-1 w-3 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div className={cn("flex-1 flex gap-4", isReverse && "flex-row-reverse")}>
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-2">
            <div className="h-1.5 w-1/3 bg-gray-400 rounded-full" />
            <div className="space-y-1">
              <div className="h-0.5 w-full bg-gray-200 rounded-full" />
              <div className="h-0.5 w-full bg-gray-200 rounded-full" />
              <div className="h-0.5 w-4/5 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-1/2 bg-gray-400 rounded-full" />
            <div className="space-y-1">
              <div className="h-0.5 w-full bg-gray-200 rounded-full" />
              <div className="h-0.5 w-5/6 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>

        {isSidebar && (
          <div className={cn(
            "w-1/3 flex flex-col gap-4 border-gray-200",
            isReverse ? "border-r pr-3" : "border-l pl-3"
          )}>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-gray-300 rounded-full" />
              <div className="h-0.5 w-full bg-gray-200 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function HeadingStyleButton({ style, active, onClick, accentColor }: {
  style: { id: SectionHeadingStyle; label: string }
  active: boolean
  onClick: () => void
  accentColor: string
}) {
  const lineStyle = { backgroundColor: `${accentColor}80`, borderRadius: '999px' }
  const preview: Record<SectionHeadingStyle, React.ReactNode> = {
    none: (
      <div className="w-full h-[2px]" style={{ ...lineStyle, opacity: 0 }} />
    ),
    underline: (
      <div className="w-full border-b-[1.5px] border-foreground/20 pb-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    overline: (
      <div className="w-full border-t-[1.5px] border-foreground/20 pt-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    'top-bottom': (
      <div className="w-full border-t-[1.5px] border-b-[1.5px] border-foreground/20 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    'left-bar': (
      <div className="w-full flex items-center gap-1 pl-1 border-l-[2.5px] border-foreground/30">
        <div className="h-[1.5px] flex-1" style={lineStyle} />
      </div>
    ),
    box: (
      <div className="w-full border-[1.5px] border-foreground/20 rounded px-1 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    background: (
      <div className="w-full bg-foreground/5 rounded px-1 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={style.label}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all',
        active
          ? 'border-foreground bg-foreground/5 ring-1 ring-foreground/20'
          : 'border-border hover:border-foreground/30 hover:bg-muted/50',
      )}
    >
      <div className="w-full h-4 flex items-center">{preview[style.id]}</div>
      <span className={cn('text-[9px] font-semibold uppercase tracking-wide', active ? 'text-foreground' : 'text-muted-foreground/60')}>
        {style.label}
      </span>
    </button>
  )
}
