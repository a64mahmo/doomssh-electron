'use client'
import { Briefcase, Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useResumeStore } from '@/lib/store/resumeStore'
import { useJobStore } from '@/lib/store/jobStore'
import { useMemo } from 'react'
import { ControlGroup, FieldLabel } from '@/components/editor/EditorPrimitives'

export function TargetJobCard() {
  const cl = useResumeStore(s => s.resume?.coverLetter)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)
  const jobs = useJobStore(s => s.jobs)
  
  const activeJobs = useMemo(() => jobs.filter(j => !j.archivedAt), [jobs])
  const linkedJob = useMemo(
    () => activeJobs.find(j => j.id === cl?.linkedJobId),
    [activeJobs, cl?.linkedJobId],
  )

  function linkJob(jobId: string | null) {
    if (!jobId || jobId === '__none__') {
      updateCoverLetter({ linkedJobId: null })
      return
    }
    const job = activeJobs.find(j => j.id === jobId)
    if (!job) return
    updateCoverLetter({
      linkedJobId: job.id,
      recipient: {
        ...cl?.recipient,
        company: job.company || cl?.recipient?.company || '',
        hrName: cl?.recipient?.hrName || '',
        address: cl?.recipient?.address || '',
      },
    })
    toast.success(`Linked to ${job.company} — ${job.role}`)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ControlGroup title="Application Context">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/10">
            <Briefcase size={16} className="text-sky-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Target Application</p>
              <p className="text-[10px] text-sky-600/70 leading-relaxed">
                Linking a job application allows the AI to tailor your letter specifically to the role's requirements and company culture.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Select Saved Job</FieldLabel>
            {activeJobs.length === 0 ? (
              <div className="text-[10px] text-muted-foreground bg-muted/20 rounded-xl p-4 border border-border/50 text-center italic">
                No active jobs found in your tracker.
              </div>
            ) : (
              <Select
                value={cl?.linkedJobId || '__none__'}
                onValueChange={linkJob}
              >
                <SelectTrigger className="w-full h-11 text-xs bg-muted/20 border-border/50 rounded-xl transition-all hover:bg-muted/30 focus:ring-primary/20">
                  <SelectValue>
                    {linkedJob 
                      ? `${linkedJob.company} — ${linkedJob.role}`
                      : "Pick a job from your tracker..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-border/50">
                  <SelectItem value="__none__" className="text-xs py-2.5 opacity-50">Not linked to a job</SelectItem>
                  {activeJobs.map(j => (
                    <SelectItem key={j.id} value={j.id} className="text-xs py-2.5">
                      <span className="font-bold">{j.company || 'Untitled Company'}</span>
                      <span className="mx-2 opacity-30">—</span>
                      <span className="text-muted-foreground">{j.role || 'Untitled Role'}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {linkedJob && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 animate-in zoom-in-95">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-tight">
                Currently targeting {linkedJob.role} at {linkedJob.company}
              </span>
            </div>
          )}
        </div>
      </ControlGroup>
    </div>
  )
}
