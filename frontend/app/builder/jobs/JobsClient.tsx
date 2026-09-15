'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Kanban, Table2, BarChart3, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useJobStore } from '@/lib/store/jobStore'
import { KanbanBoard } from '@/components/jobs/KanbanBoard'
import { JobTable } from '@/components/jobs/JobTable'
import { JobStats } from '@/components/jobs/JobStats'
import { JobDetailDialog } from '@/components/jobs/JobDetailDialog'
import { PageHeader } from '@/components/PageHeader'

export function JobsClient() {
  const router = useRouter()
  const isLoaded = useJobStore((s) => s.isLoaded)
  const loadJobs = useJobStore((s) => s.loadJobs)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [initialStatus, setInitialStatus] = useState<any>(undefined)

  useEffect(() => {
    if (!isLoaded) loadJobs()
  }, [isLoaded, loadJobs])

  const handleAddJob = useCallback((status?: any) => {
    setInitialStatus(status)
    setIsAddingNew(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setSelectedJobId(null)
    setIsAddingNew(false)
    setInitialStatus(undefined)
  }, [])

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background overscroll-none select-none">
      {/* Header */}
      <PageHeader title="Job Tracker">
        <Button size="sm" onClick={() => handleAddJob()} className="h-7.5 gap-1.5 text-xs font-semibold px-4 rounded-lg">
          <Plus size={13} />
          Add Job
        </Button>
      </PageHeader>

      {/* Content */}
      <Tabs defaultValue="board" className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-2 shrink-0">
          <TabsList variant="line">
            <TabsTrigger value="board">
              <Kanban size={14} />
              Board
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2 size={14} />
              Table
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 size={14} />
              Stats
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="flex-1 min-h-0 overflow-hidden">
          <KanbanBoard onSelectJob={setSelectedJobId} onAddJob={handleAddJob} />
        </TabsContent>
        <TabsContent value="table" className="flex-1 min-h-0 overflow-hidden">
          <JobTable onSelectJob={setSelectedJobId} />
        </TabsContent>
        <TabsContent value="stats" className="flex-1 min-h-0 overflow-auto p-4">
          <JobStats />
        </TabsContent>
      </Tabs>

      <JobDetailDialog
        jobId={selectedJobId}
        mode={isAddingNew ? 'create' : 'edit'}
        initialStatus={initialStatus}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
