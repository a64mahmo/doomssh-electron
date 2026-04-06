'use client'
import { useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useResume } from '@/hooks/useResume'
import { TEMPLATE_META, getTemplateSettings } from '@/components/templates'
import type {
  FontOption, DateFormat, PaperSize, ColumnLayout, ListStyle,
  SubtitleStyle, SubtitlePlacement, SectionHeadingSize, SectionHeadingCapitalization,
  SectionHeadingIcon, HeaderAlignment, HeaderArrangement, NameSize, ColorMode,
  SkillDisplayOption, EducationOrder, ExperienceOrder,
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
import { GripVertical } from 'lucide-react'

const TEMPLATE_IDS = Object.keys(TEMPLATE_META) as TemplateId[]

const FONTS: FontOption[] = [
  'Inter', 'Lato', 'Roboto', 'Source Sans Pro', 'Raleway',
  'Merriweather', 'Playfair Display', 'IBM Plex Serif',
]

const ACCENT_PRESETS = [
  '#18181b', '#1e3a5f', '#4f46e5', '#7c3aed',
  '#dc2626', '#d97706', '#059669', '#0891b2',
]

const SECTIONS = [
  { id: 'basics',   label: 'Basics' },
  { id: 'layout',   label: 'Layout' },
  { id: 'design',   label: 'Design' },
  { id: 'header',   label: 'Header' },
  { id: 'sections', label: 'Sections' },
] as const

// ── Small helpers ─────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-4">
      {children}
    </p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="block text-xs text-muted-foreground mb-1.5">{children}</Label>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 mb-5">{children}</div>
}

function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-2.5 py-0.5 rounded border text-xs font-medium transition-all',
            value === o.value
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-transparent',
          )}
        >
          {o.label}
        </button>
      ))}
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
    <div className="flex items-center justify-between py-0.5">
      <Label className="text-xs font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="scale-90" />
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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded-md shadow-sm mb-1.5 touch-none"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
        <GripVertical size={12} />
      </div>
      <span className="text-[10px] font-medium truncate select-none">{title}</span>
    </div>
  )
}

function DroppableColumn({ id, title, items, resumeSections }: { id: string; title: string; items: string[]; resumeSections: any[] }) {
  const { setNodeRef } = useSortable({ id })

  return (
    <div className="flex-1 min-w-0">
      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</div>
      <div
        ref={setNodeRef}
        className="min-h-[100px] p-2 rounded-lg bg-muted/30 border border-dashed border-border/60"
      >
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

// ── Main panel ────────────────────────────────────────────────────────────────

export function CustomizePanel() {
  const { resume, updateSettings, setResume } = useResume()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!resume) return null
  const s = resume.settings

  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const sections = resume.sections.filter(sec => sec.type !== 'header')
  
  const mainIds = sections.filter(sec => {
    const col = s.sectionColumns?.[sec.id]
    if (col) return col === 'main'
    return !sidebarTypes.includes(sec.type)
  }).map(s => s.id)

  const sidebarIds = sections.filter(sec => {
    const col = s.sectionColumns?.[sec.id]
    if (col) return col === 'sidebar'
    return sidebarTypes.includes(sec.type)
  }).map(s => s.id)

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
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
    setActiveId(null)
  }

  function scrollTo(id: string) {
    const el = scrollRef.current?.querySelector(`#style-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function slider(key: keyof typeof s) {
    return (v: number | readonly number[]) =>
      updateSettings({ [key]: Array.isArray(v) ? v[0] : v } as never)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky anchor nav ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 flex items-center gap-0 px-4 border-b border-border bg-background shrink-0 h-9 overflow-x-auto">
        {SECTIONS.map((sec, i) => (
          <span key={sec.id} className="flex items-center shrink-0">
            {i > 0 && <span className="text-border text-xs mx-1.5 select-none">·</span>}
            <button
              onClick={() => scrollTo(sec.id)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 whitespace-nowrap"
            >
              {sec.label}
            </button>
          </span>
        ))}
      </nav>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 pb-16 space-y-0">

          {/* ───────────────── BASICS ───────────────────────────── */}
          <section id="style-basics" className="pt-5 scroll-mt-9">
            <SectionHeading>Basics</SectionHeading>

            <Row>
              <div>
                <FieldLabel>Language</FieldLabel>
                <Select value={s.language} onValueChange={(v) => v && updateSettings({ language: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel>Date Format</FieldLabel>
                <Select value={s.dateFormat} onValueChange={(v) => v && updateSettings({ dateFormat: v as DateFormat })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM YYYY">MMM YYYY</SelectItem>
                    <SelectItem value="MM/YYYY">MM/YYYY</SelectItem>
                    <SelectItem value="MMMM YYYY">MMMM YYYY</SelectItem>
                    <SelectItem value="YYYY MMM DD">YYYY MMM DD</SelectItem>
                    <SelectItem value="YYYY">YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel>Page Size</FieldLabel>
                <Pills
                  value={s.paperSize}
                  onChange={(v) => updateSettings({ paperSize: v as PaperSize })}
                  options={[{ value: 'letter', label: 'US Letter' }, { value: 'a4', label: 'A4' }]}
                />
              </div>
            </Row>

            <FieldLabel>Templates</FieldLabel>
            <div className="grid grid-cols-3 gap-2 mb-5">
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
                    'aspect-[3/4] rounded-lg border-2 overflow-hidden transition-all',
                    resume.template === id
                      ? 'border-foreground shadow-sm'
                      : 'border-border hover:border-foreground/30',
                  )}
                >
                  <div className="w-full h-full bg-muted flex flex-col justify-end p-1.5">
                    <span className="text-[9px] font-medium text-muted-foreground text-center truncate block">
                      {TEMPLATE_META[id].label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* ───────────────── LAYOUT ───────────────────────────── */}
          <section id="style-layout" className="pt-5 scroll-mt-9">
            <SectionHeading>Layout</SectionHeading>

            <Row>
              <div>
                <FieldLabel>Columns</FieldLabel>
                <Pills
                  value={s.columnLayout}
                  onChange={(v) => updateSettings({ columnLayout: v as ColumnLayout })}
                  options={[
                    { value: 'one', label: 'One' },
                    { value: 'two', label: 'Two' },
                    { value: 'mix', label: 'Mix' },
                  ]}
                />
              </div>

              <div>
                <FieldLabel>Font Size — {s.fontSize}pt</FieldLabel>
                <Slider min={8} max={13} step={0.5} value={[s.fontSize || 10.5]} onValueChange={slider('fontSize')} />
              </div>

              <div>
                <FieldLabel>Line Height — {s.lineHeight}</FieldLabel>
                <Slider min={1.0} max={2.2} step={0.05} value={[s.lineHeight || 1.5]} onValueChange={slider('lineHeight')} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>H. Margin (mm)</FieldLabel>
                  <Input
                    type="number" className="h-8 text-xs"
                    value={s.marginHorizontal} min={5} max={40}
                    onChange={(e) => updateSettings({ marginHorizontal: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <FieldLabel>V. Margin (mm)</FieldLabel>
                  <Input
                    type="number" className="h-8 text-xs"
                    value={s.marginVertical} min={5} max={40}
                    onChange={(e) => updateSettings({ marginVertical: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Entry Spacing — {s.entrySpacing.toFixed(1)}</FieldLabel>
                <Slider min={0.5} max={2.0} step={0.1} value={[s.entrySpacing]} onValueChange={slider('entrySpacing')} />
              </div>
            </Row>

            <SectionHeading>Section Columns</SectionHeading>
            <div className="mb-6">
              {s.columnLayout === 'one' ? (
                <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center">
                  <p className="text-[10px] text-muted-foreground italic">
                    One-column layout ignores column assignments.
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
                    {activeId ? (
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-background border-2 border-primary rounded-md shadow-xl opacity-90 scale-105">
                        <GripVertical size={12} className="text-primary" />
                        <span className="text-[10px] font-bold truncate">
                          {sections.find(s => s.id === activeId)?.title}
                        </span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>

            <SectionHeading>Entry Layout</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Title Size</FieldLabel>
                <Pills
                  value={s.titleSize}
                  onChange={(v) => updateSettings({ titleSize: v as 'S' | 'M' | 'L' })}
                  options={[{ value: 'S', label: 'S' }, { value: 'M', label: 'M' }, { value: 'L', label: 'L' }]}
                />
              </div>
              <div>
                <FieldLabel>Subtitle Style</FieldLabel>
                <Pills
                  value={s.subtitleStyle}
                  onChange={(v) => updateSettings({ subtitleStyle: v as SubtitleStyle })}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'bold', label: 'Bold' },
                    { value: 'italic', label: 'Italic' },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Subtitle Placement</FieldLabel>
                <Pills
                  value={s.subtitlePlacement}
                  onChange={(v) => updateSettings({ subtitlePlacement: v as SubtitlePlacement })}
                  options={[
                    { value: 'same-line', label: 'Same Line' },
                    { value: 'next-line', label: 'Next Line' },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>List Style</FieldLabel>
                <Pills
                  value={s.listStyle}
                  onChange={(v) => updateSettings({ listStyle: v as ListStyle })}
                  options={[
                    { value: 'bullet', label: '• Bullet' },
                    { value: 'dash', label: '— Dash' },
                    { value: 'hyphen', label: '- Hyphen' },
                  ]}
                />
              </div>
              <ToggleRow label="Indent body" checked={s.indentBody} onCheckedChange={(v) => updateSettings({ indentBody: v })} />
            </Row>
          </section>

          <Separator />

          {/* ───────────────── DESIGN ───────────────────────────── */}
          <section id="style-design" className="pt-5 scroll-mt-9">
            <SectionHeading>Design</SectionHeading>

            <SectionHeading>Font</SectionHeading>
            <Row>
              <div className="grid grid-cols-2 gap-1">
                {FONTS.map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSettings({ fontFamily: f })}
                    className={cn(
                      'px-2 py-1.5 rounded border text-xs text-left transition-all',
                      s.fontFamily === f
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Row>

            <SectionHeading>Colors</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Mode</FieldLabel>
                <Pills
                  value={s.colorMode}
                  onChange={(v) => updateSettings({ colorMode: v as ColorMode })}
                  options={[{ value: 'basic', label: 'Basic' }, { value: 'multi', label: 'Multi' }]}
                />
              </div>
              <div>
                <FieldLabel>Accent</FieldLabel>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateSettings({ accentColor: color })}
                      title={color}
                      className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                      style={{
                        backgroundColor: color,
                        borderColor: s.accentColor === color ? 'hsl(var(--foreground))' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={s.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-border p-0.5 bg-transparent shrink-0"
                  />
                  <Input
                    value={s.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="h-8 text-xs font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {s.colorMode === 'multi' && (
                <>
                  {[
                    { label: 'Text', key: 'textColor', val: s.textColor },
                    { label: 'Background', key: 'backgroundColor', val: s.backgroundColor },
                    { label: 'Headings', key: 'headingColor', val: s.headingColor },
                    { label: 'Dates', key: 'dateColor', val: s.dateColor },
                    { label: 'Subtitle', key: 'subtitleColor', val: s.subtitleColor },
                  ].map(({ label, key, val }) => (
                    <div key={key}>
                      <FieldLabel>{label}</FieldLabel>
                      <div className="flex gap-2">
                        <input
                          type="color" value={val}
                          onChange={(e) => updateSettings({ [key]: e.target.value } as never)}
                          className="w-8 h-8 rounded cursor-pointer border border-border p-0.5 bg-transparent shrink-0"
                        />
                        <Input
                          value={val}
                          onChange={(e) => updateSettings({ [key]: e.target.value } as never)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </Row>

            <SectionHeading>Section Headings</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Size</FieldLabel>
                <Pills
                  value={s.sectionHeadingSize}
                  onChange={(v) => updateSettings({ sectionHeadingSize: v as SectionHeadingSize })}
                  options={[
                    { value: 'S', label: 'S' }, { value: 'M', label: 'M' },
                    { value: 'L', label: 'L' }, { value: 'XL', label: 'XL' },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Capitalization</FieldLabel>
                <Pills
                  value={s.sectionHeadingCapitalization}
                  onChange={(v) => updateSettings({ sectionHeadingCapitalization: v as SectionHeadingCapitalization })}
                  options={[
                    { value: 'capitalize', label: 'Capitalize' },
                    { value: 'uppercase', label: 'Uppercase' },
                    { value: 'none', label: 'None' },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Icons</FieldLabel>
                <Pills
                  value={s.sectionHeadingIcon}
                  onChange={(v) => updateSettings({ sectionHeadingIcon: v as SectionHeadingIcon })}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'outline', label: 'Outline' },
                    { value: 'filled', label: 'Filled' },
                  ]}
                />
              </div>
            </Row>
          </section>

          <Separator />

          {/* ───────────────── HEADER ───────────────────────────── */}
          <section id="style-header" className="pt-5 scroll-mt-9">
            <SectionHeading>Header</SectionHeading>

            <Row>
              <div>
                <FieldLabel>Alignment</FieldLabel>
                <Pills
                  value={s.headerAlignment}
                  onChange={(v) => updateSettings({ headerAlignment: v as HeaderAlignment })}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Arrangement</FieldLabel>
                <Pills
                  value={s.headerArrangement}
                  onChange={(v) => updateSettings({ headerArrangement: v as HeaderArrangement })}
                  options={[
                    { value: 'icon', label: 'Icon' },
                    { value: 'bullet', label: 'Bullet' },
                    { value: 'pipe', label: '|' },
                    { value: 'bar', label: 'Bar' },
                  ]}
                />
              </div>
            </Row>

            <SectionHeading>Name</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Size</FieldLabel>
                <Pills
                  value={s.nameSize}
                  onChange={(v) => updateSettings({ nameSize: v as NameSize })}
                  options={[
                    { value: 'XS', label: 'XS' }, { value: 'S', label: 'S' },
                    { value: 'M', label: 'M' }, { value: 'L', label: 'L' }, { value: 'XL', label: 'XL' },
                  ]}
                />
              </div>
              <ToggleRow label="Bold name" checked={s.nameBold} onCheckedChange={(v) => updateSettings({ nameBold: v })} />
              <ToggleRow label="Show section labels" checked={s.showSectionLabels} onCheckedChange={(v) => updateSettings({ showSectionLabels: v })} />
            </Row>
          </section>

          <Separator />

          {/* ───────────────── SECTIONS ─────────────────────────── */}
          <section id="style-sections" className="pt-5 scroll-mt-9">
            <SectionHeading>Sections</SectionHeading>

            <SectionHeading>Work Experience</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Order</FieldLabel>
                <Pills
                  value={s.experienceOrder}
                  onChange={(v) => updateSettings({ experienceOrder: v as ExperienceOrder })}
                  options={[
                    { value: 'title-employer', label: 'Title — Employer' },
                    { value: 'employer-title', label: 'Employer — Title' },
                  ]}
                />
              </div>
              <ToggleRow label="Group promotions" checked={s.groupPromotions} onCheckedChange={(v) => updateSettings({ groupPromotions: v })} />
            </Row>

            <SectionHeading>Education</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Order</FieldLabel>
                <Pills
                  value={s.educationOrder}
                  onChange={(v) => updateSettings({ educationOrder: v as EducationOrder })}
                  options={[
                    { value: 'degree-school', label: 'Degree, School' },
                    { value: 'school-degree', label: 'School, Degree' },
                  ]}
                />
              </div>
            </Row>

            <SectionHeading>Skills</SectionHeading>
            <Row>
              <div>
                <FieldLabel>Display Style</FieldLabel>
                <Pills
                  value={s.skillDisplay}
                  onChange={(v) => updateSettings({ skillDisplay: v as SkillDisplayOption })}
                  options={[
                    { value: 'grid', label: 'Grid' },
                    { value: 'level', label: 'Level' },
                    { value: 'compact', label: 'Compact' },
                    { value: 'bubble', label: 'Bubble' },
                  ]}
                />
              </div>
            </Row>

            <SectionHeading>Footer</SectionHeading>
            <Row>
              <ToggleRow label="Page numbers" checked={s.footerPageNumbers} onCheckedChange={(v) => updateSettings({ footerPageNumbers: v })} />
              <ToggleRow label="Email in footer" checked={s.footerEmail} onCheckedChange={(v) => updateSettings({ footerEmail: v })} />
              <ToggleRow label="Name in footer" checked={s.footerName} onCheckedChange={(v) => updateSettings({ footerName: v })} />
            </Row>
          </section>

        </div>
      </div>
    </div>
  )
}
