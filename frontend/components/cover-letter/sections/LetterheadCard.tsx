'use client'
import { Link as LinkIcon, Unlink, PencilLine, Lock, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldLabel, ControlGroup } from '@/components/editor/EditorPrimitives'
import { useResumeStore } from '@/lib/store/resumeStore'
import { getAllResumes, getResume } from '@/lib/db/database'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Resume, HeaderData } from '@/lib/store/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const TEMPLATE_GRADIENT: Record<string, string> = {
  modern:  'from-violet-500 to-indigo-600',
  classic: 'from-slate-500 to-slate-700',
  minimal: 'from-zinc-400 to-zinc-600',
  crisp:   'from-sky-500 to-blue-600',
  tokyo:   'from-rose-500 to-pink-600',
  elite:   'from-emerald-600 to-teal-800',
}

export function LetterheadCard() {
  const resume = useResumeStore(s => s.resume)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)
  const updateSectionItems = useResumeStore(s => s.updateSectionItems)
  const [resumes, setResumes] = useState<Resume[]>([])

  useEffect(() => {
    let cancelled = false
    getAllResumes().then(all => { if (!cancelled) setResumes(all) })
    return () => { cancelled = true }
  }, [])

  const cl = resume?.coverLetter
  const isSyncOn = cl?.syncWithResume ?? false
  const headerSection = resume?.sections.find(s => s.type === 'header')
  const header = headerSection?.items as Record<string, string> | undefined
  
  const linkedResume = useMemo(() => 
    resumes.find(r => r.id === cl?.linkedResumeId),
    [resumes, cl?.linkedResumeId]
  )

  useEffect(() => {
    if (!isSyncOn || !cl?.linkedResumeId || !headerSection?.id) return
    let cancelled = false
    getResume(cl.linkedResumeId).then(source => {
      if (cancelled || !source) return
      const srcHeader = source.sections.find(s => s.type === 'header')?.items as HeaderData | undefined
      if (!srcHeader) return
      useResumeStore.getState().updateSectionItems(headerSection.id, { ...srcHeader } as any)
    })
    return () => { cancelled = true }
  }, [isSyncOn, cl?.linkedResumeId, headerSection?.id])

  function updateHeader(patch: Record<string, string>) {
    if (!headerSection) return
    updateSectionItems(headerSection.id, { ...(header || {}), ...patch } as any)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ControlGroup title="Profile Connection">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {!isSyncOn ? (
                <motion.button
                  key="disconnected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => updateCoverLetter({ syncWithResume: true })}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <LinkIcon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">Connect a Resume</p>
                      <p className="text-[10px] text-muted-foreground">Keep your contact details synced across documents.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-muted group-hover:bg-primary/20 text-[10px] font-bold uppercase tracking-widest transition-colors">
                    Link
                  </div>
                </motion.button>
              ) : (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br shadow-inner flex flex-col items-center justify-center gap-0.5",
                        TEMPLATE_GRADIENT[linkedResume?.template || 'modern']
                      )}>
                        <div className="w-6 h-0.5 rounded-full bg-white/40" />
                        <div className="w-4 h-0.5 rounded-full bg-white/20" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold tracking-tight">{linkedResume?.name || 'Loading Resume...'}</p>
                          <div className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-black uppercase tracking-tighter text-primary/70 border border-primary/20">Synced</div>
                        </div>
                        <p className="text-[10px] text-primary/60 font-medium">Mirroring contact info live.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/10"
                        onClick={() => updateCoverLetter({ syncWithResume: false })}
                        title="Unlink Resume"
                      >
                        <Unlink size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <FieldLabel className="text-primary/40 text-[9px] uppercase tracking-widest">Switch Source Profile</FieldLabel>
                    <Select
                      value={cl?.linkedResumeId || '__none__'}
                      onValueChange={(v) => updateCoverLetter({ linkedResumeId: v === '__none__' ? null : v })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-primary/5 border-primary/10 rounded-xl text-primary font-medium focus:ring-primary/20 w-full">
                        <SelectValue>
                          {linkedResume?.name || 'Pick a source resume...'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-primary/10 shadow-2xl">
                        <SelectItem value="__none__" className="text-xs py-2.5">
                          <span className="opacity-50">Don't sync with a resume</span>
                        </SelectItem>
                        {resumes.map(r => (
                          <SelectItem key={r.id} value={r.id} className="text-xs py-2.5 font-medium">
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-border/40">
            <div className={cn("grid grid-cols-2 gap-x-8 gap-y-6 transition-all duration-300", isSyncOn && "opacity-60")}>
              <div className="col-span-2 relative">
                <FieldLabel>Full Name</FieldLabel>
                <Input 
                  value={header?.fullName || ''} 
                  onChange={(e) => updateHeader({ fullName: e.target.value })} 
                  placeholder="John Doe"
                  disabled={isSyncOn}
                  className={cn("h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all", isSyncOn && "bg-muted/40 cursor-not-allowed pr-10 border-primary/10")}
                />
                {isSyncOn && <Lock size={12} className="absolute right-3.5 bottom-3.5 text-primary/30" />}
              </div>
              <div className="col-span-2 relative">
                <FieldLabel>Job Title</FieldLabel>
                <Input 
                  value={header?.jobTitle || ''} 
                  onChange={(e) => updateHeader({ jobTitle: e.target.value })} 
                  placeholder="Product Designer"
                  disabled={isSyncOn}
                  className={cn("h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all", isSyncOn && "bg-muted/40 cursor-not-allowed pr-10 border-primary/10")}
                />
                {isSyncOn && <Lock size={12} className="absolute right-3.5 bottom-3.5 text-primary/30" />}
              </div>
              <div className="relative">
                <FieldLabel>Email Address</FieldLabel>
                <Input 
                  value={header?.email || ''} 
                  onChange={(e) => updateHeader({ email: e.target.value })} 
                  placeholder="john@doe.com"
                  disabled={isSyncOn}
                  className={cn("h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all", isSyncOn && "bg-muted/40 cursor-not-allowed pr-10 border-primary/10")}
                />
                {isSyncOn && <Lock size={12} className="absolute right-3.5 bottom-3.5 text-primary/30" />}
              </div>
              <div className="relative">
                <FieldLabel>Phone Number</FieldLabel>
                <Input 
                  value={header?.phone || ''} 
                  onChange={(e) => updateHeader({ phone: e.target.value })} 
                  placeholder="+1 555 0000"
                  disabled={isSyncOn}
                  className={cn("h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all", isSyncOn && "bg-muted/40 cursor-not-allowed pr-10 border-primary/10")}
                />
                {isSyncOn && <Lock size={12} className="absolute right-3.5 bottom-3.5 text-primary/30" />}
              </div>
            </div>

            {isSyncOn && (
              <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                <PencilLine size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Read-Only Mode</p>
                  <p className="text-[10px] text-blue-600/70 leading-relaxed">
                    These fields are locked because they are being synced from your resume. To edit them, update the source resume or disconnect it above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ControlGroup>
    </div>
  )
}
