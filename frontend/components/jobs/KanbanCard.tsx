'use client'

import { memo, useCallback, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Building2 } from 'lucide-react'
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
  /** Preferred: parent supplies a stable callback that receives the job id. */
  onSelect?: (id: string) => void
  /** Legacy no-arg click handler (still supported for the DragOverlay ghost). */
  onClick?: () => void
  isDragging?: boolean
}

function KanbanCardImpl({ job, onSelect, onClick, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: isActive,
  } = useDraggable({ id: job.id, data: { type: 'job', job } })

  const dragging = isDragging || isActive

  // Recompute only when the underlying date changes, not on every render.
  const daysAgo = useMemo(() => {
    if (job.appliedDate) return dayjs(job.appliedDate).fromNow()
    if (job.createdAt) return dayjs(job.createdAt).fromNow()
    return null
  }, [job.appliedDate, job.createdAt])

  const handleClick = useCallback(() => {
    if (onSelect) onSelect(job.id)
    else if (onClick) onClick()
  }, [onSelect, onClick, job.id])

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(dragging && 'opacity-40 z-50')}
    >
      <Card
        size="sm"
        className={cn(
          'cursor-pointer active:cursor-grabbing transition-shadow group',
          dragging
            ? 'ring-2 ring-primary/50 shadow-lg'
            : 'hover:ring-1 hover:ring-foreground/10 hover:shadow-md'
        )}
        onClick={handleClick}
      >
        <CardHeader className="p-3 pb-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
              <Building2 size={11} />
              <span className="text-[11px] font-medium truncate">{job.company || 'No company'}</span>
            </div>
            <p className="text-xs font-semibold text-foreground truncate">{job.role || 'No role'}</p>
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

/**
 * Memoized so untouched cards do not re-render when a sibling card or
 * unrelated store field changes.
 */
export const KanbanCard = memo(KanbanCardImpl)
