'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useJobStore } from '@/lib/store/jobStore'
import {
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
  JOB_STATUS_CONFIG,
} from '@/lib/store/jobTypes'
import type { JobApplication, JobStatus } from '@/lib/store/jobTypes'

interface KanbanBoardProps {
  onSelectJob: (id: string) => void
  onAddJob: (status: JobStatus) => void
}

export function KanbanBoard({ onSelectJob, onAddJob }: KanbanBoardProps) {
  const { jobs, moveJob } = useJobStore()
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeJobs = jobs.filter((j) => !j.archivedAt && ACTIVE_STATUSES.includes(j.status))
  const archivedJobs = jobs.filter((j) => j.archivedAt || TERMINAL_STATUSES.includes(j.status))

  function getJobsByStatus(status: JobStatus) {
    return activeJobs
      .filter((j) => j.status === status)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  function handleDragStart(event: DragStartEvent) {
    const job = jobs.find((j) => j.id === event.active.id)
    if (job) setActiveJob(job)
  }

  function handleDragOver(event: DragOverEvent) {
    // Visual feedback handled by useDroppable isOver
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null)
    const { active, over } = event
    if (!over) return

    const jobId = active.id as string
    let targetStatus: JobStatus | null = null

    if (over.data.current?.type === 'column') {
      targetStatus = over.data.current.status as JobStatus
    } else if (over.data.current?.type === 'job') {
      targetStatus = (over.data.current.job as JobApplication).status
    }

    if (targetStatus) {
      moveJob(jobId, targetStatus)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 p-4 h-full min-w-max">
              {ACTIVE_STATUSES.map((status) => {
                const config = JOB_STATUS_CONFIG.find((c) => c.status === status)!
                return (
                  <KanbanColumn
                    key={status}
                    config={config}
                    jobs={getJobsByStatus(status)}
                    onSelectJob={onSelectJob}
                    onAddJob={onAddJob}
                  />
                )
              })}
            </div>

            <DragOverlay>
              {activeJob ? (
                <div className="w-[252px] shadow-xl rotate-2 scale-105">
                  <KanbanCard job={activeJob} onClick={() => {}} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      </div>

      {/* Archived section */}
      {archivedJobs.length > 0 && (
        <div className="shrink-0 border-t border-border">
          <Collapsible open={showArchived} onOpenChange={setShowArchived}>
            <CollapsibleTrigger>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {showArchived ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span className="font-medium">Archived</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {archivedJobs.length}
                </Badge>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-4 gap-2 px-4 pb-3 max-h-40 overflow-auto">
                {archivedJobs.map((job) => (
                  <Card
                    key={job.id}
                    size="sm"
                    className="cursor-pointer hover:ring-1 hover:ring-foreground/10 opacity-60"
                    onClick={() => onSelectJob(job.id)}
                  >
                    <CardContent className="p-2">
                      <p className="text-[11px] font-medium truncate">{job.company}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{job.role}</p>
                      <Badge variant="outline" className="text-[9px] h-3.5 px-1 mt-1">
                        {JOB_STATUS_CONFIG.find((c) => c.status === job.status)?.label}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  )
}
