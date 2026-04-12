'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import type { ResumeSettings, ColumnLayout, PaperSize, DateFormat, ResumeSection } from '@/lib/store/types'
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
  SliderRow,
  SegmentGroup,
  ToggleRow,
} from '@/components/editor/EditorPrimitives'
import {
  AlignLeft,
  Columns,
  Layout as LayoutIcon,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragOverEvent,
  type SensorContext,
} from '@dnd-kit/core'
import { DroppableColumn } from '../CustomizePrimitives'

interface LayoutSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
  sensors: any // useSensors return type
  handleDragOver: (event: DragOverEvent) => void
  dragActiveId: string | null
  setDragActiveId: (id: string | null) => void
  mainIds: string[]
  sidebarIds: string[]
  sections: ResumeSection[]
}

export function LayoutSection({
  s,
  upd,
  sensors,
  handleDragOver,
  dragActiveId,
  setDragActiveId,
  mainIds,
  sidebarIds,
  sections,
}: LayoutSectionProps) {
  return (
    <>
      <ControlGroup title="Page">
        <div>
          <FieldLabel>Column Layout</FieldLabel>
          <SegmentGroup
            value={s.columnLayout}
            onChange={(v) => upd({ columnLayout: v as ColumnLayout })}
            options={[
              { value: 'one',  label: 'Single',  render: () => <AlignLeft  size={14} /> },
              { value: 'two',  label: 'Two col', render: () => <Columns    size={14} /> },
              { value: 'mix',  label: 'Mixed',   render: () => <LayoutIcon size={14} /> },
            ]}
          />
        </div>

        {s.columnLayout !== 'one' && (
          <ToggleRow
            id="col-reverse"
            label="Sidebar on Left"
            checked={s.columnReverse}
            onCheckedChange={(v) => upd({ columnReverse: v })}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Paper Size</FieldLabel>
            <Select value={s.paperSize} onValueChange={(v) => upd({ paperSize: v as PaperSize })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">US Letter</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Date Format</FieldLabel>
            <Select value={s.dateFormat} onValueChange={(v) => upd({ dateFormat: v as DateFormat })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MMM YYYY">Jan 2024</SelectItem>
                <SelectItem value="MMMM YYYY">January 2024</SelectItem>
                <SelectItem value="MM/YYYY">01/2024</SelectItem>
                <SelectItem value="YYYY">2024</SelectItem>
                <SelectItem value="YYYY MMM DD">2024 Jan 01</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <FieldLabel>Language</FieldLabel>
          <Select value={s.language} onValueChange={(v) => v && upd({ language: v })}>
            <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ToggleRow
          id="debug-mode"
          label="Debug Mode (Show Errors)"
          checked={s.debugMode}
          onCheckedChange={(v) => upd({ debugMode: v })}
        />
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Margins & Spacing">
        <SliderRow
          label="Horizontal Margin" value={s.marginHorizontal} display={`${s.marginHorizontal}mm`}
          min={5} max={40} step={1} onChange={(v) => upd({ marginHorizontal: v })}
        />
        <SliderRow
          label="Vertical Margin" value={s.marginVertical} display={`${s.marginVertical}mm`}
          min={5} max={40} step={1} onChange={(v) => upd({ marginVertical: v })}
        />
        <SliderRow
          label="Entry Spacing" value={s.entrySpacing ?? 1.0} display={`x${(s.entrySpacing ?? 1.0).toFixed(1)}`}
          min={0.5} max={2.0} step={0.1} onChange={(v) => upd({ entrySpacing: v })}
        />
        <SliderRow
          label="Section Spacing" value={s.sectionSpacing ?? 1.0} display={`x${(s.sectionSpacing ?? 1.0).toFixed(1)}`}
          min={0.5} max={3.0} step={0.1} onChange={(v) => upd({ sectionSpacing: v })}
        />
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Section Placement">
        {s.columnLayout === 'one' ? (
          <div className="py-4 px-3 rounded-xl bg-muted/40 border border-dashed border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              Switch to two-column or mixed layout to assign sections.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setDragActiveId(String(e.active.id))}
            onDragOver={handleDragOver}
            onDragEnd={() => setDragActiveId(null)}
          >
            <div className="flex gap-3">
              <DroppableColumn id="main-col" title="Main" items={mainIds} resumeSections={sections} />
              <DroppableColumn id="sidebar-col" title="Sidebar" items={sidebarIds} resumeSections={sections} />
            </div>
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
              {dragActiveId ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-background border-2 border-primary rounded-lg shadow-xl">
                  <GripVertical size={13} className="text-primary" />
                  <span className="text-xs font-semibold">
                    {sections.find(sec => sec.id === dragActiveId)?.title}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </ControlGroup>
    </>
  )
}
