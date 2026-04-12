'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import type { ResumeSettings } from '@/lib/store/types'
import { Separator } from '@/components/ui/separator'
import {
  ControlGroup,
  SliderRow,
} from '@/components/editor/EditorPrimitives'
import { FONTS } from '../CustomizePrimitives'

interface TypographySectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

export function TypographySection({ s, upd }: TypographySectionProps) {
  return (
    <>
      <ControlGroup title="Font Family">
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => upd({ fontFamily: f })}
              className={cn(
                'px-2.5 py-2 rounded-lg border text-[11px] text-left transition-all truncate',
                s.fontFamily === f
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/40',
              )}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Sizes">
        <SliderRow
          label="Base Font Size" value={s.fontSize} display={`${s.fontSize}pt`}
          min={8} max={13} step={0.5} onChange={(v) => upd({ fontSize: v })}
        />
        <SliderRow
          label="Line Height" value={s.lineHeight} display={`${s.lineHeight.toFixed(2)}`}
          min={1.0} max={2.2} step={0.05} onChange={(v) => upd({ lineHeight: v })}
        />
      </ControlGroup>
    </>
  )
}
