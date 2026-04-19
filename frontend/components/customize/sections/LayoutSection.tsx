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
  LayoutTemplate,
  PanelLeft,
  PanelRight,
  Square,
  RectangleHorizontal,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragOverEvent,
  type SensorContext,
} from '@dnd-kit/core'
import { DroppableColumn, VisualSegmentGroup } from '../CustomizePrimitives'

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
  const accent = s.accentColor || '#3b82f6'
  const isCoverLetter = sections.length <= 1 // Simplistic check or pass kind prop

  return (
    <>
      <ControlGroup title="Page Format">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Paper Size</FieldLabel>
            <Select value={s.paperSize} onValueChange={(v) => upd({ paperSize: v as PaperSize })}>
              <SelectTrigger className="w-full h-8 text-xs bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">US Letter</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Date Format</FieldLabel>
            <Select value={s.dateFormat} onValueChange={(v) => upd({ dateFormat: v as DateFormat })}>
              <SelectTrigger className="w-full h-8 text-xs bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
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
            <SelectTrigger className="w-full h-8 text-xs bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      {isCoverLetter ? (
        <ControlGroup title="Cover Letter Layout">
          <div>
            <FieldLabel>Date Position</FieldLabel>
            <SegmentGroup
              value={s.clDatePosition || 'left'}
              onChange={(v) => upd({ clDatePosition: v as 'left' | 'right' })}
              options={[
                { value: 'left', label: 'Left', render: () => <span>Left</span> },
                { value: 'right', label: 'Right', render: () => <span>Right</span> },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Signature Position</FieldLabel>
            <SegmentGroup
              value={s.clSignaturePosition || 'left'}
              onChange={(v) => upd({ clSignaturePosition: v as 'left' | 'right' })}
              options={[
                { value: 'left', label: 'Left', render: () => <span>Left</span> },
                { value: 'right', label: 'Right', render: () => <span>Right</span> },
              ]}
            />
          </div>
          <ToggleRow
            id="cl-sig-line"
            label="Show Signature Line"
            checked={s.clShowSignatureLine}
            onCheckedChange={(v) => upd({ clShowSignatureLine: v })}
          />
        </ControlGroup>
      ) : (
        <ControlGroup title="Resume Structure">
          <div>
            <FieldLabel>Column Layout</FieldLabel>
            <VisualSegmentGroup
              value={s.columnLayout}
              onChange={(v) => upd({ columnLayout: v as ColumnLayout })}
              columns={2}
              options={[
                { 
                  value: 'one',  
                  label: 'Single',  
                  render: () => (
                    <div className="w-10 h-7 border border-current/20 rounded-sm p-1 flex flex-col gap-1">
                      <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                      <div className="h-0.5 w-full bg-current opacity-20 rounded-full" />
                      <div className="h-0.5 w-full bg-current opacity-20 rounded-full" />
                    </div>
                  ) 
                },
                { 
                  value: 'two',  
                  label: 'Two Col',  
                  render: () => (
                    <div className="w-10 h-7 border border-current/20 rounded-sm p-1 flex gap-1">
                      <div className="w-1/3 border-r border-current/10 pr-1 flex flex-col gap-1">
                        <div className="h-0.5 w-full bg-current opacity-30 rounded-full" />
                        <div className="h-0.5 w-1/2 bg-current opacity-10 rounded-full" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                        <div className="h-0.5 w-full bg-current opacity-20 rounded-full" />
                      </div>
                    </div>
                  ) 
                },
              ]}
            />
          </div>

          {s.columnLayout !== 'one' && (
            <div>
              <FieldLabel>Sidebar Position</FieldLabel>
              <VisualSegmentGroup
                value={s.columnReverse ? 'left' : 'right'}
                onChange={(v) => upd({ columnReverse: v === 'left' })}
                columns={2}
                options={[
                  { 
                    value: 'left', 
                    label: 'Left', 
                    render: () => (
                      <div className="w-10 h-7 border border-current/20 rounded-sm p-1 flex gap-1">
                        <div className="w-1/3 rounded-[1px]" style={{ backgroundColor: `${accent}40` }} />
                        <div className="flex-1 border-l border-current/10 pl-1 flex flex-col gap-1 pt-1">
                          <div className="h-0.5 w-full bg-current opacity-20 rounded-full" />
                          <div className="h-0.5 w-4/5 bg-current opacity-20 rounded-full" />
                        </div>
                      </div>
                    ) 
                  },
                  { 
                    value: 'right', 
                    label: 'Right', 
                    render: () => (
                      <div className="w-10 h-7 border border-current/20 rounded-sm p-1 flex gap-1">
                        <div className="flex-1 border-r border-current/10 pr-1 flex flex-col gap-1 pt-1">
                          <div className="h-0.5 w-full bg-current opacity-20 rounded-full" />
                          <div className="h-0.5 w-4/5 bg-current opacity-20 rounded-full" />
                        </div>
                        <div className="w-1/3 rounded-[1px]" style={{ backgroundColor: `${accent}40` }} />
                      </div>
                    ) 
                  },
                ]}
              />
            </div>
          )}
        </ControlGroup>
      )}

      <Separator className="opacity-30" />

      <ControlGroup title="Margins & Spacing">
        <SliderRow
          label="Horizontal Margin" value={s.marginHorizontal} unit="mm"
          min={5} max={40} step={1} onChange={(v) => upd({ marginHorizontal: v })}
        />
        <SliderRow
          label="Vertical Margin" value={s.marginVertical} unit="mm"
          min={5} max={40} step={1} onChange={(v) => upd({ marginVertical: v })}
        />
        {!isCoverLetter && (
          <>
            <SliderRow
              label="Entry Spacing" value={s.entrySpacing ?? 1.0}
              min={0.5} max={2.0} step={0.1} onChange={(v) => upd({ entrySpacing: v })}
            />
            <SliderRow
              label="Section Spacing" value={s.sectionSpacing ?? 1.0}
              min={0.5} max={3.0} step={0.1} onChange={(v) => upd({ sectionSpacing: v })}
            />
          </>
        )}
      </ControlGroup>

      {!isCoverLetter && (
        <>
          <Separator className="opacity-30" />
          <ControlGroup title="Section Placement">
            {s.columnLayout === 'one' ? (
              <div className="py-8 px-3 rounded-2xl bg-muted/20 border border-dashed border-border/40 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-1">
                  <LayoutTemplate size={18} className="text-muted-foreground/30" />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground/60">
                  Single column layout active
                </p>
                <p className="text-[10px] text-muted-foreground/40 leading-relaxed px-4">
                  All sections are displayed in a single vertical flow. Switch to two-column to assign to sidebar.
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
                <div className="flex gap-4">
                  {s.columnReverse ? (
                    <>
                      <DroppableColumn 
                        id="sidebar-col" 
                        title="Sidebar" 
                        icon={<PanelLeft size={10} />}
                        items={sidebarIds} 
                        resumeSections={sections} 
                      />
                      <DroppableColumn 
                        id="main-col" 
                        title="Main Content" 
                        icon={<Square size={10} />}
                        items={mainIds} 
                        resumeSections={sections} 
                      />
                    </>
                  ) : (
                    <>
                      <DroppableColumn 
                        id="main-col" 
                        title="Main Content" 
                        icon={<Square size={10} />}
                        items={mainIds} 
                        resumeSections={sections} 
                      />
                      <DroppableColumn 
                        id="sidebar-col" 
                        title="Sidebar" 
                        icon={<PanelRight size={10} />}
                        items={sidebarIds} 
                        resumeSections={sections} 
                      />
                    </>
                  )}
                </div>
                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                  {dragActiveId ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-background border-2 border-primary rounded-lg shadow-xl ring-4 ring-primary/10">
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
      )}

      <Separator className="opacity-30" />
      <ControlGroup title="Settings">
        <ToggleRow
          id="debug-mode"
          label="Debug Mode (Show Errors)"
          checked={s.debugMode}
          onCheckedChange={(v) => upd({ debugMode: v })}
        />
      </ControlGroup>
    </>
  )
}
