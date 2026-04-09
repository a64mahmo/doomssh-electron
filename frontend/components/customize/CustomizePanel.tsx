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
} from 'lucide-react'
import {
  FontOption, DateFormat, PaperSize, ColumnLayout, ListStyle,
  SubtitleStyle, SubtitlePlacement, SectionHeadingSize, SectionHeadingCapitalization,
  SectionHeadingIcon, HeaderAlignment, HeaderArrangement, NameSize, ColorMode,
  SkillDisplayOption, EducationOrder, ExperienceOrder, SectionHeadingStyle,
  PhotoSize, PhotoShape, PhotoPosition, ContactLayout,
  DEFAULT_SETTINGS,
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

// ── Constants ─────────────────────────────────────────────────────────────────

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
  { id: 'colors',    label: 'Colors',     icon: Palette },
  { id: 'header',    label: 'Header',     icon: HeaderIcon },
  { id: 'sections',  label: 'Sections',   icon: Settings2 },
] as const

type PanelSectionId = typeof PANEL_SECTIONS[number]['id']

// ── Drag & Drop ───────────────────────────────────────────────────────────────

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

// ── Heading style visual ──────────────────────────────────────────────────────

const HEADING_STYLES: { id: SectionHeadingStyle; label: string }[] = [
  { id: 'none',       label: 'None'     },
  { id: 'underline',  label: 'Under'    },
  { id: 'overline',   label: 'Over'     },
  { id: 'top-bottom', label: 'Both'     },
  { id: 'left-bar',   label: 'Left bar' },
  { id: 'box',        label: 'Box'      },
  { id: 'background', label: 'Fill'     },
]

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

// ── Main Panel ────────────────────────────────────────────────────────────────

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

      {/* ── Icon Nav ──────────────────────────────────────────────── */}
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

      {/* ── Content ───────────────────────────────────────────────── */}
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

              {/* ═══════════════ TEMPLATES ═══════════════════════════ */}
              {activeSection === 'templates' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {TEMPLATE_IDS.map((id) => {
                    const meta = TEMPLATE_META[id]
                    const active = resume.template === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          if (id === 'custom') return
                          const overrides = getTemplateSettings(id)
                          // Complete overwrite: start with DEFAULT_SETTINGS, then apply overrides
                          setResume({ ...resume, template: id, settings: { ...DEFAULT_SETTINGS, ...overrides } })
                        }}                        className={cn(
                          'group relative aspect-[3/4] rounded-xl border-2 overflow-hidden flex flex-col transition-all',
                          active
                            ? 'border-foreground shadow-lg ring-2 ring-foreground/10'
                            : 'border-border hover:border-foreground/40 shadow-sm',
                          id === 'custom' && !active && 'opacity-50 pointer-events-none grayscale',
                        )}
                      >
                        {/* Accent stripe at top */}
                        <div
                          className="h-2 w-full shrink-0"
                          style={{ backgroundColor: s.accentColor }}
                        />
                        {/* Skeleton preview */}
                        <div className="flex-1 bg-background p-2 space-y-1.5">
                          <div className="h-1.5 bg-foreground/15 rounded-full w-2/3" />
                          <div className="h-px bg-foreground/8 rounded-full w-full" />
                          {[0.9, 0.75, 0.85, 0.6, 0.8].map((w, i) => (
                            <div key={i} className="h-px rounded-full bg-foreground/8" style={{ width: `${w * 100}%` }} />
                          ))}
                          <div className="h-px bg-muted rounded-full w-full mt-0.5" />
                          {[0.7, 0.55, 0.65].map((w, i) => (
                            <div key={i} className="h-px rounded-full bg-foreground/8" style={{ width: `${w * 100}%` }} />
                          ))}
                        </div>
                        {/* Label */}
                        <div className="bg-muted/60 px-2 py-1.5 border-t border-border">
                          <p className="text-[10px] font-bold text-center tracking-tight">
                            {meta.label}
                          </p>
                        </div>
                        {/* Active badge */}
                        {active && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-foreground text-background rounded-full flex items-center justify-center">
                            <Check size={9} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ═══════════════ LAYOUT ══════════════════════════════ */}
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>Paper Size</FieldLabel>
                        <Select value={s.paperSize} onValueChange={(v) => upd({ paperSize: v as PaperSize })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="letter">US Letter</SelectItem>
                            <SelectItem value="a4">A4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Date Format</FieldLabel>
                        <Select value={s.dateFormat} onValueChange={(v) => upd({ dateFormat: v as DateFormat })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                      label="Entry Spacing" value={s.entrySpacing} display={`×${s.entrySpacing.toFixed(1)}`}
                      min={0.5} max={2.0} step={0.1} onChange={(v) => upd({ entrySpacing: v })}
                    />
                    <SliderRow
                      label="Section Spacing" value={s.sectionSpacing ?? 1.0} display={`×${(s.sectionSpacing ?? 1.0).toFixed(1)}`}
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

              {/* ═══════════════ TYPOGRAPHY ══════════════════════════ */}
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

                  <Separator className="opacity-30" />

                  <ControlGroup title="Entry Layout">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Title Size</FieldLabel>
                        <SegmentGroup
                          value={s.titleSize}
                          onChange={(v) => upd({ titleSize: v as 'S' | 'M' | 'L' })}
                          options={[
                            { value: 'S', label: 'Small',  render: () => <span className="text-[10px] font-bold leading-none">S</span> },
                            { value: 'M', label: 'Medium', render: () => <span className="text-xs  font-bold leading-none">M</span> },
                            { value: 'L', label: 'Large',  render: () => <span className="text-sm  font-bold leading-none">L</span> },
                          ]}
                        />
                      </div>
                      <div>
                        <FieldLabel>Subtitle Style</FieldLabel>
                        <SegmentGroup
                          value={s.subtitleStyle}
                          onChange={(v) => upd({ subtitleStyle: v as SubtitleStyle })}
                          options={[
                            { value: 'normal', label: 'Normal', render: () => <span className="text-xs leading-none">N</span> },
                            { value: 'bold',   label: 'Bold',   render: () => <span className="text-xs font-bold leading-none">B</span> },
                            { value: 'italic', label: 'Italic', render: () => <span className="text-xs italic font-serif leading-none">I</span> },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Bullet Character</FieldLabel>
                      <SegmentGroup
                        value={s.listStyle}
                        onChange={(v) => upd({ listStyle: v as ListStyle })}
                        options={[
                          { value: 'bullet', label: 'Bullet', render: () => <span className="leading-none">•  Bullet</span> },
                          { value: 'dash',   label: 'Dash',   render: () => <span className="leading-none">—  Dash</span> },
                          { value: 'hyphen', label: 'Hyphen', render: () => <span className="leading-none">-  Hyphen</span> },
                        ]}
                      />
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

                    <div className="space-y-0.5">
                      <ToggleRow id="title-bold"  label="Bold entry titles" checked={s.titleBold !== false} onCheckedChange={(v) => upd({ titleBold: v })} />
                      <ToggleRow id="indent-body" label="Indent body text"  checked={s.indentBody}          onCheckedChange={(v) => upd({ indentBody: v })} />
                    </div>
                  </ControlGroup>
                </>
              )}

              {/* ═══════════════ COLORS ══════════════════════════════ */}
              {activeSection === 'colors' && (
                <>
                  <ControlGroup title="Mode">
                    <SegmentGroup
                      value={s.colorMode}
                      onChange={(v) => upd({ colorMode: v as ColorMode })}
                      options={[
                        { value: 'basic', label: 'Classic',  render: () => <span className="text-[10px] font-semibold leading-none">Classic</span> },
                        { value: 'multi', label: 'Enhanced', render: () => <span className="text-[10px] font-semibold leading-none">Enhanced</span> },
                      ]}
                    />
                    {s.colorMode === 'basic' && (
                      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                        One accent color drives the whole palette.
                      </p>
                    )}
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
                              ? 'ring-2 ring-offset-2 ring-foreground scale-105'
                              : 'ring-1 ring-border/50',
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {s.accentColor === color && (
                            <Check size={10} className="text-white mx-auto" strokeWidth={3} />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
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

                  {s.colorMode === 'multi' && (
                    <>
                      <Separator className="opacity-30" />

                      <ControlGroup title="Element Colors">
                        <div className="space-y-2.5">
                          {[
                            { label: 'Background',  key: 'backgroundColor', val: s.backgroundColor },
                            { label: 'Body Text',   key: 'textColor',       val: s.textColor       },
                            { label: 'Headings',    key: 'headingColor',    val: s.headingColor    },
                            { label: 'Subtitles',   key: 'subtitleColor',   val: s.subtitleColor   },
                            { label: 'Dates',       key: 'dateColor',       val: s.dateColor       },
                          ].map(({ label, key, val }) => (
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
                                s.backgroundColor === bg ? 'border-foreground ring-1 ring-foreground/30' : 'border-border/60',
                              )}
                              style={{ backgroundColor: bg }}
                            />
                          ))}
                        </div>
                      </ControlGroup>
                    </>
                  )}
                </>
              )}

              {/* ═══════════════ HEADER ══════════════════════════════ */}
              {activeSection === 'header' && (
                <>
                  <ControlGroup title="Name">
                    <div>
                      <FieldLabel>Name Size</FieldLabel>
                      <SegmentGroup
                        value={s.nameSize}
                        onChange={(v) => upd({ nameSize: v as NameSize })}
                        options={[
                          { value: 'XS', label: 'XS', render: () => <span className="text-[9px]  font-bold leading-none">XS</span> },
                          { value: 'S',  label: 'S',  render: () => <span className="text-[10px] font-bold leading-none">S</span>  },
                          { value: 'M',  label: 'M',  render: () => <span className="text-[11px] font-bold leading-none">M</span>  },
                          { value: 'L',  label: 'L',  render: () => <span className="text-[12px] font-bold leading-none">L</span>  },
                          { value: 'XL', label: 'XL', render: () => <span className="text-[13px] font-bold leading-none">XL</span> },
                        ]}
                      />
                    </div>
                    <ToggleRow id="name-bold"  label="Bold name"   checked={s.nameBold}      onCheckedChange={(v) => upd({ nameBold: v })} />
                    <ToggleRow id="show-photo" label="Show photo"  checked={s.photoEnabled}  onCheckedChange={(v) => upd({ photoEnabled: v })}
                      description="Photo upload available in the content panel"
                    />

                    {s.photoEnabled && (
                      <>
                        <div>
                          <FieldLabel>Photo Size</FieldLabel>
                          <SegmentGroup
                            value={s.photoSize}
                            onChange={(v) => upd({ photoSize: v as PhotoSize })}
                            options={[
                              { value: 'S',  label: 'Small',  render: () => <span className="text-[10px] font-bold leading-none">S</span> },
                              { value: 'M',  label: 'Medium', render: () => <span className="text-[11px] font-bold leading-none">M</span> },
                              { value: 'L',  label: 'Large',  render: () => <span className="text-[12px] font-bold leading-none">L</span> },
                              { value: 'XL', label: 'XL',     render: () => <span className="text-[13px] font-bold leading-none">XL</span> },
                            ]}
                          />
                        </div>

                        <div>
                          <FieldLabel>Photo Shape</FieldLabel>
                          <SegmentGroup
                            value={s.photoShape}
                            onChange={(v) => upd({ photoShape: v as PhotoShape })}
                            options={[
                              { value: 'circle',  label: 'Circle',  render: () => <div className="w-3.5 h-3.5 rounded-full bg-current opacity-40" /> },
                              { value: 'rounded', label: 'Rounded', render: () => <div className="w-3.5 h-3.5 rounded-md bg-current opacity-40" /> },
                              { value: 'square',  label: 'Square',  render: () => <div className="w-3.5 h-3.5 bg-current opacity-40" /> },
                            ]}
                          />
                        </div>
                      </>
                    )}
                  </ControlGroup>

                  <Separator className="opacity-30" />

                  <ControlGroup title="Alignment">
                    <SegmentGroup
                      value={s.headerAlignment}
                      onChange={(v) => upd({ headerAlignment: v as HeaderAlignment })}
                      options={[
                        { value: 'left',   label: 'Left',   render: () => <AlignLeft   size={14} /> },
                        { value: 'center', label: 'Center', render: () => <AlignCenter size={14} /> },
                        { value: 'right',  label: 'Right',  render: () => <AlignRight  size={14} /> },
                      ]}
                    />
                  </ControlGroup>

                  {s.photoEnabled && (
                    <>
                      <Separator className="opacity-30" />
                      <ControlGroup title="Photo Placement">
                        <div>
                          <FieldLabel>Position</FieldLabel>
                          <Select value={s.photoPosition} onValueChange={(v) => upd({ photoPosition: v as PhotoPosition })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beside-name">Beside Name</SelectItem>
                              <SelectItem value="top-center">Top Center</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </ControlGroup>
                    </>
                  )}

                  <Separator className="opacity-30" />

                  <ControlGroup title="Contact Info">
                    <div>
                      <FieldLabel>Separator</FieldLabel>
                      <Select value={s.headerArrangement} onValueChange={(v) => upd({ headerArrangement: v as HeaderArrangement })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pipe">Pipes  ( | )</SelectItem>
                          <SelectItem value="bullet">Bullets ( • )</SelectItem>
                          <SelectItem value="bar">Bar  ( / )</SelectItem>
                          <SelectItem value="icon">Icons only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FieldLabel>Layout</FieldLabel>
                      <SegmentGroup
                        value={s.contactLayout}
                        onChange={(v) => upd({ contactLayout: v as ContactLayout })}
                        options={[
                          { value: 'inline',    label: 'Inline',  render: () => <span className="text-[10px] font-semibold leading-none">Wrap</span> },
                          { value: 'columns-2', label: '2 Cols',  render: () => <Grid2X2 size={13} /> },
                          { value: 'columns-3', label: '3 Cols',  render: () => <Grid3X3 size={13} /> },
                        ]}
                      />
                    </div>

                    <ToggleRow
                      id="contact-icons"
                      label="Show icons"
                      description="Display an icon next to each contact item"
                      checked={s.contactIcons}
                      onCheckedChange={(v) => upd({ contactIcons: v })}
                    />
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

              {/* ═══════════════ SECTIONS ════════════════════════════ */}
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
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                        display={`×${(s.sectionHeadingIconSize || 1.0).toFixed(1)}`}
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
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title-employer">Title first</SelectItem>
                            <SelectItem value="employer-title">Company first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Education</FieldLabel>
                        <Select value={s.educationOrder} onValueChange={(v) => upd({ educationOrder: v as EducationOrder })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
