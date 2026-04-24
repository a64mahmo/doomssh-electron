'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { JobApplication, JobStatus, JobSource, JobPriority, WorkMode } from '@/lib/store/jobTypes'
import {
  JOB_STATUS_CONFIG,
  JOB_SOURCE_LABELS,
  JOB_PRIORITY_LABELS,
  WORK_MODE_LABELS,
} from '@/lib/store/jobTypes'
import type { Resume } from '@/lib/store/types'
import { getAllResumes, getAllCoverLetters } from '@/lib/db/database'
import { FieldLabel, ControlGroup } from '@/components/editor/EditorPrimitives'
import { 
  Building2, 
  Briefcase, 
  Link as LinkIcon, 
  MapPin, 
  FileText, 
  DollarSign, 
  Calendar,
  Layers,
  Zap,
  Globe,
  Monitor,
  Mail,
  StickyNote,
  PencilLine
} from 'lucide-react'

interface JobFormProps {
  job: JobApplication
  onUpdate: (updates: Partial<JobApplication>) => void
}

function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string
  icon?: any
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        {Icon && <Icon size={12} className="text-muted-foreground/50" />}
        <FieldLabel className="mb-0">{label}</FieldLabel>
      </div>
      {children}
    </div>
  )
}

const inputStyles = "w-full h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 rounded-lg transition-all hover:bg-muted/30 focus:bg-background"

export function JobForm({ job, onUpdate }: JobFormProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [letters, setLetters] = useState<Resume[]>([])

  useEffect(() => {
    getAllResumes().then(setResumes)
    getAllCoverLetters().then(setLetters)
  }, [])

  return (
    <div className="space-y-8 pb-4">
      {/* Company & Role */}
      <ControlGroup title="Company & Role">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company" icon={Building2}>
            <Input
              value={job.company}
              onChange={(e) => onUpdate({ company: e.target.value })}
              placeholder="e.g. Acme Corp"
              className={inputStyles}
            />
          </Field>
          <Field label="Role" icon={Briefcase}>
            <Input
              value={job.role}
              onChange={(e) => onUpdate({ role: e.target.value })}
              placeholder="e.g. Senior Engineer"
              className={inputStyles}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Job URL" icon={LinkIcon}>
            <Input
              value={job.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://..."
              className={inputStyles}
            />
          </Field>
          <Field label="Location" icon={MapPin}>
            <Input
              value={job.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="Remote / City, State"
              className={inputStyles}
            />
          </Field>
        </div>
      </ControlGroup>

      {/* Status & Categorization */}
      <ControlGroup title="Status & Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status" icon={Zap}>
            <Select value={job.status} onValueChange={(v) => onUpdate({ status: v as JobStatus })}>
              <SelectTrigger className={inputStyles}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUS_CONFIG.map((s) => (
                  <SelectItem key={s.status} value={s.status}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority" icon={Layers}>
            <Select value={job.priority} onValueChange={(v) => onUpdate({ priority: v as JobPriority })}>
              <SelectTrigger className={inputStyles}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_PRIORITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Source" icon={Globe}>
            <Select value={job.source} onValueChange={(v) => onUpdate({ source: v as JobSource })}>
              <SelectTrigger className={inputStyles}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_SOURCE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Work Mode" icon={Monitor}>
            <Select value={job.workMode} onValueChange={(v) => onUpdate({ workMode: v as WorkMode })}>
              <SelectTrigger className={inputStyles}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not specified</SelectItem>
                {Object.entries(WORK_MODE_LABELS)
                  .filter(([k]) => k !== '')
                  .map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Linked Resume" icon={FileText}>
          <Select value={job.resumeId ?? ''} onValueChange={(v) => onUpdate({ resumeId: v || null })}>
            <SelectTrigger className={inputStyles}>
              <SelectValue>
                {job.resumeId ? (resumes.find(r => r.id === job.resumeId)?.name || 'Loading...') : 'None'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="">None</SelectItem>
              {resumes.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs py-2">{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </ControlGroup>

      {/* Dates & Compensation */}
      <ControlGroup title="Dates & Compensation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Salary Min" icon={DollarSign}>
            <Input
              type="number"
              value={job.salaryMin ?? ''}
              onChange={(e) => onUpdate({ salaryMin: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 80000"
              className={inputStyles}
            />
          </Field>
          <Field label="Salary Max" icon={DollarSign}>
            <Input
              type="number"
              value={job.salaryMax ?? ''}
              onChange={(e) => onUpdate({ salaryMax: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 120000"
              className={inputStyles}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Applied Date" icon={Calendar}>
            <Input
              type="date"
              value={job.appliedDate ?? ''}
              onChange={(e) => onUpdate({ appliedDate: e.target.value || null })}
              className={inputStyles}
            />
          </Field>
          <Field label="Deadline" icon={Calendar}>
            <Input
              type="date"
              value={job.deadlineDate ?? ''}
              onChange={(e) => onUpdate({ deadlineDate: e.target.value || null })}
              className={inputStyles}
            />
          </Field>
        </div>
      </ControlGroup>

      {/* Notes & Documents */}
      <ControlGroup title="Notes & Documents">
        <Field label="Application Notes" icon={StickyNote}>
          <Textarea
            value={job.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Any notes about this application..."
            className="min-h-[100px] text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 rounded-xl resize-none py-3 px-4 transition-all hover:bg-muted/30 focus:bg-background"
          />
        </Field>

        <div className="pt-2 space-y-4">
          <Field label="Linked Cover Letter" icon={Mail}>
            <Select value={job.coverLetterId ?? ''} onValueChange={(v) => onUpdate({ coverLetterId: v || null })}>
              <SelectTrigger className={inputStyles}>
                <SelectValue>
                  {job.coverLetterId ? (letters.find(l => l.id === job.coverLetterId)?.name || 'Loading...') : 'None'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="">None</SelectItem>
                {letters.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs py-2">{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Draft/Personalized Content" icon={PencilLine}>
            <Textarea
              value={job.coverLetter}
              onChange={(e) => onUpdate({ coverLetter: e.target.value })}
              placeholder="Paste or write specific details for this application..."
              className="min-h-[180px] text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 rounded-xl resize-none py-3 px-4 transition-all hover:bg-muted/30 focus:bg-background"
            />
          </Field>
        </div>
      </ControlGroup>
    </div>
  )
}

