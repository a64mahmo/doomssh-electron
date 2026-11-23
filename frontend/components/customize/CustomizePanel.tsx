'use client'
import { useRef, useState, useMemo } from 'react'
import { RailNav, RailItem, RailTooltipBody } from '@/components/ui/rail-nav'
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
  PanelBottom,
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
import { sectionHasContent } from '@/lib/resume-utils'
import { FooterSection } from './sections/FooterSection'
import { SectionsSection } from './sections/SectionsSection'
import { useRevealSetting } from '@/components/settings-search/useRevealSetting'
import { SearchButton } from '@/components/settings-search/SettingsPalette'


const PANEL_SECTIONS = [
  { id: 'templates', label: 'Templates', description: 'Choose a base template', icon: LayoutTemplate },
  { id: 'layout',    label: 'Layout',     description: 'Columns, paper size, margins', icon: LayoutIcon },
  { id: 'typography',label: 'Typography', description: 'Fonts, sizes, line height', icon: TypeIcon },
  { id: 'entry',     label: 'Entry',      description: 'Entry styles & order', icon: FileText },
  { id: 'colors',    label: 'Colors',     description: 'Color palette', icon: Palette },
  { id: 'header',    label: 'Header',     description: 'Name, photo, contact info', icon: HeaderIcon },
  { id: 'footer',    label: 'Footer',     description: 'Page numbers, name, divider', icon: PanelBottom },
  { id: 'sections',  label: 'Sections',   description: 'Add, remove, reorder sections', icon: Settings2 },
] as const

type PanelSectionId = typeof PANEL_SECTIONS[number]['id']

export function CustomizePanel() {
  const { resume, updateSettings, setResume } = useResume()
  
  const isCoverLetter = resume?.kind === 'coverLetter'
  
  const filteredSections = useMemo(() => {
    if (!isCoverLetter) return PANEL_SECTIONS
    return PANEL_SECTIONS.filter(s => ['templates', 'layout', 'typography', 'colors', 'header', 'footer'].includes(s.id))
  }, [isCoverLetter])

  const [activeSection, setActiveSection] = useState<PanelSectionId>('templates')
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Builder search: open the setting's tab, then scroll to it, highlight it
  // and focus its control.
  useRevealSetting(
    scrollRef,
    (entry) => entry.tab !== 'content',
    (entry) => setActiveSection(entry.tab as PanelSectionId),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sidebarTypes = useMemo(() => ['skills', 'education', 'languages', 'certifications', 'awards', 'references'], [])
  const sections = useMemo(() => resume?.sections.filter(sec => sec.type !== 'header') || [], [resume?.sections])
  // Section Placement lists only sections that show on the page.
  const placeable = useMemo(() => sections.filter(sectionHasContent), [sections])

  const mainIds = useMemo(() => {
    if (!resume) return []
    const s = resume.settings
    return placeable.filter(sec => {
      const col = s.sectionColumns?.[sec.id]
      return col ? col === 'main' : !sidebarTypes.includes(sec.type)
    }).map(sec => sec.id)
  }, [placeable, resume, sidebarTypes])

  const sidebarIds = useMemo(() => {
    if (!resume) return []
    const s = resume.settings
    return placeable.filter(sec => {
      const col = s.sectionColumns?.[sec.id]
      return col ? col === 'sidebar' : sidebarTypes.includes(sec.type)
    }).map(sec => sec.id)
  }, [placeable, resume, sidebarTypes])

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
      <RailNav label="Customize">
        {filteredSections.map((section) => (
          <RailItem
            key={section.id}
            icon={section.icon}
            label={section.label}
            tooltip={<RailTooltipBody label={section.label} description={section.description} />}
            testId={`nav-${section.id}`}
            active={activeSection === section.id}
            onClick={() => {
              setActiveSection(section.id)
              scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        ))}
      </RailNav>

      {/* -- Content ------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-10 border-b border-border flex items-center px-4 shrink-0 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
            {PANEL_SECTIONS.find(p => p.id === activeSection)?.label}
          </h2>
          <SearchButton className="ml-auto" />
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
                    isCoverLetter={isCoverLetter}
                  />
                )}

                {activeSection === 'typography' && (
                  <TypographySection s={s} upd={upd} />
                )}

                {activeSection === 'entry' && !isCoverLetter && (
                  <EntrySection s={s} upd={upd} />
                )}

                {activeSection === 'colors' && (
                  <ColorsSection s={s} upd={upd} />
                )}

                {activeSection === 'header' && (
                  <HeaderSection s={s} upd={upd} sections={sections} />
                )}

                {activeSection === 'footer' && (
                  <FooterSection s={s} upd={upd} />
                )}

                {activeSection === 'sections' && !isCoverLetter && (
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
