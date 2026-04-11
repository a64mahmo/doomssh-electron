'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'
import type { JobApplication, StatusConfig, JobStatus } from '@/lib/store/jobTypes'

interface KanbanColumnProps {
  config: StatusConfig
  jobs: JobApplication[]
  onSelectJob: (id: string) => void
  onAddJob: (status: JobStatus) => void
}

export function KanbanColumn({ config, jobs, onSelectJob, onAddJob }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${config.status}`,
    data: { type: 'column', status: config.status },
  })

  return (
    <div className="flex flex-col h-full w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-2 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-xs font-semibold text-foreground">{config.label}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 min-w-[20px] justify-center">
            {jobs.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="xs"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => onAddJob(config.status)}
        >
          <Plus size={12} />
        </Button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-0 rounded-lg transition-colors',
          isOver && 'bg-accent/50 ring-1 ring-foreground/10'
        )}
      >
        <ScrollArea className="h-full">
          <SortableContext
            items={jobs.map((j) => j.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1.5 p-1">
              {jobs.map((job) => (
                <KanbanCard
                  key={job.id}
                  job={job}
                  onClick={() => onSelectJob(job.id)}
                />
              ))}
              {jobs.length === 0 && (
                <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/50 border border-dashed border-border rounded-lg">
                  Drop here
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </div>
  )
}
