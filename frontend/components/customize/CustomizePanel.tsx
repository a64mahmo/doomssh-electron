'use client'
import { useRef, useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useResume } from '@/hooks/useResume'
import { TEMPLATE_META, getTemplateSettings } from '@/components/templates'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Palette,
  Layout as LayoutIcon,
  User as HeaderIcon,
  Settings2,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  LayoutTemplate,
  Check,
  Type as TypeIcon,
  Image as ImageIcon,
  Contact,
  Grid2X2,
  Grid3X3,
  FileText,
  RotateCcw,
} from 'lucide-react'
import {
  FontOption, DateFormat, PaperSize, ColumnLayout, ListStyle,
  SubtitleStyle, SubtitlePlacement, SectionHeadingSize, SectionHeadingCapitalization,
  SectionHeadingIcon, HeaderAlignment, HeaderArrangement, NameSize, ColorMode,
  SkillDisplayOption, EducationOrder, ExperienceOrder, SectionHeadingStyle,
  PhotoSize, PhotoShape, PhotoPosition,
  ContactIconStyle, DetailsArrangement, DetailsPosition, DetailsTextAlignment, DetailsSpacing,
  EntryLayout, ColumnWidthMode, ThemeColorStyle,
  ResumeSettings, DEFAULT_SETTINGS,
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
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  FieldLabel,
  ControlGroup,
  SliderRow,
  ToggleRow,
  SegmentGroup
} from '@/components/editor/EditorPrimitives'

// -- Constants -----------------------------------------------------------------

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[]

const FONTS: FontOption[] = [
  'Inter', 'Lato', 'Roboto', 'Source Sans Pro', 'Raleway',
  'Merriweather', 'Playfair Display', 'IBM Plex Serif', 'IBM Plex Mono',
]

const ACCENT_PRESETS = [
  '#18181b', '#1e3a5f', '#4f46e5', '#7c3aed',
  '#dc2626', '#d97706', '#059669', '#0891b2',
]

const PANEL_SECTIONS = [
  { id: 'templates', label: 'Templates',  icon: LayoutTemplate },
  { id: 'layout',    label: 'Layout',     icon: LayoutIcon },
  { id: 'typography',label: 'Typography', icon: TypeIcon },
  { id: 'entry',     label: 'Entry',      icon: FileText },
  { id: 'colors',    label: 'Colors',     icon: Palette },
  { id: 'header',    label: 'Header',     icon: HeaderIcon },
  { id: 'sections',  label: 'Sections',   icon: Settings2 },
] as const

type PanelSectionId = typeof PANEL_SECTIONS[number]['id']

// -- Drag & Drop ---------------------------------------------------------------

function SortableSectionItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-sm transition-all',
        isDragging ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border hover:border-foreground/20',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0"
      >
        <GripVertical size={14} />
      </div>
      <span className="text-xs font-medium truncate select-none">{title}</span>
    </div>
  )
}

function DroppableColumn({ id, title, items, resumeSections }: {
  id: string; title: string; items: string[]; resumeSections: { id: string; title: string }[]
}) {
  const { setNodeRef } = useSortable({ id })
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div ref={setNodeRef} className="min-h-[140px] p-2 rounded-xl bg-muted/30 border border-dashed border-border/60 space-y-1">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((sectionId) => {
            const sec = resumeSections.find(s => s.id === sectionId)
            return <SortableSectionItem key={sectionId} id={sectionId} title={sec?.title || 'Unknown'} />
          })}
        </SortableContext>
      </div>
    </div>
  )
}

// -- Templates visual ---------------------------------------------------------

function TemplateVisual({ id }: { id: TemplateId }) {
  const settings = getTemplateSettings(id)
  const layout = settings.columnLayout || 'one'
  const isSidebar = layout === 'two' || layout === 'mix'
  const isReverse = settings.columnReverse
  const headerAlign = settings.headerAlignment || 'left'
  const accent = settings.accentColor || '#3b82f6'

  return (
    <div className="flex-1 bg-muted/15 p-4 flex flex-col gap-4 overflow-hidden select-none group-hover:bg-muted/25 transition-colors">
      {/* Mini Header Area */}
      <div className={cn(
        "flex flex-col gap-2 pb-3 border-b border-foreground/5",
        headerAlign === 'center' && "items-center text-center",
        headerAlign === 'right' && "items-end text-right"
      )}>
        <div className="h-2.5 w-2/3 rounded-full opacity-80" style={{ backgroundColor: accent }} />
        <div className={cn("flex gap-1.5 w-full", 
          headerAlign === 'center' ? "justify-center" : 
          headerAlign === 'right' ? "justify-end" : "justify-start"
        )}>
          <div className="h-1 w-3 bg-foreground/20 rounded-full" />
          <div className="h-1 w-5 bg-foreground/20 rounded-full" />
          <div className="h-1 w-3 bg-foreground/20 rounded-full" />
        </div>
      </div>

      <div className={cn("flex-1 flex gap-4", isReverse && "flex-row-reverse")}>
        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-2">
            <div className="h-1.5 w-1/3 bg-foreground/30 rounded-full" />
            <div className="space-y-1">
              <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
              <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
              <div className="h-0.5 w-4/5 bg-foreground/10 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-1/2 bg-foreground/30 rounded-full" />
            <div className="space-y-1">
              <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
              <div className="h-0.5 w-5/6 bg-foreground/10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {isSidebar && (
          <div className={cn(
            "w-1/3 flex flex-col gap-4 border-foreground/5",
            isReverse ? "border-r pr-3" : "border-l pl-3"
          )}>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-foreground/20 rounded-full" />
              <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-foreground/20 rounded-full" />
              <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -- Heading style visual ------------------------------------------------------

const HEADING_STYLES: { id: SectionHeadingStyle; label: string }[] = [
  { id: 'none',       label: 'None'     },
  { id: 'underline',  label: 'Under'    },
  { id: 'overline',   label: 'Over'     },
  { id: 'top-bottom', label: 'Both'     },
  { id: 'left-bar',   label: 'Left bar' },
  { id: 'box',        label: 'Box'      },
  { id: 'background', label: 'Fill'     },
]

function VisualSegmentGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
  showLabel = true,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; render: () => React.ReactNode; label: string }[]
  columns?: number
  showLabel?: boolean
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4")}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="group flex flex-col items-center gap-1.5 cursor-pointer outline-none"
          >
            <div className={cn(
              "w-full h-12 flex items-center justify-center rounded-xl border transition-all duration-200 relative overflow-hidden",
              active 
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_1px_inset_rgba(var(--primary),0.1)]" 
                : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:border-border hover:bg-muted/40"
            )}>
              {active && (
                <div className="absolute inset-0 bg-primary/5 animate-in fade-in duration-500" />
              )}
              <div className="relative z-10 w-full flex items-center justify-center">
                {o.render()}
              </div>
            </div>
            {showLabel && (
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
              )}>
                {o.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function HeadingStyleButton({ style, active, onClick, accentColor }: {
  style: { id: SectionHeadingStyle; label: string }
  active: boolean
  onClick: () => void
  accentColor: string
}) {
  const lineStyle = { backgroundColor: `${accentColor}80`, borderRadius: '999px' }
  const preview: Record<SectionHeadingStyle, React.ReactNode> = {
    none: (
      <div className="w-full h-[2px]" style={{ ...lineStyle, opacity: 0 }} />
    ),
    underline: (
      <div className="w-full border-b-[1.5px] border-foreground/20 pb-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    overline: (
      <div className="w-full border-t-[1.5px] border-foreground/20 pt-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    'top-bottom': (
      <div className="w-full border-t-[1.5px] border-b-[1.5px] border-foreground/20 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    'left-bar': (
      <div className="w-full flex items-center gap-1 pl-1 border-l-[2.5px] border-foreground/30">
        <div className="h-[1.5px] flex-1" style={lineStyle} />
      </div>
    ),
    box: (
      <div className="w-full border-[1.5px] border-foreground/20 rounded px-1 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
    background: (
      <div className="w-full bg-foreground/5 rounded px-1 py-0.5">
        <div className="h-[1.5px] w-3/4" style={lineStyle} />
      </div>
    ),
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={style.label}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all',
        active
          ? 'border-foreground bg-foreground/5 ring-1 ring-foreground/20'
          : 'border-border hover:border-foreground/30 hover:bg-muted/50',
      )}
    >
      <div className="w-full h-4 flex items-center">{preview[style.id]}</div>
      <span className={cn('text-[9px] font-semibold uppercase tracking-wide', active ? 'text-foreground' : 'text-muted-foreground/60')}>
        {style.label}
      </span>
    </button>
  )
}

// -- Main Panel ----------------------------------------------------------------

export function CustomizePanel() {
  const { resume, updateSettings, setResume } = useResume()
  const [activeSection, setActiveSection] = useState<PanelSectionId>('templates')
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sidebarTypes = useMemo(() => ['skills', 'education', 'languages', 'certifications', 'awards', 'references'], [])
  const sections = useMemo(() => resume?.sections.filter(sec => sec.type !== 'header') || [], [resume?.sections])

  const mainIds = useMemo(() => {
    if (!resume) return []
    const s = resume.settings
    return sections.filter(sec => {
      const col = s.sectionColumns?.[sec.id]
      return col ? col === 'main' : !sidebarTypes.includes(sec.type)
    }).map(sec => sec.id)
  }, [sections, resume, sidebarTypes])

  const sidebarIds = useMemo(() => {
    if (!resume) return []
    const s = resume.settings
    return sections.filter(sec => {
      const col = s.sectionColumns?.[sec.id]
      return col ? col === 'sidebar' : sidebarTypes.includes(sec.type)
    }).map(sec => sec.id)
  }, [sections, resume, sidebarTypes])

  if (!resume) return null
  const s = resume.settings

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const activeContainer = mainIds.includes(activeId) ? 'main' : 'sidebar'
    const overContainer =
      overId === 'main-col' || mainIds.includes(overId) ? 'main' :
      overId === 'sidebar-col' || sidebarIds.includes(overId) ? 'sidebar' : null
    if (overContainer && activeContainer !== overContainer) {
      updateSettings({ sectionColumns: { ...(s.sectionColumns || {}), [activeId]: overContainer } })
    }
  }

  const upd = (updates: Partial<typeof s>) => updateSettings(updates)

  // Whether the active heading decoration has a line to configure
  const headingHasLine = ['underline', 'overline', 'top-bottom', 'box'].includes(s.sectionHeadingStyle || 'underline')

  return (
    <div className="flex h-full overflow-hidden bg-background">

      {/* -- Icon Nav ------------------------------------------------ */}
      <nav className="w-12 border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 bg-sidebar">
        {PANEL_SECTIONS.map((section) => {
          const active = activeSection === section.id
          return (
            <Tooltip key={section.id}>
              <TooltipTrigger
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <section.icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              </TooltipTrigger>
              <TooltipContent side="right">
                {section.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      {/* -- Content ------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header bar */}
        <header className="px-4 h-10 border-b border-border flex items-center shrink-0 bg-background/60 backdrop-blur-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">
            {PANEL_SECTIONS.find(p => p.id === activeSection)?.label}
          </h3>
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="px-4 py-5 space-y-6 pb-24"
            >

              {/* --------------- TEMPLATES ------------------ */}
              {activeSection === 'templates' && (
                <div className="grid grid-cols-2 gap-4">
                  {TEMPLATE_IDS.map((id) => {
                    const meta = TEMPLATE_META[id]
                    const active = resume.template === id
                    
                    return (
                      <Tooltip key={id}>
                        <TooltipTrigger
                          type="button"
                          onClick={() => {
                            if (id === 'custom') return
                            const overrides = getTemplateSettings(id)
                            setResume({ ...resume, template: id, settings: { ...DEFAULT_SETTINGS, ...overrides } })
                          }}
                          className={cn(
                            'group relative aspect-[3/4.5] rounded-2xl border-2 overflow-hidden flex flex-col transition-all cursor-pointer text-left',
                            active
                              ? 'border-primary shadow-xl ring-4 ring-primary/5 bg-primary/5'
                              : 'border-border/60 hover:border-primary/40 shadow-sm hover:shadow-md hover:-translate-y-0.5',
                          )}
                        >
                          {/* Visual Preview */}
                          <div className="flex-1 min-h-0 relative">
                            <TemplateVisual id={id} />
                            {active && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200 z-20">
                                <Check size={11} strokeWidth={3.5} />
                              </div>
                            )}
                          </div>

                          {/* Label & Description */}
                          <div className={cn(
                            "px-3 py-2.5 border-t border-border/50 transition-colors h-[58px] flex flex-col justify-center shrink-0",
                            active ? "bg-primary/5" : "bg-muted/30 group-hover:bg-muted/50"
                          )}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-black tracking-tight uppercase truncate">
                                {meta.label}
                              </p>
                              {id === 'custom' && (
                                <span className="text-[8px] px-1 bg-primary/10 text-primary rounded font-black shrink-0">MANUAL</span>
                              )}
                            </div>
                            <p className="text-[9px] text-muted-foreground leading-tight line-clamp-1 mt-0.5 opacity-70 italic">
                              {meta.description}
                            </p>
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
              )}

              {/* --------------- LAYOUT ------------------ */}
              {activeSection === 'layout' && (
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
                      label="Entry Spacing" value={s.entrySpacing} display={`x${s.entrySpacing.toFixed(1)}`}
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
              )}

              {/* --------------- TYPOGRAPHY ------------------ */}
              {activeSection === 'typography' && (
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
              )}

              {/* --------------- ENTRY ------------------ */}
              {activeSection === 'entry' && (
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
                          label="Width" value={s.columnWidth} display={`${s.columnWidth}%`}
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
              )}

              {/* --------------- COLORS ------------------ */}
              {activeSection === 'colors' && (
                <>
                  <ControlGroup title="Theme Style">
                    <VisualSegmentGroup
                      columns={3}
                      value={s.themeColorStyle}
                      onChange={(v) => upd({ themeColorStyle: v as ThemeColorStyle })}
                      options={[
                        { 
                          value: 'basic', 
                          label: 'Basic', 
                          render: () => (
                            <div className="flex items-center justify-center">
                              <div className="size-8 rounded-full border border-primary bg-primary/20 flex items-center justify-center">
                                <div className="size-4 rounded-full bg-primary" />
                              </div>
                            </div>
                          ) 
                        },
                        { 
                          value: 'advanced', 
                          label: 'Advanced', 
                          render: () => (
                            <div className="flex items-center justify-center">
                              <div className="size-8 rounded-full border-2 border-primary overflow-hidden flex">
                                <div className="w-1/2 h-full bg-primary" />
                                <div className="w-1/2 h-full bg-transparent" />
                              </div>
                            </div>
                          ) 
                        },
                        { 
                          value: 'border', 
                          label: 'Border', 
                          render: () => (
                            <div className="flex items-center justify-center">
                              <div className="size-8 rounded-full border-[6px] border-primary" />
                            </div>
                          ) 
                        },
                      ]}
                    />
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Color Type">
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

                  <Separator className="opacity-30" />

                  <ControlGroup title="Accent Color">
                    <div className="grid grid-cols-8 gap-2">
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
                            <Check size={10} className="text-white mx-auto" strokeWidth={3} />
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
                      <div className="relative shrink-0 w-9 h-9 rounded-lg border border-border overflow-hidden">
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
                        className="h-9 text-xs font-mono uppercase flex-1"
                        placeholder="#1a2744"
                        maxLength={7}
                      />
                    </div>
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Apply Accent Color">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1">
                      <ToggleRow id="acc-name" label="Name" checked={s.applyAccentName} onCheckedChange={(v) => upd({ applyAccentName: v })} />
                      <ToggleRow id="acc-job"  label="Job title" checked={s.applyAccentJobTitle} onCheckedChange={(v) => upd({ applyAccentJobTitle: v })} />
                      <ToggleRow id="acc-head" label="Headings" checked={s.applyAccentHeadings} onCheckedChange={(v) => upd({ applyAccentHeadings: v })} />
                      <ToggleRow id="acc-line" label="Headings Line" checked={s.applyAccentHeadingLine} onCheckedChange={(v) => upd({ applyAccentHeadingLine: v })} />
                      <ToggleRow id="acc-icon" label="Header icons" checked={s.applyAccentHeaderIcons} onCheckedChange={(v) => upd({ applyAccentHeaderIcons: v })} />
                      <ToggleRow id="acc-dots" label="Dots/Bars/Bubbles" checked={s.applyAccentDotsBarsBubbles} onCheckedChange={(v) => upd({ applyAccentDotsBarsBubbles: v })} />
                      <ToggleRow id="acc-date" label="Dates" checked={s.applyAccentDates} onCheckedChange={(v) => upd({ applyAccentDates: v })} />
                      <ToggleRow id="acc-sub"  label="Entry subtitle" checked={s.applyAccentEntrySubtitle} onCheckedChange={(v) => upd({ applyAccentEntrySubtitle: v })} />
                      <ToggleRow id="acc-link" label="Link icons" checked={s.applyAccentLinkIcons} onCheckedChange={(v) => upd({ applyAccentLinkIcons: v })} />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-1">
                      Elements without an accent will use your <span className="font-semibold text-muted-foreground">Body Text</span> color.
                    </p>
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup 
                    title="Custom Element Colors"
                    rightElement={
                      <button
                        onClick={() => upd({
                          textColor: '#1a1a1a',
                          subtitleColor: '#4a5568',
                          dateColor: '#4a5568',
                          backgroundColor: '#ffffff',
                          headingColor: s.accentColor, // Sync to accent color if resetting in basic mode
                        })}
                        className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 hover:text-foreground transition-colors"
                      >
                        <RotateCcw size={10} />
                        RESET
                      </button>
                    }
                  >
                    <div className="space-y-2.5">
                      {[
                        { label: 'Background',  key: 'backgroundColor', val: s.backgroundColor, hide: false },
                        { label: 'Body Text',   key: 'textColor',       val: s.textColor,       hide: false },
                        { label: 'Headings',    key: 'headingColor',    val: s.headingColor,    hide: s.colorMode === 'basic' },
                        { label: 'Subtitles',   key: 'subtitleColor',   val: s.subtitleColor,   hide: false },
                        { label: 'Dates',       key: 'dateColor',       val: s.dateColor,       hide: false },
                      ].filter(c => !c.hide).map(({ label, key, val }) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-muted-foreground shrink-0">{label}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9px] font-mono text-muted-foreground/40 uppercase truncate">{val}</span>
                            <div className="relative w-7 h-7 rounded-lg border border-border overflow-hidden shrink-0">
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

                  <ControlGroup title="Background Presets">
                    <div className="grid grid-cols-6 gap-2">
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
                          onClick={() => upd({ backgroundColor: bg })}
                          className={cn(
                            'aspect-square rounded-lg border-2 transition-all hover:scale-110',
                            s.backgroundColor === bg ? 'border-primary ring-1 ring-primary/30' : 'border-border/60',
                          )}
                          style={{ backgroundColor: bg }}
                        />
                      ))}
                    </div>
                  </ControlGroup>
                </>
              )}

              {/* --------------- HEADER ------------------ */}
              {activeSection === 'header' && (
                <>
                  <ControlGroup title="Header Layout">
                    <div>
                      <FieldLabel>Text Alignment</FieldLabel>
                      <VisualSegmentGroup
                        columns={3}
                        value={s.headerAlignment}
                        onChange={(v) => {
                          const align = v as HeaderAlignment
                          const updates: Partial<ResumeSettings> = { 
                            headerAlignment: align,
                            detailsTextAlignment: align // Default text align to match header align
                          }
                          // Structural Rules:
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
                          { 
                            value: 'left',   
                            label: 'Left',   
                            render: () => (
                              <div className="flex flex-col gap-1.5 w-10">
                                <div className="h-1.5 w-full bg-current rounded-sm" />
                                <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                              </div>
                            ) 
                          },
                          { 
                            value: 'center', 
                            label: 'Center', 
                            render: () => (
                              <div className="flex flex-col items-center gap-1.5 w-10">
                                <div className="h-1.5 w-full bg-current rounded-sm" />
                                <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                              </div>
                            ) 
                          },
                          { 
                            value: 'right', 
                            label: 'Right', 
                            render: () => (
                              <div className="flex flex-col items-end gap-1.5 w-10">
                                <div className="h-1.5 w-full bg-current rounded-sm" />
                                <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                              </div>
                            ) 
                          },
                        ]}
                      />
                    </div>

                    {s.headerAlignment !== 'center' && (
                      <ToggleRow 
                        id="details-pos" 
                        label="Details beside name" 
                        description="Put contact info next to your name instead of below it"
                        checked={s.detailsPosition === 'beside'} 
                        onCheckedChange={(v) => {
                          const pos = v ? 'beside' : 'below'
                          const updates: Partial<ResumeSettings> = { detailsPosition: pos }
                          if (pos === 'beside' && s.detailsArrangement === 'wrap') {
                            updates.detailsArrangement = 'column'
                          }
                          upd(updates)
                        }}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <FieldLabel>Name Size</FieldLabel>
                        <Select value={s.nameSize} onValueChange={(v) => upd({ nameSize: v as NameSize })}>
                          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
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
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Contact Details">
                    <div>
                      <FieldLabel>Details Arrangement</FieldLabel>
                      <VisualSegmentGroup
                        columns={s.detailsPosition === 'beside' ? 2 : 3}
                        value={s.detailsArrangement}
                        onChange={(v) => upd({ detailsArrangement: v as DetailsArrangement })}
                        options={[
                          { 
                            value: 'column', 
                            label: 'Stack', 
                            render: () => (
                              <div className="flex flex-col gap-1 w-8">
                                <div className="h-1 w-full bg-current opacity-60 rounded-full" />
                                <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                                <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                              </div>
                            ) 
                          },
                          ...(s.detailsPosition !== 'beside' ? [
                            { 
                              value: 'wrap' as DetailsArrangement, 
                              label: 'Wrap', 
                              render: () => (
                                <div className="flex flex-col gap-1 w-10 px-1">
                                  <div className="flex gap-1">
                                    <div className="h-1 w-1/2 bg-current opacity-60 rounded-full" />
                                    <div className="h-1 w-1/2 bg-current opacity-40 rounded-full" />
                                  </div>
                                  <div className="h-1 w-1/3 bg-current opacity-20 rounded-full" />
                                </div>
                              ) 
                            }
                          ] : []),
                          { 
                            value: 'grid', 
                            label: 'Grid', 
                            render: () => (
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-10 px-1">
                                <div className="h-1 w-full bg-current opacity-60 rounded-full" />
                                <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                                <div className="h-1 w-full bg-current opacity-30 rounded-full" />
                                <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                              </div>
                            ) 
                          },
                        ]}
                      />
                    </div>

                    <div>
                      <FieldLabel>Details Text Alignment</FieldLabel>
                      <SegmentGroup
                        value={s.detailsTextAlignment}
                        onChange={(v) => upd({ detailsTextAlignment: v as DetailsTextAlignment })}
                        options={[
                          { value: 'left',   label: 'Left',   render: () => <AlignLeft   size={14} /> },
                          { value: 'center', label: 'Center', render: () => <AlignCenter size={14} /> },
                          { value: 'right',  label: 'Right',  render: () => <AlignRight  size={14} /> },
                        ]}
                      />
                    </div>

                    <div>
                      <FieldLabel>Delimiter</FieldLabel>
                      <VisualSegmentGroup
                        columns={4}
                        value={s.headerArrangement}
                        onChange={(v) => {
                          const arr = v as HeaderArrangement
                          const updates: Partial<ResumeSettings> = { headerArrangement: arr }
                          if (arr === 'icon') updates.contactIcons = true
                          upd(updates)
                        }}
                        options={[
                          { 
                            value: 'icon', 
                            label: 'Icon', 
                            render: () => (
                              <div className="flex flex-col items-center gap-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 opacity-70"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg>
                                <span className="text-[9px] font-bold">Icon</span>
                              </div>
                            ) 
                          },
                          { 
                            value: 'bullet', 
                            label: 'Bullet', 
                            render: () => (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="size-1.5 rounded-full bg-current opacity-70" />
                                <span className="text-[9px] font-bold">Bullet</span>
                              </div>
                            ) 
                          },
                          { 
                            value: 'verticalBar', 
                            label: 'Bar', 
                            render: () => (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-bold opacity-70">|</span>
                                <span className="text-[9px] font-bold">Bar</span>
                              </div>
                            ) 
                          },
                          { 
                            value: 'none', 
                            label: 'None', 
                            render: () => (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs font-bold opacity-30">Off</span>
                                <span className="text-[9px] font-bold">None</span>
                              </div>
                            ) 
                          },
                        ]}
                        showLabel={false}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <ToggleRow
                        id="contact-icons"
                        label="Show Icons"
                        checked={s.contactIcons}
                        onCheckedChange={(v) => upd({ contactIcons: v })}
                      />

                      {s.contactIcons && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <FieldLabel>Icon Style</FieldLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'none',             label: 'None' },
                              { id: 'circle-filled',    label: 'Circle', frame: 'circle' },
                              { id: 'rounded-filled',   label: 'Round',  frame: 'rounded' },
                              { id: 'square-filled',    label: 'Square', frame: 'square' },
                              { id: 'circle-outline',   label: 'C-Out',  frame: 'circle', outline: true },
                              { id: 'rounded-outline',  label: 'R-Out',  frame: 'rounded', outline: true },
                              { id: 'square-outline',   label: 'S-Out',  frame: 'square', outline: true },
                            ].map((style) => {
                              const active = s.contactIconStyle === style.id
                              const baseIcon = (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
                                  <path d="M11.767 3.166a6.411 6.411 0 019.067 9.067l-.001.001-1.716 1.717a1.558 1.558 0 11-2.204-2.204l1.717-1.717a3.295 3.295 0 10-4.659-4.66l-.002.002-1.716 1.716a1.558 1.558 0 01-2.204-2.204l1.717-1.717z" />
                                </svg>
                              )

                              return (
                                <button
                                  key={style.id}
                                  type="button"
                                  onClick={() => upd({ contactIconStyle: style.id as ContactIconStyle })}
                                  className="group flex flex-col items-center gap-1 cursor-pointer outline-none"
                                >
                                  <div className={cn(
                                    "w-full h-10 flex items-center justify-center rounded-xl border transition-all duration-200 relative overflow-hidden",
                                    active 
                                      ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_1px_inset_rgba(var(--primary),0.1)]" 
                                      : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:border-border hover:bg-muted/40"
                                  )}>
                                    {style.id === 'none' ? (
                                      baseIcon
                                    ) : (
                                      <div className={cn(
                                        "size-5 flex items-center justify-center",
                                        style.frame === 'circle' && "rounded-full",
                                        style.frame === 'rounded' && "rounded-[3px]",
                                        style.frame === 'square' && "rounded-none",
                                        style.outline 
                                          ? "border border-current bg-transparent" 
                                          : "bg-current"
                                      )}>
                                        <div className={cn("scale-75", !style.outline && (active ? "text-primary-foreground" : "text-background"))}>
                                          {baseIcon}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-tight transition-colors",
                                    active ? "text-primary" : "text-muted-foreground/40"
                                  )}>
                                    {style.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Photo">
                    <ToggleRow 
                      id="show-photo" 
                      label="Show Photo" 
                      checked={s.photoEnabled} 
                      onCheckedChange={(v) => upd({ photoEnabled: v })}
                    />

                    {s.photoEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>Size</FieldLabel>
                            <SegmentGroup
                              value={s.photoSize}
                              onChange={(v) => upd({ photoSize: v as PhotoSize })}
                              options={[
                                { value: 'S', label: 'Small',  render: () => <span className="text-[10px] font-bold">S</span> },
                                { value: 'M', label: 'Medium', render: () => <span className="text-[10px] font-bold">M</span> },
                              ]}
                            />
                          </div>
                          <div>
                            <FieldLabel>Shape</FieldLabel>
                            <SegmentGroup
                              value={s.photoShape}
                              onChange={(v) => upd({ photoShape: v as PhotoShape })}
                              options={[
                                { value: 'circle',  label: 'Circle',  render: () => <div className="w-3 h-3 rounded-full bg-current opacity-40" /> },
                                { value: 'rounded', label: 'Rounded', render: () => <div className="w-3 h-3 rounded-sm bg-current opacity-40" /> },
                              ]}
                            />
                          </div>
                        </div>

                        {s.headerAlignment === 'center' && (
                          <div>
                            <FieldLabel>Position</FieldLabel>
                            <SegmentGroup
                              value={s.photoPosition === 'beside' ? 'top' : s.photoPosition}
                              onChange={(v) => upd({ photoPosition: v as PhotoPosition })}
                              options={[
                                { value: 'top',    label: 'Above', render: () => <span className="text-[10px] font-bold">Above</span> },
                                { value: 'bottom', label: 'Below', render: () => <span className="text-[10px] font-bold">Below</span> },
                              ]}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Footer">
                    <div className="space-y-0.5">
                      <ToggleRow id="footer-pages" label="Page numbers"   checked={s.footerPageNumbers} onCheckedChange={(v) => upd({ footerPageNumbers: v })} />
                      <ToggleRow id="footer-name"  label="Name in footer" checked={s.footerName}        onCheckedChange={(v) => upd({ footerName: v })} />
                      <ToggleRow id="footer-email" label="Email in footer" checked={s.footerEmail}      onCheckedChange={(v) => upd({ footerEmail: v })} />
                    </div>
                  </ControlGroup>
                </>
              )}

              {/* --------------- SECTIONS ------------------ */}
              {activeSection === 'sections' && (
                <>
                  <ControlGroup title="Section Headings">
                    <ToggleRow
                      id="show-labels"
                      label="Show section labels"
                      checked={s.showSectionLabels}
                      onCheckedChange={(v) => upd({ showSectionLabels: v })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Size</FieldLabel>
                        <Select value={s.sectionHeadingSize} onValueChange={(v) => upd({ sectionHeadingSize: v as SectionHeadingSize })}>
                          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
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
                        <Select value={s.sectionHeadingCapitalization} onValueChange={(v) => upd({ sectionHeadingCapitalization: v as SectionHeadingCapitalization })}>
                          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uppercase">Uppercase</SelectItem>
                            <SelectItem value="capitalize">Capitalize</SelectItem>
                            <SelectItem value="none">As typed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Decoration Style</FieldLabel>
                      <div className="grid grid-cols-4 gap-1.5">
                        {HEADING_STYLES.map((style) => (
                          <HeadingStyleButton
                            key={style.id}
                            style={style}
                            active={s.sectionHeadingStyle === style.id}
                            onClick={() => upd({ sectionHeadingStyle: style.id })}
                            accentColor={s.accentColor}
                          />
                        ))}
                      </div>
                    </div>

                    {headingHasLine && (
                      <SliderRow
                        label="Line Thickness"
                        value={s.sectionHeadingLineThickness}
                        display={`${s.sectionHeadingLineThickness}pt`}
                        min={0.5} max={4} step={0.5}
                        onChange={(v) => upd({ sectionHeadingLineThickness: v })}
                      />
                    )}

                    <div>
                      <FieldLabel>Icon</FieldLabel>
                      <SegmentGroup
                        value={s.sectionHeadingIcon || 'none'}
                        onChange={(v) => upd({ sectionHeadingIcon: v as SectionHeadingIcon })}
                        options={[
                          { value: 'none',   label: 'None',   render: () => <span className="text-[10px] font-semibold leading-none">Off</span> },
                          { value: 'simple', label: 'Simple', render: () => <span className="text-[10px] font-semibold leading-none">Stroke</span> },
                          { value: 'filled', label: 'Filled', render: () => <span className="text-[10px] font-semibold leading-none">Fill</span> },
                          { value: 'knockout', label: 'Knockout', render: () => <span className="text-[10px] font-semibold leading-none">Box</span> },
                        ]}
                      />
                    </div>

                    {(s.sectionHeadingIcon && s.sectionHeadingIcon !== 'none') && (
                      <SliderRow
                        label="Icon Size"
                        value={s.sectionHeadingIconSize || 1.0}
                        display={`x${(s.sectionHeadingIconSize || 1.0).toFixed(1)}`}
                        min={0.6} max={1.8} step={0.1}
                        onChange={(v) => upd({ sectionHeadingIconSize: v })}
                      />
                    )}
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Skills">
                    <div>
                      <FieldLabel>Display Style</FieldLabel>
                      <Select value={s.skillDisplay} onValueChange={(v) => upd({ skillDisplay: v as SkillDisplayOption })}>
                        <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact (inline list)</SelectItem>
                          <SelectItem value="grid">Grid (columns)</SelectItem>
                          <SelectItem value="level">With Levels</SelectItem>
                          <SelectItem value="bubble">Bubbles / Tags</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {s.skillDisplay === 'grid' && (
                      <div>
                        <FieldLabel>Grid Columns</FieldLabel>
                        <SegmentGroup
                          value={String(s.skillColumns ?? 3) as '2' | '3' | '4'}
                          onChange={(v) => upd({ skillColumns: Number(v) as 2 | 3 | 4 })}
                          options={[
                            { value: '2', label: '2 cols', render: () => <span className="text-xs font-bold leading-none">2</span> },
                            { value: '3', label: '3 cols', render: () => <span className="text-xs font-bold leading-none">3</span> },
                            { value: '4', label: '4 cols', render: () => <span className="text-xs font-bold leading-none">4</span> },
                          ]}
                        />
                      </div>
                    )}
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Entry Order">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Experience</FieldLabel>
                        <Select value={s.experienceOrder} onValueChange={(v) => upd({ experienceOrder: v as ExperienceOrder })}>
                          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title-employer">Title first</SelectItem>
                            <SelectItem value="employer-title">Company first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Education</FieldLabel>
                        <Select value={s.educationOrder} onValueChange={(v) => upd({ educationOrder: v as EducationOrder })}>
                          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="degree-school">Degree first</SelectItem>
                            <SelectItem value="school-degree">School first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Links & Misc">
                    <div className="space-y-0.5">
                      <ToggleRow id="link-underline"  label="Underline links"     checked={s.linkUnderline}  onCheckedChange={(v) => upd({ linkUnderline: v })} />
                      <ToggleRow id="link-blue"       label="Blue links"          checked={s.linkBlue}       onCheckedChange={(v) => upd({ linkBlue: v })} />
                      <ToggleRow id="group-promo"     label="Group promotions"    checked={s.groupPromotions} onCheckedChange={(v) => upd({ groupPromotions: v })}
                        description="Stack same-company jobs under one heading"
                      />
                    </div>
                  </ControlGroup>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
