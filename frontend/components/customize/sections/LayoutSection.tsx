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
  AlignJustify,
  Columns,
  Layout as LayoutIcon,
  GripVertical,
  LayoutTemplate,
  PanelLeft,
  PanelRight,
  Square,
  RectangleHorizontal,
  User,
  Calendar,
  Building,
  PenLine,
  Eye,
  EyeOff,
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
  isCoverLetter?: boolean
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
  isCoverLetter = false,
}: LayoutSectionProps) {
  const accent = s.accentColor || '#3b82f6'

  const CL_BLOCKS = [
    { id: 'clShowLetterhead',  label: 'Personal Letterhead', icon: User },
    { id: 'clShowDate',        label: 'Date & Location',     icon: Calendar },
    { id: 'clShowRecipient',   label: 'Recipient Details',   icon: Building },
    { id: 'clShowAutoSignOff', label: 'Auto "Sincerely"',    icon: PenLine },
  ] as const

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
        <>
          <ControlGroup title="Visible Blocks">
            <div className="grid grid-cols-1 gap-2">
              {CL_BLOCKS.map((block) => {
                const isActive = (s as any)[block.id] ?? true
                const Icon = block.icon
                return (
                  <button
                    key={block.id}
                    onClick={() => upd({ [block.id]: !isActive })}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 group text-left",
                      isActive 
                        ? "bg-card border-border/60 shadow-sm hover:border-foreground/20" 
                        : "bg-muted/10 border-transparent opacity-50 grayscale hover:opacity-70"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-inner",
                      isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[11px] font-bold truncate leading-tight transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {block.label}
                      </p>
                    </div>
                    <div className="shrink-0 transition-transform group-active:scale-90">
                      {isActive ? (
                        <Eye size={14} className="text-primary/60" />
                      ) : (
                        <EyeOff size={14} className="text-muted-foreground/40" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </ControlGroup>

          <Separator className="opacity-30" />

          <ControlGroup title="Body Typography">
            <div className="space-y-6">
              <div>
                <FieldLabel>Text Alignment</FieldLabel>
                <VisualSegmentGroup
                  value={s.clBodyAlign || 'left'}
                  onChange={(v) => upd({ clBodyAlign: v as 'left' | 'justify' })}
                  columns={2}
                  options={[
                    { 
                      value: 'left', 
                      label: 'Left', 
                      render: () => (
                        <div className="flex flex-col items-center gap-1">
                          <AlignLeft size={16} />
                          <span className="text-[9px] uppercase tracking-tighter font-bold">Standard</span>
                        </div>
                      ) 
                    },
                    { 
                      value: 'justify', 
                      label: 'Justify', 
                      render: () => (
                        <div className="flex flex-col items-center gap-1">
                          <AlignJustify size={16} />
                          <span className="text-[9px] uppercase tracking-tighter font-bold">Justified</span>
                        </div>
                      ) 
                    },
                  ]}
                />
              </div>

              <SliderRow
                label="Paragraph Spacing" 
                value={s.clParagraphSpacing ?? 1.0}
                min={0.5} max={2.5} step={0.1}
                onChange={(v) => upd({ clParagraphSpacing: v })}
                description="Adjust vertical space between blocks"
              />

              <div className="pt-2">
                <ToggleRow
                  id="cl-first-line-indent"
                  label="Indent First Line"
                  description="Classic typewriter style indentation"
                  checked={s.clFirstLineIndent ?? false}
                  onCheckedChange={(v) => upd({ clFirstLineIndent: v })}
                />
              </div>
            </div>
          </ControlGroup>

          <Separator className="opacity-30" />

          <ControlGroup title="Date & Signature Placement">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Date Position</FieldLabel>
                  <SegmentGroup
                    value={s.clDatePosition || 'left'}
                    onChange={(v) => upd({ clDatePosition: v as 'left' | 'right' })}
                    options={[
                      { value: 'left', label: 'Left', render: () => <PanelLeft size={14} /> },
                      { value: 'right', label: 'Right', render: () => <PanelRight size={14} /> },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Signature Side</FieldLabel>
                  <SegmentGroup
                    value={s.clSignaturePosition || 'left'}
                    onChange={(v) => upd({ clSignaturePosition: v as 'left' | 'right' })}
                    options={[
                      { value: 'left', label: 'Left', render: () => <PanelLeft size={14} /> },
                      { value: 'right', label: 'Right', render: () => <PanelRight size={14} /> },
                    ]}
                  />
                </div>
              </div>

              <ToggleRow
                id="cl-sig-line"
                label="Signature Divider"
                description="Add a thin line above your name"
                checked={s.clShowSignatureLine ?? true}
                onCheckedChange={(v) => upd({ clShowSignatureLine: v })}
              />

              <div className="space-y-2">
                <FieldLabel>Signature Scale</FieldLabel>
                <SegmentGroup
                  value={s.clSignatureSize || 'md'}
                  onChange={(v) => upd({ clSignatureSize: v as 'sm' | 'md' | 'lg' })}
                  options={[
                    { value: 'sm', label: 'S', render: () => <span className="text-[10px] font-bold">SM</span> },
                    { value: 'md', label: 'M', render: () => <span className="text-[10px] font-bold">MD</span> },
                    { value: 'lg', label: 'L', render: () => <span className="text-[10px] font-bold">LG</span> },
                  ]}
                />
              </div>
            </div>
          </ControlGroup>
        </>
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
