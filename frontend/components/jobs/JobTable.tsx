'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatSalary } from '@/lib/utils'
import { useJobStore } from '@/lib/store/jobStore'
import {
  JOB_STATUS_CONFIG,
  JOB_SOURCE_LABELS,
  JOB_PRIORITY_LABELS,
} from '@/lib/store/jobTypes'
import type { JobApplication, JobStatus, JobSource } from '@/lib/store/jobTypes'
import dayjs from 'dayjs'

type SortKey = 'company' | 'role' | 'status' | 'priority' | 'appliedDate' | 'salary' | 'source'
type SortDir = 'asc' | 'desc'

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
const statusOrder: Record<string, number> = Object.fromEntries(
  JOB_STATUS_CONFIG.map((c, i) => [c.status, i])
)

interface JobTableProps {
  onSelectJob: (id: string) => void
}

export function JobTable({ onSelectJob }: JobTableProps) {
  const { jobs, archiveJob, deleteJob } = useJobStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('appliedDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let result = jobs.filter((j) => !j.archivedAt)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(q) ||
          j.role.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter)
    }

    if (sourceFilter !== 'all') {
      result = result.filter((j) => j.source === sourceFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'company':
          cmp = a.company.localeCompare(b.company)
          break
        case 'role':
          cmp = a.role.localeCompare(b.role)
          break
        case 'status':
          cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
          break
        case 'priority':
          cmp = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
          break
        case 'appliedDate':
          cmp = (a.appliedDate ?? '').localeCompare(b.appliedDate ?? '')
          break
        case 'salary':
          cmp = (a.salaryMin ?? 0) - (b.salaryMin ?? 0)
          break
        case 'source':
          cmp = a.source.localeCompare(b.source)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [jobs, search, statusFilter, sourceFilter, sortKey, sortDir])

  function SortHeader({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col
    return (
      <button
        className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => handleSort(col)}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
        ) : (
          <ArrowUpDown size={10} className="opacity-30" />
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="h-7 text-xs pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {JOB_STATUS_CONFIG.map((s) => (
              <SelectItem key={s.status} value={s.status}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v ?? 'all')}>
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(JOB_SOURCE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-[10px] h-5 px-2 shrink-0">
          {filtered.length} job{filtered.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 px-4 pb-2">
        <ScrollArea className="h-full">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 w-[20%]"><SortHeader label="Company" col="company" /></th>
                <th className="text-left py-2 px-2 w-[20%]"><SortHeader label="Role" col="role" /></th>
                <th className="text-left py-2 px-2 w-[12%]"><SortHeader label="Status" col="status" /></th>
                <th className="text-left py-2 px-2 w-[8%]"><SortHeader label="Priority" col="priority" /></th>
                <th className="text-left py-2 px-2 w-[12%]"><SortHeader label="Applied" col="appliedDate" /></th>
                <th className="text-left py-2 px-2 w-[12%]"><SortHeader label="Salary" col="salary" /></th>
                <th className="text-left py-2 px-2 w-[10%]"><SortHeader label="Source" col="source" /></th>
                <th className="w-[6%]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => {
                const statusCfg = JOB_STATUS_CONFIG.find((c) => c.status === job.status)
                return (
                  <tr
                    key={job.id}
                    className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                    onClick={() => onSelectJob(job.id)}
                  >
                    <td className="py-2 px-2 font-medium truncate max-w-0">{job.company || '—'}</td>
                    <td className="py-2 px-2 truncate max-w-0">{job.role || '—'}</td>
                    <td className="py-2 px-2">
                      {statusCfg && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 border-0"
                          style={{ backgroundColor: `${statusCfg.color}20`, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] h-4 px-1.5 border-0',
                          job.priority === 'high' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                          job.priority === 'medium' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                          job.priority === 'low' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                        )}
                      >
                        {JOB_PRIORITY_LABELS[job.priority]}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {job.appliedDate ? dayjs(job.appliedDate).format('MMM D, YYYY') : '—'}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {job.salaryMin !== null || job.salaryMax !== null
                        ? `${formatSalary(job.salaryMin)}–${formatSalary(job.salaryMax)}`
                        : '—'}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{JOB_SOURCE_LABELS[job.source]}</td>
                    <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <MoreHorizontal size={12} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => onSelectJob(job.id)}>
                            <Pencil size={12} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveJob(job.id)}>
                            <Archive size={12} className="mr-2" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteJob(job.id)}
                          >
                            <Trash2 size={12} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground/50">
                    {search || statusFilter !== 'all' || sourceFilter !== 'all'
                      ? 'No jobs match your filters'
                      : 'No jobs yet — click "Add Job" to get started'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>
  )
}
