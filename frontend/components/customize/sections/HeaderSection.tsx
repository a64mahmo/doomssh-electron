'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import {
  ResumeSettings, HeaderAlignment, NameSize, DetailsArrangement,
  DetailsTextAlignment, HeaderArrangement, PhotoSize, PhotoShape, 
  PhotoPosition, DetailsPosition, ResumeSection
} from '@/lib/store/types'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ControlGroup,
  FieldLabel,
  SegmentGroup,
  ToggleRow,
  SliderRow,
} from '@/components/editor/EditorPrimitives'
import { VisualSegmentGroup } from '../CustomizePrimitives'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Circle,
  SquareDot,
  Square,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface HeaderSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
  sections: ResumeSection[]
}

export function HeaderSection({ s, upd, sections }: HeaderSectionProps) {
  // Simple check for cover letter mode
  const isCoverLetter = sections.length === 0 // All other sections except header are passed here

  return (
    <>
      <ControlGroup title="Header Layout">
        {/* Two columns: the header heads one column, never both, so the
            columns run the full height of the page. Offered as the side it
            lands on; which column that is follows the column order. */}
        {!isCoverLetter && s.columnLayout !== 'one' && (() => {
          const leftValue = s.columnReverse ? 'sidebar' : 'main'
          const rightValue = s.columnReverse ? 'main' : 'sidebar'
          const current = s.headerLayout === 'sidebar' ? 'sidebar' : 'main'
          // The header bar sits atop the column on that side: the wide main
          // column or the narrow sidebar.
          const thumb = (side: 'left' | 'right', headed: 'main' | 'sidebar') => {
            const col = (wide: boolean, withHeader: boolean) => (
              <div className={cn('flex flex-col gap-0.5', wide ? 'flex-1' : 'w-1/3')}>
                {withHeader && <div className="h-1.5 w-full bg-current rounded-sm" />}
                <div className={cn('w-full rounded-sm', wide ? 'bg-current/50' : 'bg-current/30', withHeader ? 'h-2.5' : 'h-4')} />
              </div>
            )
            const main = col(true, headed === 'main')
            const sidebar = col(false, headed === 'sidebar')
            const leftIsMain = !s.columnReverse
            return (
              <div className="flex gap-1 w-10 text-muted-foreground/40">
                {leftIsMain ? main : sidebar}
                {leftIsMain ? sidebar : main}
              </div>
            )
          }
          return (
            <div>
              <FieldLabel>Header Position</FieldLabel>
              <VisualSegmentGroup
                columns={2}
                value={current}
                onChange={(v) => upd({ headerLayout: v as 'main' | 'sidebar' })}
                options={[
                  { value: leftValue, label: 'Left', render: () => thumb('left', leftValue) },
                  { value: rightValue, label: 'Right', render: () => thumb('right', rightValue) },
                ]}
              />
            </div>
          )
        })()}

        <div>
          <FieldLabel>Text Alignment</FieldLabel>
          <VisualSegmentGroup
            columns={3}
            value={s.headerAlignment}
            onChange={(v) => {
              const align = v as HeaderAlignment
              const updates: Partial<ResumeSettings> = { 
                headerAlignment: align,
                detailsTextAlignment: align 
              }
              if (align === 'center') {
                if (s.detailsArrangement === 'grid') updates.detailsArrangement = 'column'
                if (s.photoPosition === 'beside') updates.photoPosition = 'top'
                updates.detailsPosition = 'below'
              } else {
                updates.photoPosition = 'beside'
              }
              upd(updates)
            }}
            options={[
              { value: 'left', label: 'Left', render: () => (
                <div className="flex flex-col gap-1.5 w-10 text-muted-foreground/40">
                  <div className="h-1.5 w-full bg-current rounded-sm" />
                  <div className="h-1 w-2/3 bg-current rounded-sm" />
                </div>
              ) },
              { value: 'center', label: 'Center', render: () => (
                <div className="flex flex-col items-center gap-1.5 w-10 text-muted-foreground/40">
                  <div className="h-1.5 w-full bg-current rounded-sm" />
                  <div className="h-1 w-2/3 bg-current rounded-sm" />
                </div>
              ) },
              { value: 'right', label: 'Right', render: () => (
                <div className="flex flex-col items-end gap-1.5 w-10 text-muted-foreground/40">
                  <div className="h-1.5 w-full bg-current rounded-sm" />
                  <div className="h-1 w-2/3 bg-current rounded-sm" />
                </div>
              ) },
            ]}
          />
        </div>

        {!isCoverLetter && s.headerAlignment !== 'center' && (
          <div>
            <FieldLabel>Details Position</FieldLabel>
            <VisualSegmentGroup
              columns={2}
              value={s.detailsPosition}
              onChange={(v) => {
                const pos = v as DetailsPosition
                const updates: Partial<ResumeSettings> = { detailsPosition: pos }
                if (pos === 'beside' && s.detailsArrangement === 'wrap') {
                  updates.detailsArrangement = 'column'
                }
                upd(updates)
              }}
              options={[
                { value: 'below', label: 'Below', render: () => (
                  <div className="flex flex-col items-start gap-1 w-10 px-0.5 text-muted-foreground/40">
                    <div className="h-1.5 w-full bg-current rounded-sm" />
                    <div className="flex gap-1 w-full">
                      <div className="h-1 w-1/3 bg-current rounded-full" />
                      <div className="h-1 w-1/3 bg-current rounded-full" />
                      <div className="h-1 w-1/3 bg-current rounded-full" />
                    </div>
                  </div>
                ) },
                { value: 'beside', label: 'Beside', render: () => (
                  <div className="flex items-center gap-1.5 w-10 px-0.5 text-muted-foreground/40">
                    <div className="h-1.5 w-1/2 bg-current rounded-sm" />
                    <div className="flex flex-col gap-0.5 w-1/2">
                      <div className="h-0.5 w-full bg-current rounded-full" />
                      <div className="h-0.5 w-full bg-current rounded-full" />
                    </div>
                  </div>
                ) },
              ]}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <FieldLabel>Name Size</FieldLabel>
            <Select value={s.nameSize} onValueChange={(v) => upd({ nameSize: v as NameSize })}>
              <SelectTrigger className="w-full h-8 text-xs bg-muted/20 border-border/50 transition-colors hover:bg-muted/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">Executive (XS)</SelectItem>
                <SelectItem value="S">Small (S)</SelectItem>
                <SelectItem value="M">Medium (M)</SelectItem>
                <SelectItem value="L">Large (L)</SelectItem>
                <SelectItem value="XL">Extra Large (XL)</SelectItem>
                <SelectItem value="XXL">Hero (XXL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <ToggleRow id="name-bold" label="Bold Name" checked={s.nameBold} onCheckedChange={(v) => upd({ nameBold: v })} />
          </div>
        </div>

        <div>
          <FieldLabel>Job Title</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <SegmentGroup
              value={s.jobTitleStyle ?? 'caps'}
              onChange={(v) => upd({ jobTitleStyle: v as 'caps' | 'normal' | 'italic' })}
              options={[
                { value: 'caps',   label: 'Small caps', render: () => <span className="text-[9px] font-bold tracking-widest">CAPS</span> },
                { value: 'normal', label: 'As typed',   render: () => <span className="text-[10px] font-semibold">Aa</span> },
                { value: 'italic', label: 'Italic',     render: () => <span className="text-[10px] font-semibold italic">Aa</span> },
              ]}
            />
            <SegmentGroup
              value={s.jobTitlePlacement ?? 'below'}
              onChange={(v) => upd({ jobTitlePlacement: v as 'below' | 'inline' })}
              options={[
                { value: 'below',  label: 'Below name',   render: () => <span className="text-[10px] font-semibold">Below</span> },
                { value: 'inline', label: 'Beside name',  render: () => <span className="text-[10px] font-semibold">Inline</span> },
              ]}
            />
          </div>
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Contact Details">
        <div>
          <FieldLabel>Arrangement</FieldLabel>
          <VisualSegmentGroup
            columns={3}
            value={s.detailsArrangement}
            onChange={(v) => upd({ detailsArrangement: v as DetailsArrangement })}
            options={[
              { value: 'column', label: 'Stack', render: () => (
                <div className="flex flex-col gap-1 w-8 text-muted-foreground/40">
                  <div className="h-1 w-full bg-current rounded-full" />
                  <div className="h-1 w-full bg-current rounded-full" />
                </div>
              ) },
              { value: 'wrap', label: 'Wrap', render: () => (
                <div className="flex flex-col gap-1 w-10 px-1 text-muted-foreground/40">
                  <div className="flex gap-1"><div className="h-1 w-1/2 bg-current opacity-60 rounded-full" /><div className="h-1 w-1/2 bg-current opacity-40 rounded-full" /></div>
                </div>
              ) },
              { value: 'grid', label: 'Grid', render: () => (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-10 px-1 text-muted-foreground/40">
                  <div className="h-1 w-full bg-current rounded-full" /><div className="h-1 w-full bg-current rounded-full" />
                  <div className="h-1 w-full bg-current rounded-full" /><div className="h-1 w-full bg-current rounded-full" />
                </div>
              ) },
            ]}
          />
        </div>

        <div>
          <FieldLabel>Delimiter Style</FieldLabel>
          <SegmentGroup
            value={s.headerArrangement}
            onChange={(v) => upd({ headerArrangement: v as HeaderArrangement })}
            options={[
              { value: 'icon', label: 'Icon', render: () => <span className="text-[10px] font-bold">Icon</span> },
              { value: 'bullet', label: 'Bullet', render: () => <span className="text-[10px] font-bold">Bullet</span> },
              { value: 'verticalBar', label: 'Bar', render: () => <span className="text-[10px] font-bold">Bar</span> },
              { value: 'none', label: 'None', render: () => <span className="text-[10px] font-bold opacity-30">Off</span> },
            ]}
          />
        </div>

        <div className="pt-2">
          <ToggleRow id="contact-icons" label="Show Contact Icons" checked={s.contactIcons} onCheckedChange={(v) => upd({ contactIcons: v })} />
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Photo Settings">
        <ToggleRow id="photo-enable" label="Enable Photo" checked={s.photoEnabled} onCheckedChange={(v) => upd({ photoEnabled: v })} />
        
        {s.photoEnabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Size</FieldLabel>
                <SegmentGroup
                  value={s.photoSize}
                  onChange={(v) => upd({ photoSize: v as PhotoSize })}
                  options={[
                    { value: 'S',  label: 'Small',  render: () => <span className="text-[10px] font-bold">S</span> },
                    { value: 'M',  label: 'Medium', render: () => <span className="text-[10px] font-bold">M</span> },
                    { value: 'L',  label: 'Large',  render: () => <span className="text-[10px] font-bold">L</span> },
                    { value: 'XL', label: 'Extra large', render: () => <span className="text-[10px] font-bold">XL</span> },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Shape</FieldLabel>
                <SegmentGroup
                  value={s.photoShape}
                  onChange={(v) => upd({ photoShape: v as PhotoShape })}
                  options={[
                    { value: 'circle',  label: 'Circle',  render: () => <Circle size={12} className="opacity-50" /> },
                    { value: 'rounded', label: 'Round',   render: () => <SquareDot size={12} className="opacity-50" /> },
                    { value: 'square',  label: 'Square',  render: () => <Square size={12} className="opacity-50" /> },
                  ]}
                />
              </div>
            </div>
            
            <div>
              <FieldLabel>Position</FieldLabel>
              <SegmentGroup
                value={s.photoPosition}
                onChange={(v) => upd({ photoPosition: v as PhotoPosition })}
                options={[
                  { value: 'beside', label: 'Beside', render: () => <span className="text-[10px] font-bold">Beside</span> },
                  { value: 'top',    label: 'Above',  render: () => <span className="text-[10px] font-bold">Above</span> },
                  { value: 'bottom', label: 'Below',  render: () => <span className="text-[10px] font-bold">Below</span> },
                ]}
              />
            </div>

            <SliderRow
              id="photo-gap-header"
              label="Photo Gap"
              value={s.photoGap}
              min={0} max={30} step={2} unit="pt"
              onChange={(v) => upd({ photoGap: v })}
            />
          </motion.div>
        )}
      </ControlGroup>

    </>
  )
}
