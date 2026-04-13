'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { TEMPLATE_META, getTemplateSettings } from '@/components/web'
import type { TemplateId, ResumeSettings } from '@/lib/store/types'
import { Check, LayoutGrid, AlignLeft, Columns } from 'lucide-react'
import { TemplateVisual } from '../CustomizePrimitives'

interface TemplatesSectionProps {
  currentTemplate: TemplateId
  onSelect: (id: TemplateId, settings: Partial<ResumeSettings>) => void
}

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[]

function TemplateCard({ id, meta, active, onSelect }: {
  id: TemplateId
  meta: typeof TEMPLATE_META[TemplateId]
  active: boolean
  onSelect: () => void
}) {
  const layoutIcon = id.includes('one') || id === 'minimal' ? AlignLeft
    : id === 'crisp' ? LayoutGrid : Columns

  const LayoutIcon = layoutIcon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        active
          ? 'border-primary shadow-md shadow-primary/10 bg-primary/5'
          : 'border-border/60 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 bg-background',
      )}
    >
      {active && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
          <Check size={11} strokeWidth={3.5} />
        </div>
      )}

      <div className="w-full aspect-[4/3] relative overflow-hidden bg-white border-b border-border/30">
        <TemplateVisual id={id} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      <div className="px-3 py-2 flex items-center justify-between bg-muted/10 group-hover:bg-muted/20 transition-colors">
        <span className={cn(
          'text-[11px] font-semibold transition-colors',
          active ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'
        )}>
          {meta.label}
        </span>
        <LayoutIcon size={11} className="text-muted-foreground/40" />
      </div>
    </div>
  )
}

export function TemplatesSection({ currentTemplate, onSelect }: TemplatesSectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Pick a base template to get started. Every setting is fully customizable.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {TEMPLATE_IDS.map((id) => {
          const meta = TEMPLATE_META[id]
          const active = currentTemplate === id
          return (
            <TemplateCard
              key={id}
              id={id}
              meta={meta}
              active={active}
              onSelect={() => {
                const settings = getTemplateSettings(id)
                onSelect(id, settings)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
