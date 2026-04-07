'use client'
import { useRef, useState, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useResume } from '@/hooks/useResume'
import { TEMPLATE_META, getTemplateSettings } from '@/components/templates'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Layout as LayoutIcon, 
  User as HeaderIcon, 
  Settings2, 
  ChevronRight, 
  GripVertical, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Columns, 
  LayoutTemplate, 
  Check, 
  Minus, 
  Square, 
  Type as TypeIcon
} from 'lucide-react'
  import type {
  FontOption, DateFormat, PaperSize, ColumnLayout, ListStyle,
  SubtitleStyle, SubtitlePlacement, SectionHeadingSize, SectionHeadingCapitalization,
  SectionHeadingIcon, HeaderAlignment, HeaderArrangement, NameSize, ColorMode,
  SkillDisplayOption, EducationOrder, ExperienceOrder, SectionHeadingStyle, SectionHeadingIconStyle
  } from '@/lib/store/types'
import type { TemplateId } from '@/lib/store/types'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[]

const FONTS: FontOption[] = [
  'Inter', 'Lato', 'Roboto', 'Source Sans Pro', 'Raleway',
  'Merriweather', 'Playfair Display', 'IBM Plex Serif',
]

const ACCENT_PRESETS = [
  '#18181b', '#1e3a5f', '#4f46e5', '#7c3aed',
  '#dc2626', '#d97706', '#059669', '#0891b2',
]

const PANEL_SECTIONS = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'layout',    label: 'Layout',    icon: LayoutIcon },
  { id: 'typography', label: 'Typography', icon: TypeIcon },
  { id: 'colors',    label: 'Colors',    icon: Palette },
  { id: 'header',    label: 'Header',    icon: HeaderIcon },
  { id: 'sections',  label: 'Sections',  icon: Settings2 },
] as const

type PanelSectionId = typeof PANEL_SECTIONS[number]['id']

// ── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Label className={cn("block text-[11px] font-medium text-muted-foreground/80 mb-2 uppercase tracking-wider", className)}>
      {children}
    </Label>
  )
}

function ControlGroup({ title, children }: { title?: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4 mb-8">
      {title && <h4 className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] mb-3">{title}</h4>}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <Label className="text-xs font-medium cursor-pointer" onClick={() => onCheckedChange(!checked)}>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="scale-75" />
    </div>
  )
}

function IconGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; icon: any; label: string }[]
}) {
  return (
    <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label}
          className={cn(
            'flex-1 flex items-center justify-center py-1.5 rounded-md transition-all',
            value === o.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
          )}
        >
          <o.icon size={14} />
        </button>
      ))}
    </div>
  )
}

// ── D&D Helpers ───────────────────────────────────────────────────────────────

function SortableSectionItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-sm mb-2 transition-all",
        isDragging ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-foreground/20"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
        <GripVertical size={14} />
      </div>
      <span className="text-xs font-medium truncate select-none">{title}</span>
    </div>
  )
}

function DroppableColumn({ id, title, items, resumeSections }: { id: string; title: string; items: string[]; resumeSections: any[] }) {
  const { setNodeRef } = useSortable({ id })

  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">{title}</div>
      <div
        ref={setNodeRef}
        className="min-h-[160px] p-2.5 rounded-xl bg-muted/30 border border-dashed border-border/60"
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((sectionId) => {
              const sec = resumeSections.find(s => s.id === sectionId)
              return <SortableSectionItem key={sectionId} id={sectionId} title={sec?.title || 'Unknown'} />
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CustomizePanel() {
  const { resume, updateSettings, setResume } = useResume()
  const [activeSection, setActiveSection] = useState<PanelSectionId>('templates')
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!resume) return null
  const s = resume.settings

  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const sections = resume.sections.filter(sec => sec.type !== 'header')
  
  const mainIds = useMemo(() => sections.filter(sec => {
    const col = s.sectionColumns?.[sec.id]
    if (col) return col === 'main'
    return !sidebarTypes.includes(sec.type)
  }).map(s => s.id), [sections, s.sectionColumns])

  const sidebarIds = useMemo(() => sections.filter(sec => {
    const col = s.sectionColumns?.[sec.id]
    if (col) return col === 'sidebar'
    return sidebarTypes.includes(sec.type)
  }).map(s => s.id), [sections, s.sectionColumns])

  function handleDragStart(event: any) {
    setDragActiveId(event.active.id)
  }

  function handleDragOver(event: any) {
    const { active, over } = event
    if (!over) return

    const activeContainer = mainIds.includes(active.id) ? 'main' : 'sidebar'
    const overContainer = over.id === 'main-col' || mainIds.includes(over.id) ? 'main' : 
                         over.id === 'sidebar-col' || sidebarIds.includes(over.id) ? 'sidebar' : null

    if (overContainer && activeContainer !== overContainer) {
      const newMap = { ...(s.sectionColumns || {}), [active.id]: overContainer as 'main' | 'sidebar' }
      updateSettings({ sectionColumns: newMap })
    }
  }

  function handleDragEnd() {
    setDragActiveId(null)
  }

  const update = (updates: Partial<typeof s>) => updateSettings(updates)

  return (
    <div className="flex h-full overflow-hidden bg-background">
      
      {/* ── Left Nav ────────────────────────────────────────────── */}
      <nav className="w-14 border-r border-border flex flex-col items-center py-4 gap-4 shrink-0 bg-muted/5">
        {PANEL_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            title={section.label}
            className={cn(
              "relative group p-2.5 rounded-xl transition-all",
              activeSection === section.id 
                ? "bg-foreground text-background shadow-md shadow-foreground/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <section.icon size={18} strokeWidth={activeSection === section.id ? 2.5 : 2} />
            {activeSection === section.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-foreground rounded-l-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* ── Right Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-5 h-11 border-b border-border flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/80">
            {PANEL_SECTIONS.find(p => p.id === activeSection)?.label}
          </h3>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="pb-20"
            >
              
              {/* ───────────────── TEMPLATES ─────────────────────────── */}
              {activeSection === 'templates' && (
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATE_IDS.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        const overrides = getTemplateSettings(id)
                        setResume({ 
                          ...resume, 
                          template: id,
                          settings: { ...resume.settings, ...overrides }
                        })
                      }}
                      className={cn(
                        'group relative aspect-[3/4.2] rounded-xl border-2 transition-all overflow-hidden flex flex-col',
                        resume.template === id
                          ? 'border-foreground ring-4 ring-foreground/5 shadow-xl'
                          : 'border-border hover:border-foreground/30 shadow-sm',
                      )}
                    >
                      {/* Fake preview with accent color */}
                      <div className="flex-1 bg-muted relative overflow-hidden p-2">
                        <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-muted/80" />
                        
                        {/* Fake lines */}
                        <div className="relative space-y-1.5 opacity-40">
                          <div className="h-2 bg-foreground/20 rounded-full w-2/3 mx-auto mb-3" />
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-1">
                              <div className="h-1 bg-foreground/10 rounded-full w-full" />
                              <div className="h-1 bg-foreground/10 rounded-full w-[85%]" />
                            </div>
                          ))}
                        </div>

                        {resume.template === id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center shadow-lg">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="bg-background px-2.5 py-2.5 border-t border-border group-hover:bg-muted/50 transition-colors">
                        <p className="text-[11px] font-bold text-foreground text-center tracking-tight">
                          {TEMPLATE_META[id].label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ───────────────── LAYOUT ────────────────────────────── */}
              {activeSection === 'layout' && (
                <div className="space-y-8">
                  <ControlGroup title="Page & Columns">
                    <div>
                      <FieldLabel>Column Layout</FieldLabel>
                      <IconGroup
                        value={s.columnLayout}
                        onChange={(v) => update({ columnLayout: v as ColumnLayout })}
                        options={[
                          { value: 'one', icon: AlignLeft, label: 'Single Column' },
                          { value: 'two', icon: Columns, label: 'Two Columns' },
                          { value: 'mix', icon: LayoutIcon, label: 'Mixed Layout' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Paper Size</FieldLabel>
                        <Select value={s.paperSize} onValueChange={(v) => update({ paperSize: v as PaperSize })}>
                          <SelectTrigger className="h-9 text-xs font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="letter">US Letter</SelectItem>
                            <SelectItem value="a4">A4 (ISO)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Language</FieldLabel>
                        <Select value={s.language} onValueChange={(v) => v && update({ language: v })}>
                          <SelectTrigger className="h-9 text-xs font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Margins & Spacing">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <FieldLabel className="mb-0">Horizontal Margin</FieldLabel>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.marginHorizontal}mm</span>
                        </div>
                        <Slider min={5} max={40} step={1} value={[s.marginHorizontal]} onValueChange={([v]) => update({ marginHorizontal: v })} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <FieldLabel className="mb-0">Vertical Margin</FieldLabel>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.marginVertical}mm</span>
                        </div>
                        <Slider min={5} max={40} step={1} value={[s.marginVertical]} onValueChange={([v]) => update({ marginVertical: v })} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <FieldLabel className="mb-0">Entry Spacing</FieldLabel>
                          <span className="text-[10px] font-mono text-muted-foreground">x{s.entrySpacing.toFixed(1)}</span>
                        </div>
                        <Slider min={0.5} max={2.0} step={0.1} value={[s.entrySpacing]} onValueChange={([v]) => update({ entrySpacing: v })} />
                      </div>
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Section Placement">
                    {s.columnLayout === 'one' ? (
                      <div className="p-5 rounded-2xl bg-muted/50 border border-border/60 text-center">
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                          One-column layout applies to all sections. Change layout to enable column assignments.
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex gap-4">
                          <DroppableColumn 
                            id="main-col" 
                            title="Main" 
                            items={mainIds} 
                            resumeSections={sections} 
                          />
                          <DroppableColumn 
                            id="sidebar-col" 
                            title="Sidebar" 
                            items={sidebarIds} 
                            resumeSections={sections} 
                          />
                        </div>

                        <DragOverlay dropAnimation={{
                          sideEffects: defaultDropAnimationSideEffects({
                            styles: { active: { opacity: '0.5' } }
                          })
                        }}>
                          {dragActiveId ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-background border-2 border-primary rounded-lg shadow-2xl opacity-90 scale-105 z-[100]">
                              <GripVertical size={14} className="text-primary" />
                              <span className="text-xs font-bold truncate">
                                {sections.find(s => s.id === dragActiveId)?.title}
                              </span>
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    )}
                  </ControlGroup>
                </div>
              )}

              {/* ───────────────── TYPOGRAPHY ────────────────────────── */}
              {activeSection === 'typography' && (
                <div className="space-y-8">
                  <ControlGroup title="Base Font">
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONTS.map((f) => (
                        <button
                          key={f}
                          onClick={() => update({ fontFamily: f })}
                          className={cn(
                            'px-3 py-2.5 rounded-lg border text-xs text-left transition-all',
                            s.fontFamily === f
                              ? 'bg-foreground text-background border-foreground shadow-md font-bold'
                              : 'border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/50',
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Sizes & Height">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <FieldLabel className="mb-0">Base Font Size</FieldLabel>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.fontSize}pt</span>
                        </div>
                        <Slider min={8} max={13} step={0.5} value={[s.fontSize]} onValueChange={([v]) => update({ fontSize: v })} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <FieldLabel className="mb-0">Line Height</FieldLabel>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.lineHeight}</span>
                        </div>
                        <Slider min={1.0} max={2.2} step={0.05} value={[s.lineHeight]} onValueChange={([v]) => update({ lineHeight: v })} />
                      </div>
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Entry Styles">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Title Size</FieldLabel>
                        <IconGroup
                          value={s.titleSize}
                          onChange={(v) => update({ titleSize: v as 'S' | 'M' | 'L' })}
                          options={[
                            { value: 'S', icon: () => <span className="text-[10px] font-bold">S</span>, label: 'Small' },
                            { value: 'M', icon: () => <span className="text-xs font-bold">M</span>, label: 'Medium' },
                            { value: 'L', icon: () => <span className="text-sm font-bold">L</span>, label: 'Large' },
                          ]}
                        />
                      </div>
                      <div>
                        <FieldLabel>Subtitle</FieldLabel>
                        <IconGroup
                          value={s.subtitleStyle}
                          onChange={(v) => update({ subtitleStyle: v as SubtitleStyle })}
                          options={[
                            { value: 'normal', icon: () => <span className="text-xs">N</span>, label: 'Normal' },
                            { value: 'bold',   icon: () => <span className="text-xs font-bold">B</span>, label: 'Bold' },
                            { value: 'italic', icon: () => <span className="text-xs italic font-serif">I</span>, label: 'Italic' },
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2 space-y-1">
                      <ToggleRow 
                        label="Indent body text" 
                        checked={s.indentBody} 
                        onCheckedChange={(v) => update({ indentBody: v })} 
                      />
                      <div className="flex items-center justify-between py-1">
                        <Label className="text-xs font-medium">Subtitle Placement</Label>
                        <Select value={s.subtitlePlacement} onValueChange={(v) => update({ subtitlePlacement: v as SubtitlePlacement })}>
                          <SelectTrigger className="h-7 w-28 text-[10px] font-bold uppercase tracking-wider"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="same-line">Same Line</SelectItem>
                            <SelectItem value="next-line">Next Line</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ControlGroup>
                </div>
              )}

              {/* ───────────────── COLORS ────────────────────────────── */}
              {activeSection === 'colors' && (
                <div className="space-y-8">
                  <ControlGroup title="Color Mode">
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                      {[
                        { id: 'basic', label: 'Classic' },
                        { id: 'multi', label: 'Enhanced' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => update({ colorMode: mode.id as ColorMode })}
                          className={cn(
                            'flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all',
                            s.colorMode === mode.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Accent Color">
                    <div className="grid grid-cols-4 gap-2.5 mb-5">
                      {ACCENT_PRESETS.map((color) => (
                        <button
                          key={color}
                          onClick={() => update({ accentColor: color })}
                          className={cn(
                            "group relative aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110",
                            s.accentColor === color ? "ring-2 ring-offset-2 ring-foreground" : "ring-1 ring-border"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {s.accentColor === color && (
                            <Check size={14} className={cn(
                              color.toLowerCase() === '#ffffff' ? "text-black" : "text-white"
                            )} strokeWidth={3} />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div>
                      <FieldLabel>Custom Color</FieldLabel>
                      <div className="flex gap-2">
                        <div className="relative shrink-0 w-10 h-10 rounded-xl border border-border overflow-hidden">
                          <input
                            type="color"
                            value={s.accentColor}
                            onChange={(e) => update({ accentColor: e.target.value })}
                            className="absolute inset-[-4px] w-[150%] h-[150%] cursor-pointer bg-transparent"
                          />
                        </div>
                        <Input
                          value={s.accentColor}
                          onChange={(e) => update({ accentColor: e.target.value })}
                          className="h-10 text-xs font-mono uppercase tracking-wider"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </ControlGroup>

                  {s.colorMode === 'multi' && (
                    <ControlGroup title="Specific Elements">
                      <div className="space-y-4">
                        {[
                          { label: 'Background', key: 'backgroundColor', val: s.backgroundColor },
                          { label: 'Main Text',   key: 'textColor',       val: s.textColor },
                          { label: 'Headings',    key: 'headingColor',    val: s.headingColor },
                          { label: 'Dates & Meta', key: 'dateColor',       val: s.dateColor },
                        ].map(({ label, key, val }) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
                            <div className="flex gap-2 items-center">
                              <span className="text-[9px] font-mono text-muted-foreground/50 uppercase">{val}</span>
                              <div className="relative w-7 h-7 rounded-lg border border-border overflow-hidden">
                                <input
                                  type="color" value={val}
                                  onChange={(e) => update({ [key]: e.target.value } as never)}
                                  className="absolute inset-[-4px] w-[150%] h-[150%] cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ControlGroup>
                  )}
                </div>
              )}

              {/* ───────────────── HEADER ────────────────────────────── */}
              {activeSection === 'header' && (
                <div className="space-y-8">
                  <ControlGroup title="Identity">
                    <div>
                      <FieldLabel>Name Size</FieldLabel>
                      <IconGroup
                        value={s.nameSize}
                        onChange={(v) => update({ nameSize: v as NameSize })}
                        options={[
                          { value: 'XS', icon: () => <span className="text-[10px]">XS</span>, label: 'Tiny' },
                          { value: 'S',  icon: () => <span className="text-[11px]">S</span>, label: 'Small' },
                          { value: 'M',  icon: () => <span className="text-[12px]">M</span>, label: 'Medium' },
                          { value: 'L',  icon: () => <span className="text-[13px]">L</span>, label: 'Large' },
                          { value: 'XL', icon: () => <span className="text-[14px] font-bold">XL</span>, label: 'Huge' },
                        ]}
                      />
                    </div>
                    <div className="pt-2">
                      <ToggleRow label="Bold name" checked={s.nameBold} onCheckedChange={(v) => update({ nameBold: v })} />
                      <ToggleRow label="Show section labels" checked={s.showSectionLabels} onCheckedChange={(v) => update({ showSectionLabels: v })} />
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Alignment & Layout">
                    <div>
                      <FieldLabel>Header Alignment</FieldLabel>
                      <IconGroup
                        value={s.headerAlignment}
                        onChange={(v) => update({ headerAlignment: v as HeaderAlignment })}
                        options={[
                          { value: 'left',   icon: AlignLeft,   label: 'Align Left' },
                          { value: 'center', icon: AlignCenter, label: 'Align Center' },
                          { value: 'right',  icon: AlignRight,  label: 'Align Right' },
                        ]}
                      />
                    </div>
                    <div className="pt-4">
                      <FieldLabel>Contact Info Arrangement</FieldLabel>
                      <Select value={s.headerArrangement} onValueChange={(v) => update({ headerArrangement: v as HeaderArrangement })}>
                        <SelectTrigger className="h-9 text-xs font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="icon">With Icons</SelectItem>
                          <SelectItem value="bullet">Bullet Points (•)</SelectItem>
                          <SelectItem value="pipe">Pipes (|)</SelectItem>
                          <SelectItem value="bar">Bar (—)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </ControlGroup>
                </div>
              )}

              {/* ───────────────── SECTIONS ──────────────────────────── */}
              {activeSection === 'sections' && (
                <div className="space-y-8">
                  <ControlGroup title="Section Headings">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Size</FieldLabel>
                        <Select value={s.sectionHeadingSize} onValueChange={(v) => update({ sectionHeadingSize: v as SectionHeadingSize })}>
                          <SelectTrigger className="h-9 text-xs font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">Small</SelectItem>
                            <SelectItem value="M">Medium</SelectItem>
                            <SelectItem value="L">Large</SelectItem>
                            <SelectItem value="XL">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Capitalization</FieldLabel>
                        <Select value={s.sectionHeadingCapitalization} onValueChange={(v) => update({ sectionHeadingCapitalization: v as SectionHeadingCapitalization })}>
                          <SelectTrigger className="h-9 text-xs font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="capitalize">Capitalize</SelectItem>
                            <SelectItem value="uppercase">UPPERCASE</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <FieldLabel>Heading Decoration</FieldLabel>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'none',       label: 'None' },
                          { id: 'underline',  label: 'Under' },
                          { id: 'overline',   label: 'Over' },
                          { id: 'top-bottom', label: 'T & B' },
                          { id: 'box',        label: 'Box' },
                          { id: 'background', label: 'Fill' },
                          { id: 'left-bar',   label: 'Left' },
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => update({ sectionHeadingStyle: style.id as SectionHeadingStyle })}
                            className={cn(
                              'py-1.5 px-1 rounded border text-[9px] font-bold uppercase transition-all',
                              s.sectionHeadingStyle === style.id
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/30',
                            )}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <FieldLabel className="mb-0">Line Thickness</FieldLabel>
                        <span className="text-[10px] font-mono text-muted-foreground">{s.sectionHeadingLineThickness}pt</span>
                      </div>
                      <Slider min={0.5} max={4} step={0.5} value={[s.sectionHeadingLineThickness]} onValueChange={([v]) => update({ sectionHeadingLineThickness: v })} />
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <FieldLabel className="mb-0">Icon Size</FieldLabel>
                        <span className="text-[10px] font-mono text-muted-foreground">x{(s.sectionHeadingIconSize || 1.0).toFixed(1)}</span>
                      </div>
                      <Slider min={0.6} max={1.8} step={0.1} value={[s.sectionHeadingIconSize || 1.0]} onValueChange={([v]) => update({ sectionHeadingIconSize: v })} />
                    </div>

                    <div className="pt-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Icon Library</FieldLabel>
                          <IconGroup
                            value={s.sectionHeadingIconStyle}
                            onChange={(v) => update({ sectionHeadingIconStyle: v as SectionHeadingIconStyle })}
                            options={[
                              { value: 'lucide', icon: TypeIcon, label: 'Professional' },
                              { value: 'nerd',   icon: () => <span className="text-[10px] font-bold">AB</span>, label: 'Abstract' },
                            ]}
                          />
                        </div>
                        <div>
                          <FieldLabel>Icon Display</FieldLabel>
                          <IconGroup
                            value={s.sectionHeadingIcon || 'none'}
                            onChange={(v) => update({ sectionHeadingIcon: v as SectionHeadingIcon })}
                            options={[
                              { value: 'none',    icon: () => <span className="text-[10px] font-bold">Ø</span>, label: 'None' },
                              { value: 'simple',  icon: () => <div className="w-2.5 h-0.5 bg-current rounded-full" />, label: 'Simple' },
                              { value: 'filled',  icon: Minus,  label: 'Filled' },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </ControlGroup>

                  <ControlGroup title="Specific Section Options">
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Skills Display</FieldLabel>
                        <Select value={s.skillDisplay} onValueChange={(v) => update({ skillDisplay: v as SkillDisplayOption })}>
                          <SelectTrigger className="h-9 text-xs font-medium capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid (Columns)</SelectItem>
                            <SelectItem value="level">With Levels</SelectItem>
                            <SelectItem value="compact">Compact (List)</SelectItem>
                            <SelectItem value="bubble">Bubbles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator className="opacity-50" />
                      
                      <div className="space-y-3">
                        <ToggleRow label="Group Promotions" checked={s.groupPromotions} onCheckedChange={(v) => update({ groupPromotions: v })} />
                        <ToggleRow label="Footer Page Numbers" checked={s.footerPageNumbers} onCheckedChange={(v) => update({ footerPageNumbers: v })} />
                      </div>
                    </div>
                  </ControlGroup>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
