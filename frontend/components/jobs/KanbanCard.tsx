'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Building2 } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatSalary } from '@/lib/utils'
import type { JobApplication } from '@/lib/store/jobTypes'
import { JOB_SOURCE_LABELS } from '@/lib/store/jobTypes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

interface KanbanCardProps {
  job: JobApplication
  onClick: () => void
}

export function KanbanCard({ job, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id, data: { type: 'job', job } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const daysAgo = job.appliedDate
    ? dayjs(job.appliedDate).fromNow()
    : job.createdAt
    ? dayjs(job.createdAt).fromNow()
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-50 z-50')}
    >
      <Card
        size="sm"
        className="cursor-pointer hover:ring-1 hover:ring-foreground/10 transition-all group"
        onClick={onClick}
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <Building2 size={11} />
                <span className="text-[11px] font-medium truncate">{job.company || 'No company'}</span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{job.role || 'No role'}</p>
            </div>
            <button
              className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing p-0.5 -mr-1 -mt-0.5"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={12} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="flex flex-wrap items-center gap-1">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 h-4 border-0', priorityColors[job.priority])}
            >
              {job.priority}
            </Badge>
            {job.source !== 'other' && (
              <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                {JOB_SOURCE_LABELS[job.source]}
              </Badge>
            )}
          </div>
          {(job.salaryMin !== null || job.salaryMax !== null || daysAgo) && (
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              {(job.salaryMin !== null || job.salaryMax !== null) && (
                <span>
                  {job.salaryMin !== null && job.salaryMax !== null
                    ? `${formatSalary(job.salaryMin)}–${formatSalary(job.salaryMax)}`
                    : job.salaryMin !== null
                    ? `${formatSalary(job.salaryMin)}+`
                    : `up to ${formatSalary(job.salaryMax)}`}
                </span>
              )}
              {daysAgo && <span>{daysAgo}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
