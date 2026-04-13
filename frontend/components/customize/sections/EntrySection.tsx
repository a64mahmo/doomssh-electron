'use client'
import React from 'react'
import type { ResumeSettings, EntryLayout, ColumnWidthMode, SubtitleStyle, SubtitlePlacement, ListStyle } from '@/lib/store/types'
import { Separator } from '@/components/ui/separator'
import {
  ControlGroup,
  FieldLabel,
  SliderRow,
  SegmentGroup,
  ToggleRow,
} from '@/components/editor/EditorPrimitives'
import { VisualSegmentGroup } from '../CustomizePrimitives'

interface EntrySectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

export function EntrySection({ s, upd }: EntrySectionProps) {
  return (
    <>
      <ControlGroup title="Entry Layout">
        <div>
          <VisualSegmentGroup
            columns={2}
            showLabel={true}
            value={s.entryLayout}
            onChange={(v) => upd({ entryLayout: v as EntryLayout })}
            options={[
              {
                value: 'date-location-right',
                label: 'Standard',
                render: () => (
                  <div className="flex w-full items-center justify-between px-3 gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="h-1 w-full bg-current rounded-full" />
                      <div className="h-1 w-2/3 bg-current opacity-30 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="h-1 w-8 bg-current opacity-50 rounded-full" />
                      <div className="h-1 w-6 bg-current opacity-20 rounded-full" />
                    </div>
                  </div>
                )
              },
              {
                value: 'date-location-left',
                label: 'Left Date',
                render: () => (
                  <div className="flex w-full items-center justify-between px-3 gap-2 flex-row-reverse">
                    <div className="flex flex-col gap-1 flex-1 items-end">
                      <div className="h-1 w-full bg-current rounded-full" />
                      <div className="h-1 w-2/3 bg-current opacity-30 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <div className="h-1 w-8 bg-current opacity-50 rounded-full" />
                      <div className="h-1 w-6 bg-current opacity-20 rounded-full" />
                    </div>
                  </div>
                )
              },
              {
                value: 'date-content-location',
                label: 'Inline',
                render: () => (
                  <div className="flex flex-col gap-1.5 w-full px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1/2 bg-current rounded-full" />
                      <div className="h-1 w-4 bg-current opacity-40 rounded-full" />
                      <div className="h-1 w-6 bg-current opacity-20 rounded-full" />
                    </div>
                    <div className="h-1 w-1/3 bg-current opacity-30 rounded-full" />
                  </div>
                )
              },
              {
                value: 'full-width',
                label: 'Stacked',
                render: () => (
                  <div className="flex flex-col gap-1 w-full px-3">
                    <div className="h-1 w-full bg-current rounded-full" />
                    <div className="h-1 w-2/3 bg-current opacity-30 rounded-full" />
                    <div className="flex gap-2 mt-0.5">
                      <div className="h-1 w-6 bg-current opacity-40 rounded-full" />
                      <div className="h-1 w-6 bg-current opacity-20 rounded-full" />
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <FieldLabel>Column Width</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <VisualSegmentGroup
                columns={2}
                showLabel={true}
                value={s.columnWidthMode}
                onChange={(v) => upd({ columnWidthMode: v as ColumnWidthMode })}
                options={[
                  { value: 'auto',   label: 'Auto',   render: () => (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-0.5 opacity-40">
                        <div className="w-1.5 h-1 bg-current rounded-full" />
                        <div className="w-3 h-1 bg-current rounded-full" />
                        <div className="w-1.5 h-1 bg-current rounded-full" />
                      </div>
                      <span className="text-[9px] font-bold">Auto</span>
                    </div>
                  )},
                  { value: 'manual', label: 'Manual', render: () => (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-0.5 items-center">
                        <div className="w-1 h-1 bg-current opacity-40 rounded-full" />
                        <div className="w-4 h-1 bg-current rounded-full" />
                        <div className="w-1 h-1 bg-current opacity-40 rounded-full" />
                      </div>
                      <span className="text-[9px] font-bold">Manual</span>
                    </div>
                  )},
                ]}
              />
            </div>
          </div>

          {s.columnWidthMode === 'manual' && (
            <SliderRow
              label="Width" value={s.columnWidth} unit="%"
              min={10} max={60} step={1} onChange={(v) => upd({ columnWidth: v })}
            />
          )}
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Typography & Style">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Title Size</FieldLabel>
            <VisualSegmentGroup
              columns={3}
              value={s.titleSize}
              onChange={(v) => upd({ titleSize: v as 'S' | 'M' | 'L' })}
              options={[
                { value: 'S', label: 'Small',  render: () => <div className="flex flex-col items-center gap-0.5"><div className="h-1.5 w-3 bg-current rounded-sm" /><span className="text-[9px] font-bold">S</span></div> },
                { value: 'M', label: 'Medium', render: () => <div className="flex flex-col items-center gap-0.5"><div className="h-2 w-4 bg-current rounded-sm" /><span className="text-[9px] font-bold">M</span></div> },
                { value: 'L', label: 'Large',  render: () => <div className="flex flex-col items-center gap-0.5"><div className="h-2.5 w-5 bg-current rounded-sm" /><span className="text-[9px] font-bold">L</span></div> },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Subtitle Style</FieldLabel>
            <VisualSegmentGroup
              columns={3}
              value={s.subtitleStyle}
              onChange={(v) => upd({ subtitleStyle: v as SubtitleStyle })}
              options={[
                { value: 'normal', label: 'Normal', render: () => <span className="text-xs font-medium">Ab</span> },
                { value: 'bold',   label: 'Bold',   render: () => <span className="text-xs font-black">Ab</span> },
                { value: 'italic', label: 'Italic', render: () => <span className="text-xs italic font-serif">Ab</span> },
              ]}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Subtitle Placement</FieldLabel>
          <SegmentGroup
            value={s.subtitlePlacement}
            onChange={(v) => upd({ subtitlePlacement: v as SubtitlePlacement })}
            options={[
              { value: 'next-line', label: 'Next line', render: () => <span className="text-[10px] leading-none">Next line</span> },
              { value: 'same-line', label: 'Same line', render: () => <span className="text-[10px] leading-none">Same line</span> },
            ]}
          />
        </div>

        <div>
          <FieldLabel>List Style</FieldLabel>
          <VisualSegmentGroup
            columns={2}
            value={s.listStyle}
            onChange={(v) => upd({ listStyle: v as ListStyle })}
            options={[
              { 
                value: 'bullet', 
                label: 'Bullet', 
                render: () => (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <div className="flex flex-col gap-1 w-8">
                      <div className="h-0.5 w-full bg-current opacity-40 rounded-full" />
                      <div className="h-0.5 w-2/3 bg-current opacity-20 rounded-full" />
                    </div>
                  </div>
                ) 
              },
              { 
                value: 'hyphen', 
                label: 'Hyphen', 
                render: () => (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 bg-current rounded-full" />
                    <div className="flex flex-col gap-1 w-8">
                      <div className="h-0.5 w-full bg-current opacity-40 rounded-full" />
                      <div className="h-0.5 w-2/3 bg-current opacity-20 rounded-full" />
                    </div>
                  </div>
                ) 
              },
            ]}
          />
        </div>

        <div className="space-y-0.5">
          <ToggleRow id="title-bold"  label="Bold entry titles" checked={s.titleBold !== false} onCheckedChange={(v) => upd({ titleBold: v })} />
          <ToggleRow id="indent-body" label="Indent body text"  checked={s.indentBody}          onCheckedChange={(v) => upd({ indentBody: v })} />
        </div>
      </ControlGroup>
    </>
  )
}
