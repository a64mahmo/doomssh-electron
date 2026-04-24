'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, User, Mail, Phone, ExternalLink, Building2, Briefcase, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useJobStore } from '@/lib/store/jobStore'
import { JobForm } from './JobForm'
import { TimelineView } from './TimelineView'
import { InterviewPrepTab } from './InterviewPrepTab'
import type { JobApplication, JobContact, JobEvent, JobStatus } from '@/lib/store/jobTypes'
import { JOB_STATUS_CONFIG } from '@/lib/store/jobTypes'
import { generateId } from '@/lib/utils/ids'

interface JobDetailDialogProps {
  jobId: string | null
  mode?: 'edit' | 'create'
  initialStatus?: JobStatus
  onClose: () => void
}

const inputStyles = "w-full h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"

const DEFAULT_JOB = (status: JobStatus = 'wishlist'): JobApplication => ({
  id: 'draft',
  company: '',
  role: '',
  status,
  priority: 'medium',
  url: '',
  source: 'other',
  location: '',
  workMode: '',
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: 'USD',
  resumeId: null,
  coverLetterId: null,
  coverLetter: '',
  notes: '',
  contacts: [],
  events: [],
  appliedDate: new Date().toISOString().split('T')[0],
  responseDate: null,
  deadlineDate: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  archivedAt: null,
})

export function JobDetailDialog({ jobId, mode = 'edit', initialStatus, onClose }: JobDetailDialogProps) {
  const storeJob = useJobStore((s) => (jobId ? s.jobs.find((j) => j.id === jobId) ?? null : null))
  const { addJob, updateJob, deleteJob } = useJobStore()
  
  const [draftJob, setDraftJob] = useState<JobApplication | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  // Initialize draft when entering create mode or when switching jobs
  useEffect(() => {
    if (mode === 'create') {
      if (!draftJob || activeJobId !== 'new') {
        setDraftJob(DEFAULT_JOB(initialStatus || 'wishlist'))
        setActiveJobId('new')
      }
    } else if (jobId && storeJob) {
      if (jobId !== activeJobId) {
        setDraftJob(JSON.parse(JSON.stringify(storeJob))) // Deep clone to isolate draft
        setActiveJobId(jobId)
      }
    } else {
      setDraftJob(null)
      setActiveJobId(null)
    }
  }, [jobId, storeJob, mode, initialStatus, activeJobId, draftJob])

  // Clear draft when closing
  const handleClose = () => {
    setDraftJob(null)
    setActiveJobId(null)
    onClose()
  }

  const job = draftJob
  if (!job) return null

  const statusConfig = JOB_STATUS_CONFIG.find((c) => c.status === job.status)

  const handleSave = () => {
    if (!draftJob) return

    if (!draftJob.company.trim()) {
      alert('Please enter a company name')
      return
    }

    if (mode === 'create') {
      // Strip the temporary ID and empty events so the store generates real ones
      const { id, events, ...newJob } = draftJob
      addJob(newJob)
    } else if (jobId) {
      updateJob(jobId, draftJob)
    }
    
    handleClose()
  }

  const updateDraft = (updates: Partial<JobApplication>) => {
    setDraftJob(prev => prev ? { ...prev, ...updates } : null)
  }

  const addContactToDraft = (c: Omit<JobContact, 'id'>) => {
    updateDraft({ contacts: [...(job.contacts || []), { ...c, id: generateId() }] })
  }
  const removeContactFromDraft = (cId: string) => {
    updateDraft({ contacts: job.contacts.filter(c => c.id !== cId) })
  }
  const addEventToDraft = (e: Omit<JobEvent, 'id'>) => {
    updateDraft({ events: [...(job.events || []), { ...e, id: generateId() }] })
  }
  const removeEventFromDraft = (eId: string) => {
    updateDraft({ events: job.events.filter(e => e.id !== eId) })
  }

  return (
    <Dialog open={!!jobId || mode === 'create'} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-2xl h-[95vh] sm:h-fit sm:max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl select-none">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-gradient-to-b from-muted/50 to-transparent shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {statusConfig && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold tracking-wider uppercase h-5 px-2 border-0"
                  style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Badge>
              )}
              {mode === 'create' && (
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground border-0">
                  New Application
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight mb-2 truncate">
              {job.company || (mode === 'create' ? 'New Application' : 'Untitled')}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-[11px] sm:text-xs text-muted-foreground font-medium">
              {job.role && (
                <div className="flex items-center gap-1.5">
                  <Briefcase size={12} className="text-muted-foreground/50" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{job.role}</span>
                </div>
              )}
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-muted-foreground/50" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{job.location}</span>
                </div>
              )}
              {job.url && (
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-primary hover:underline transition-all"
                >
                  <ExternalLink size={12} />
                  Posting
                </a>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="flex-1 min-h-0 flex flex-col">
          <div className="px-6 sm:px-8 shrink-0">
            <TabsList variant="line" className="w-full justify-start gap-4 sm:gap-6 bg-transparent border-b border-border/50 h-auto p-0">
              <TabsTrigger 
                value="details" 
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-3 px-0 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="contacts" 
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-3 px-0 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
              >
                Contacts
                {job.contacts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[9px] h-4 px-1 bg-muted/50">{job.contacts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-3 px-0 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
              >
                Timeline
                {job.events.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[9px] h-4 px-1 bg-muted/50">{job.events.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="interview"
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-3 px-0 data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
              >
                Interview Prep
                {(job.interviewPrep?.questions?.length ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[9px] h-4 px-1 bg-muted/50">{job.interviewPrep!.questions.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <TabsContent 
              value="details" 
              className="flex-1 min-h-0 m-0 outline-none overflow-y-auto scroll-smooth"
            >
              <div className="px-6 sm:px-8 py-6 sm:py-8">
                <JobForm 
                  job={job} 
                  onUpdate={updateDraft} 
                />
              </div>
            </TabsContent>

            <TabsContent 
              value="contacts" 
              className="flex-1 min-h-0 m-0 outline-none overflow-y-auto scroll-smooth"
            >
              <div className="px-6 sm:px-8 py-6 sm:py-8">
                <ContactsTab
                  contacts={job.contacts}
                  onAdd={addContactToDraft}
                  onUpdate={(cId, updates) => updateDraft({
                    contacts: job.contacts.map(c => c.id === cId ? { ...c, ...updates } : c)
                  })}
                  onRemove={removeContactFromDraft}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="timeline"
              className="flex-1 min-h-0 m-0 outline-none overflow-y-auto scroll-smooth"
            >
              <div className="px-6 sm:px-8 py-6 sm:py-8">
                <TimelineView
                  events={job.events}
                  onAddEvent={addEventToDraft}
                  onRemoveEvent={removeEventFromDraft}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="interview"
              className="flex-1 min-h-0 m-0 outline-none overflow-y-auto scroll-smooth"
            >
              <div className="px-6 sm:px-8 py-6 sm:py-8">
                <InterviewPrepTab
                  job={job}
                  onUpdate={updateDraft}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-muted/20 border-t border-border/50 flex justify-between items-center shrink-0">
          {mode === 'edit' ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 sm:px-3 text-[10px] sm:text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-1.5 sm:gap-2 transition-colors"
              onClick={() => { if (confirm('Delete this application?')) { deleteJob(jobId!); handleClose() } }}
            >
              <Trash2 size={14} />
              <span className="hidden xs:inline">Delete Application</span>
              <span className="xs:hidden">Delete</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 sm:px-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground"
              onClick={handleClose}
            >
              Cancel
            </Button>
          )}
          <div className="flex items-center gap-3">
            {mode === 'edit' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground"
                onClick={handleClose}
              >
                Cancel
              </Button>
            )}
            <Button 
              size="sm" 
              className="h-9 px-4 sm:px-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest" 
              onClick={handleSave}
            >
              {mode === 'create' ? 'Save Application' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Contacts Sub-tab ──────────────────────────────────────────────────────────

function ContactsTab({
  contacts,
  onAdd,
  onUpdate,
  onRemove,
}: {
  contacts: JobContact[]
  onAdd: (c: Omit<JobContact, 'id'>) => void
  onUpdate: (contactId: string, updates: Partial<JobContact>) => void
  onRemove: (contactId: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')

  function handleAdd() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), role: role.trim(), email: email.trim(), phone: '', linkedin: '', notes: '' })
    setName('')
    setRole('')
    setEmail('')
    setAdding(false)
  }

  return (
    <div className="space-y-6">
      {adding ? (
        <div className="space-y-4 p-5 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <Input 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className={inputStyles} 
              autoFocus 
            />
            <Input 
              placeholder="Role / Title" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className={inputStyles} 
            />
            <Input 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={inputStyles} 
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="h-8 px-4 text-xs font-bold uppercase tracking-widest" onClick={handleAdd}>Add Contact</Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setAdding(true)}
          className="w-full h-12 border-dashed border-2 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} className="text-foreground" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            Add Contact
          </span>
        </Button>
      )}

      <div className="grid gap-3">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <User size={18} className="text-muted-foreground/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold tracking-tight">{c.name}</p>
              {c.role && <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{c.role}</p>}
              <div className="flex items-center gap-4 mt-2">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-[11px] text-primary hover:underline flex items-center gap-1.5 font-medium">
                    <Mail size={12} />
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Phone size={12} />
                    {c.phone}
                  </span>
                )}
                {c.linkedin && (
                  <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1.5 font-medium">
                    <ExternalLink size={12} />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(c.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {contacts.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-2 border-dashed border-border/40 rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center">
            <User size={20} className="text-muted-foreground/20" />
          </div>
          <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">No contacts yet</p>
        </div>
      )}
    </div>
  )
}
