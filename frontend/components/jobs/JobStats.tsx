'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Target, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useJobStore } from '@/lib/store/jobStore'
import { useJobStats } from '@/hooks/useJobs'
import {
  JOB_STATUS_CONFIG,
  JOB_SOURCE_LABELS,
  ACTIVE_STATUSES,
} from '@/lib/store/jobTypes'
import type { JobApplication } from '@/lib/store/jobTypes'
import dayjs from 'dayjs'

export function JobStats() {
  const stats = useJobStats()
  const jobs = useJobStore((s) => s.jobs)

  const pipeline = useMemo(() => {
    const counts = JOB_STATUS_CONFIG.map((cfg) => ({
      ...cfg,
      count: jobs.filter((j) => j.status === cfg.status && !j.archivedAt).length,
    }))
    const max = Math.max(...counts.map((c) => c.count), 1)
    return counts.map((c) => ({ ...c, pct: (c.count / max) * 100 }))
  }, [jobs])

  const sourceCounts = useMemo(() => {
    const map: Record<string, number> = {}
    jobs.filter((j) => !j.archivedAt).forEach((j) => {
      map[j.source] = (map[j.source] ?? 0) + 1
    })
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
    const max = Math.max(...entries.map(([, v]) => v), 1)
    return entries.map(([source, count]) => ({
      source,
      label: JOB_SOURCE_LABELS[source as keyof typeof JOB_SOURCE_LABELS] ?? source,
      count,
      pct: (count / max) * 100,
    }))
  }, [jobs])

  const weeklyActivity = useMemo(() => {
    const weeks: { label: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const start = dayjs().subtract(i, 'week').startOf('week')
      const end = start.endOf('week')
      const count = jobs.filter((j) => {
        const d = j.appliedDate ? dayjs(j.appliedDate) : dayjs(j.createdAt)
        return d.isAfter(start) && d.isBefore(end)
      }).length
      weeks.push({ label: start.format('MMM D'), count })
    }
    return weeks
  }, [jobs])

  const maxWeekly = Math.max(...weeklyActivity.map((w) => w.count), 1)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<BarChart3 size={14} />} label="Total Applications" value={stats.total} />
        <StatCard icon={<TrendingUp size={14} />} label="Response Rate" value={`${stats.responseRate.toFixed(1)}%`} />
        <StatCard icon={<Target size={14} />} label="Interview Rate" value={`${stats.interviewRate.toFixed(1)}%`} />
        <StatCard icon={<Trophy size={14} />} label="Offer Rate" value={`${stats.offerRate.toFixed(1)}%`} />
      </div>

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <p className="text-xs font-semibold">Pipeline</p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-1.5">
            {pipeline.map((item, i) => (
              <div key={item.status} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20 text-right shrink-0">{item.label}</span>
                <div className="flex-1 h-5 bg-accent/30 rounded overflow-hidden">
                  <motion.div
                    className="h-full rounded"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  />
                </div>
                <span className="text-[10px] font-medium w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="text-xs font-semibold">Weekly Activity (12 weeks)</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end gap-1 h-24">
              {weeklyActivity.map((week, i) => (
                <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full bg-foreground/80 rounded-t min-h-[2px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${(week.count / maxWeekly) * 80}px` }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {weeklyActivity.map((week, i) => (
                <div key={week.label} className="flex-1 text-center">
                  {i % 3 === 0 && (
                    <span className="text-[8px] text-muted-foreground/60">{week.label}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="text-xs font-semibold">Sources</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {sourceCounts.map((item, i) => (
                <div key={item.source} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-24 text-right shrink-0 truncate">{item.label}</span>
                  <div className="flex-1 h-4 bg-accent/30 rounded overflow-hidden">
                    <motion.div
                      className="h-full rounded bg-foreground/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    />
                  </div>
                  <span className="text-[10px] font-medium w-4 text-right">{item.count}</span>
                </div>
              ))}
              {sourceCounts.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
          {icon}
          <span className="text-[10px] font-medium">{label}</span>
        </div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}
