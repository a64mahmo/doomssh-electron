'use client'
import { useRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useResume } from '@/hooks/useResume'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Layout as LayoutIcon,
  User as HeaderIcon,
  Settings2,
  Type as TypeIcon,
  LayoutTemplate,
  FileText,
} from 'lucide-react'
import {
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import { TemplatesSection } from './sections/TemplatesSection'
import { LayoutSection } from './sections/LayoutSection'
import { TypographySection } from './sections/TypographySection'
import { EntrySection } from './sections/EntrySection'
import { ColorsSection } from './sections/ColorsSection'
import { HeaderSection } from './sections/HeaderSection'
import { SectionsSection } from './sections/SectionsSection'

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

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* -- Icon Nav ------------------------------------------------ */}
      <nav className="w-12 border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 bg-sidebar">
        {PANEL_SECTIONS.map((section) => {
          const Icon = section.icon
          const active = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id)
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              title={section.label}
              className={cn(
                'group relative w-9 h-9 flex items-center justify-center rounded-lg transition-all',
                active
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-0.5 h-4 bg-primary rounded-full -translate-x-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* -- Content ------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-10 border-b border-border flex items-center px-4 shrink-0 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
            {PANEL_SECTIONS.find(p => p.id === activeSection)?.label}
          </h2>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-4 pb-20">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="space-y-6"
              >
                {activeSection === 'templates' && (
                  <TemplatesSection 
                    currentTemplate={resume.template} 
                    onSelect={(id, settings) => {
                      setResume({ ...resume, template: id, settings: { ...resume.settings, ...settings } })
                    }} 
                  />
                )}

                {activeSection === 'layout' && (
                  <LayoutSection 
                    s={s} 
                    upd={upd}
                    sensors={sensors}
                    handleDragOver={handleDragOver}
                    dragActiveId={dragActiveId}
                    setDragActiveId={setDragActiveId}
                    mainIds={mainIds}
                    sidebarIds={sidebarIds}
                    sections={sections}
                  />
                )}

                {activeSection === 'typography' && (
                  <TypographySection s={s} upd={upd} />
                )}

                {activeSection === 'entry' && (
                  <EntrySection s={s} upd={upd} />
                )}

                {activeSection === 'colors' && (
                  <ColorsSection s={s} upd={upd} />
                )}

                {activeSection === 'header' && (
                  <HeaderSection s={s} upd={upd} />
                )}

                {activeSection === 'sections' && (
                  <SectionsSection s={s} upd={upd} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
