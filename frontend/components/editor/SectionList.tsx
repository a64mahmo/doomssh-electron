'use client'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { SectionItem } from './SectionItem'
import { useSections } from '@/hooks/useResume'
import type { SectionType } from '@/lib/store/types'
import { SECTION_LABELS } from '@/lib/store/types'

const ADDABLE_SECTIONS: SectionType[] = [
  'experience', 'education', 'skills', 'projects', 'certifications',
  'languages', 'awards', 'volunteering', 'publications', 'references', 'custom',
]

export function SectionList() {
  const { sections, addSection, reorderSections } = useSections()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over?.id) reorderSections(active.id, over.id)
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SectionItem key={section.id} sectionId={section.id} type={section.type} />
          ))}
        </SortableContext>
      </DndContext>

      <DropdownMenu>
        <DropdownMenuTrigger className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors">
          <Plus size={13} /> Add Section
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          {ADDABLE_SECTIONS.map((type) => (
            <DropdownMenuItem key={type} onClick={() => addSection(type)}>
              {SECTION_LABELS[type]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
