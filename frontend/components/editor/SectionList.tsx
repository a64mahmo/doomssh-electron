'use client'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, ListPlus } from 'lucide-react'
import { SectionItem } from './SectionItem'
import { useSections } from '@/hooks/useResume'
import type { SectionType } from '@/lib/store/types'
import { SECTION_LABELS } from '@/lib/store/types'
import { ControlGroup } from './EditorPrimitives'

const ADDABLE_SECTIONS: SectionType[] = [
  'experience', 'education', 'skills', 'projects', 'certifications',
  'languages', 'awards', 'volunteering', 'publications', 'references', 'custom',
]

export function SectionList() {
  const { sections, addSection, reorderSections } = useSections()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over?.id) reorderSections(active.id, over.id)
  }

  return (
    <div className="space-y-10">
      <ControlGroup title="Active Sections">
        <div className="space-y-3 min-h-[120px] p-3 rounded-2xl bg-muted/20 border-2 border-dashed border-border/40">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SectionItem key={section.id} sectionId={section.id} type={section.type} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ControlGroup>

      <ControlGroup title="Add More Content">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 hover:border-foreground/20 hover:text-foreground transition-all group outline-none">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Plus size={16} className="text-muted-foreground group-hover:text-foreground" />
            </div>
            Add Section
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-1.5 rounded-xl" align="center">
            <div className="px-2 py-1.5 mb-1">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Available Sections</p>
            </div>
            {ADDABLE_SECTIONS.map((type) => (
              <DropdownMenuItem 
                key={type} 
                onClick={() => addSection(type)}
                className="flex items-center gap-2 py-2 px-2.5 rounded-lg cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <ListPlus size={12} className="text-muted-foreground" />
                </div>
                <span className="text-xs font-medium">{SECTION_LABELS[type]}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-[10px] text-muted-foreground/40 text-center px-4 leading-relaxed italic">
          Sections like Experience and Education can be added multiple times for different purposes.
        </p>
      </ControlGroup>
    </div>
  )
}
