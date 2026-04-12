'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { TEMPLATE_META, getTemplateSettings } from '@/components/web'
import type { TemplateId, ResumeSettings } from '@/lib/store/types'
import { Check } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TemplateVisual } from '../CustomizePrimitives'

interface TemplatesSectionProps {
  currentTemplate: TemplateId
  onSelect: (id: TemplateId, settings: Partial<ResumeSettings>) => void
}

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[]

export function TemplatesSection({ currentTemplate, onSelect }: TemplatesSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TEMPLATE_IDS.map((id) => {
        const meta = TEMPLATE_META[id]
        const active = currentTemplate === id
        return (
          <Tooltip key={id}>
            <TooltipTrigger
              onClick={() => {
                const settings = getTemplateSettings(id)
                onSelect(id, settings)
              }}
              className={cn(
                'group relative aspect-[3/4] rounded-xl border-2 overflow-hidden flex flex-col transition-all cursor-pointer text-left',
                active
                  ? 'border-primary shadow-lg ring-4 ring-primary/5 bg-primary/5'
                  : 'border-border/60 hover:border-primary/40 shadow-sm hover:shadow-md hover:-translate-y-0.5',
              )}
            >
              <div className="w-full h-full">
                {/* Visual Preview */}
                <div className="flex-1 min-h-0 relative">
                  <TemplateVisual id={id} />
                  {active && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200 z-20">
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className={cn(
                  "px-2.5 py-1.5 border-t border-border/50 transition-colors shrink-0",
                  active ? "bg-primary/5" : "bg-muted/30 group-hover:bg-muted/50"
                )}>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold tracking-tight uppercase truncate">
                      {meta.label}
                    </p>
                    {id === 'custom' && (
                      <span className="text-[7px] px-1 bg-primary/10 text-primary rounded font-bold shrink-0">MANUAL</span>
                    )}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="font-bold mb-1 text-xs">{meta.label}</p>
              <p className="text-[10px] leading-relaxed text-muted-foreground">{meta.description}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
