'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import type { ResumeSettings, ThemeColorStyle, ColorMode } from '@/lib/store/types'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  ControlGroup,
  ToggleRow,
} from '@/components/editor/EditorPrimitives'
import { Check, RotateCcw, Type as TypeIcon, Image as ImageIcon } from 'lucide-react'
import { ACCENT_PRESETS, VisualSegmentGroup } from '../CustomizePrimitives'
import { isLight, textColorsForBg } from '@/lib/pdf/styleUtils'

interface ColorsSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

export function ColorsSection({ s, upd }: ColorsSectionProps) {
  return (
    <>
      {/* -- Accent Color ----------------------------------------- */}
      <ControlGroup title="Accent Color">
        <div className="grid grid-cols-8 gap-2 overflow-hidden">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => upd({ accentColor: color })}
              title={color}
              className={cn(
                'aspect-square rounded-full transition-all hover:scale-110',
                s.accentColor === color
                  ? 'ring-2 ring-offset-2 ring-primary scale-105'
                  : 'ring-1 ring-border/50',
              )}
              style={{ backgroundColor: color }}
            >
              {s.accentColor === color && (
                <Check size={10} className={cn("mx-auto", isLight(color) ? "text-black" : "text-white")} strokeWidth={3} />
              )}
            </button>
          ))}
          <button
            type="button"
            className="aspect-square rounded-full border border-border bg-gradient-to-br from-violet-500 via-blue-500 to-red-500 transition-all hover:scale-110 relative overflow-hidden"
            title="Custom Color"
          >
            <input
              type="color"
              value={s.accentColor}
              onChange={(e) => upd({ accentColor: e.target.value })}
              className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer opacity-0"
            />
          </button>
        </div>

        <div className="flex gap-2 items-center mt-2">
          <div className="relative shrink-0 w-8 h-8 rounded-lg border border-border overflow-hidden">
            <input
              type="color"
              value={s.accentColor}
              onChange={(e) => upd({ accentColor: e.target.value })}
              className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
            />
          </div>
          <Input
            value={s.accentColor}
            onChange={(e) => upd({ accentColor: e.target.value })}
            className="h-8 text-xs font-mono uppercase flex-1"
            placeholder="#1a2744"
            maxLength={7}
          />
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      {/* -- Accent Targets --------------------------------------- */}
      <ControlGroup title="Accent Targets">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <ToggleRow id="acc-name" label="Name" checked={s.applyAccentName} onCheckedChange={(v) => upd({ applyAccentName: v })} />
          <ToggleRow id="acc-job"  label="Job title" checked={s.applyAccentJobTitle} onCheckedChange={(v) => upd({ applyAccentJobTitle: v })} />
          <ToggleRow id="acc-head" label="Headings" checked={s.applyAccentHeadings} onCheckedChange={(v) => upd({ applyAccentHeadings: v })} />
          <ToggleRow id="acc-line" label="Heading line" checked={s.applyAccentHeadingLine} onCheckedChange={(v) => upd({ applyAccentHeadingLine: v })} />
          <ToggleRow id="acc-icon" label="Header icons" checked={s.applyAccentHeaderIcons} onCheckedChange={(v) => upd({ applyAccentHeaderIcons: v })} />
          <ToggleRow id="acc-dots" label="Dots / bars" checked={s.applyAccentDotsBarsBubbles} onCheckedChange={(v) => upd({ applyAccentDotsBarsBubbles: v })} />
          <ToggleRow id="acc-date" label="Dates" checked={s.applyAccentDates} onCheckedChange={(v) => upd({ applyAccentDates: v })} />
          <ToggleRow id="acc-sub"  label="Subtitle" checked={s.applyAccentEntrySubtitle} onCheckedChange={(v) => upd({ applyAccentEntrySubtitle: v })} />
          <ToggleRow id="acc-link" label="Link icons" checked={s.applyAccentLinkIcons} onCheckedChange={(v) => upd({ applyAccentLinkIcons: v })} />
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      {/* -- Theme & Layout Style --------------------------------- */}
      <ControlGroup title="Theme Style">
        <VisualSegmentGroup
          columns={3}
          value={s.themeColorStyle}
          onChange={(v) => upd({ themeColorStyle: v as ThemeColorStyle })}
          options={[
            {
              value: 'basic',
              label: 'Clean',
              render: () => (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-7 rounded border border-border bg-background" />
                </div>
              )
            },
            {
              value: 'advanced',
              label: 'Banner',
              render: () => (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-7 rounded border border-border bg-background overflow-hidden flex flex-col">
                    <div className="h-2.5 shrink-0" style={{ backgroundColor: s.accentColor }} />
                    <div className="flex-1" />
                  </div>
                </div>
              )
            },
            {
              value: 'border',
              label: 'Border',
              render: () => (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-7 rounded bg-background" style={{ border: `3px solid ${s.accentColor}` }} />
                </div>
              )
            },
          ]}
        />
      </ControlGroup>

      {s.colorMode !== 'basic' && (
        <>
          <Separator className="opacity-30" />

          <ControlGroup title="Color Mode">
            <VisualSegmentGroup
              columns={3}
              value={s.colorMode}
              onChange={(v) => upd({ colorMode: v as ColorMode })}
              options={[
                {
                  value: 'basic',
                  label: 'Accent',
                  render: () => (
                    <div className="w-12 h-6 bg-primary rounded-md flex items-center justify-center shadow-sm">
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )
                },
                {
                  value: 'multi',
                  label: 'Multi',
                  render: () => (
                    <div className="w-12 h-6 flex rounded-md overflow-hidden border border-border shadow-sm">
                      <div className="w-1/2 h-full bg-background flex items-center justify-center">
                        <TypeIcon size={10} className="text-foreground" />
                      </div>
                      <div className="w-1/2 h-full bg-primary" />
                    </div>
                  )
                },
                {
                  value: 'image',
                  label: 'Image',
                  render: () => (
                    <div className="w-12 h-6 rounded-md overflow-hidden border border-border shadow-sm relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                      <ImageIcon size={10} className="absolute inset-0 m-auto text-white" />
                    </div>
                  )
                },
              ]}
            />
          </ControlGroup>
        </>
      )}

      <Separator className="opacity-30" />

      {/* -- Background ------------------------------------------- */}
      <ControlGroup title="Background">
        <div className="flex items-center gap-2 overflow-hidden -mx-1">
          {[
            { bg: '#ffffff', label: 'White'  },
            { bg: '#fdfbf7', label: 'Cream'  },
            { bg: '#f8f9fa', label: 'Snow'   },
            { bg: '#1a1a2e', label: 'Dark'   },
            { bg: '#0f172a', label: 'Slate'  },
            { bg: '#1c1917', label: 'Stone'  },
          ].map(({ bg, label }) => (
            <button
              key={bg}
              type="button"
              title={label}
              onClick={() => upd({ backgroundColor: bg, ...textColorsForBg(bg) })}
              className={cn(
                'size-7 rounded-full transition-all hover:scale-110 shrink-0',
                s.backgroundColor === bg
                  ? 'ring-2 ring-offset-2 ring-primary scale-105'
                  : 'ring-1 ring-border/50',
              )}
              style={{ backgroundColor: bg }}
            />
          ))}
          <div className="relative size-7 rounded-full border border-border overflow-hidden shrink-0">
            <input
              type="color"
              value={s.backgroundColor}
              onChange={(e) => {
                const v = e.target.value
                const wasLight = isLight(s.backgroundColor)
                const nowLight = isLight(v)
                if (wasLight !== nowLight) {
                  upd({ backgroundColor: v, ...textColorsForBg(v) })
                } else {
                  upd({ backgroundColor: v })
                }
              }}
              className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
            />
          </div>
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      {/* -- Text Colors ------------------------------------------ */}
      <ControlGroup
        title="Text Colors"
        rightElement={
          <button
            onClick={() => upd({
              ...textColorsForBg(s.backgroundColor),
              headingColor: s.accentColor,
            })}
            className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <RotateCcw size={10} />
            RESET
          </button>
        }
      >
        <div className="space-y-2">
          {[
            { label: 'Body',      key: 'textColor',     val: s.textColor     },
            ...(s.colorMode !== 'basic' ? [{ label: 'Headings', key: 'headingColor', val: s.headingColor }] : []),
            { label: 'Subtitles', key: 'subtitleColor', val: s.subtitleColor },
            { label: 'Dates',     key: 'dateColor',     val: s.dateColor     },
          ].map(({ label, key, val }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase">{val}</span>
                <div className="relative size-6 rounded-md border border-border overflow-hidden">
                  <input
                    type="color"
                    value={val}
                    onChange={(e) => upd({ [key]: e.target.value } as never)}
                    className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ControlGroup>

      {s.colorMode === 'basic' && (
        <>
          <Separator className="opacity-30" />
          <div className="flex items-center justify-center">
            <button
              onClick={() => upd({ colorMode: 'multi' })}
              className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors font-medium"
            >
              Switch to Multi-color mode for full control →
            </button>
          </div>
        </>
      )}
    </>
  )
}
