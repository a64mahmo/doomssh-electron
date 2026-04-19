'use client'
import { useRef } from 'react'
import { useResumeStore } from '@/lib/store/resumeStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RichTextArea } from '@/components/editor/RichTextArea'
import { FieldLabel, ControlGroup } from '@/components/editor/EditorPrimitives'
import { User, Calendar, Building, FileText, PenLine, Sparkles, RefreshCw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

export function CoverLetterEditorPanel() {
  const resume = useResumeStore(s => s.resume)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)
  const updateSectionItems = useResumeStore(s => s.updateSectionItems)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!resume || !resume.coverLetter) return null
  const cl = resume.coverLetter
  const headerSection = resume.sections.find(s => s.type === 'header')
  const header = headerSection?.items as Record<string, string> | undefined

  function updateHeader(patch: Record<string, string>) {
    if (!headerSection) return
    updateSectionItems(headerSection.id, { ...(header || {}), ...patch } as any)
  }

  const wordCount = cl.body ? cl.body.trim().split(/\s+/).filter(Boolean).length : 0
  const charCount = cl.body?.length || 0

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="max-w-xl mx-auto p-6 space-y-10 pb-32">
          
          {/* Header Sync Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Personal Letterhead</h3>
                  <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Your contact info as it appears at the top.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-accent/30 px-3 py-1.5 rounded-full border border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sync Resume</span>
                <Switch
                  checked={cl.syncWithResume}
                  onCheckedChange={(v) => updateCoverLetter({ syncWithResume: v })}
                />
              </div>
            </div>

            <div className={cn("grid grid-cols-2 gap-4 transition-opacity", cl.syncWithResume && "opacity-50 pointer-events-none")}>
              <div className="col-span-2">
                <FieldLabel>Full Name</FieldLabel>
                <Input value={header?.fullName || ''} onChange={(e) => updateHeader({ fullName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Job Title</FieldLabel>
                <Input value={header?.jobTitle || ''} onChange={(e) => updateHeader({ jobTitle: e.target.value })} placeholder="Software Engineer" />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <Input value={header?.email || ''} onChange={(e) => updateHeader({ email: e.target.value })} placeholder="john@doe.com" />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <Input value={header?.phone || ''} onChange={(e) => updateHeader({ phone: e.target.value })} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Location</FieldLabel>
                <Input value={header?.location || ''} onChange={(e) => updateHeader({ location: e.target.value })} placeholder="New York, NY" />
              </div>
            </div>
            {cl.syncWithResume && (
              <div className="flex items-center gap-2 py-2 px-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <RefreshCw size={12} className="text-blue-500 animate-spin-slow" />
                <p className="text-[10px] font-medium text-blue-600/80">Currently syncing with your primary resume data.</p>
              </div>
            )}
          </section>

          <Separator className="opacity-50" />

          {/* Date & Recipient Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Building size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Recipient Details</h3>
                <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Who are you writing to?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <FieldLabel>Letter Date</FieldLabel>
                  <Input
                    type="date"
                    value={cl.date}
                    onChange={(e) => updateCoverLetter({ date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <FieldLabel>Contact Person (e.g. Hiring Manager)</FieldLabel>
                <Input
                  value={cl.recipient.hrName}
                  onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, hrName: e.target.value } })}
                  placeholder="Hiring Manager"
                />
              </div>
              <div>
                <FieldLabel>Company Name</FieldLabel>
                <Input
                  value={cl.recipient.company}
                  onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, company: e.target.value } })}
                  placeholder="Target Company LLC"
                />
              </div>
              <div>
                <FieldLabel>Company Address</FieldLabel>
                <Textarea
                  rows={2}
                  value={cl.recipient.address}
                  onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, address: e.target.value } })}
                  placeholder="123 Business Way, City, State 12345"
                  className="resize-none"
                />
              </div>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Letter Body Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Letter Content</h3>
                  <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Draft your story here.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground tabular-nums bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                <span>{wordCount} words</span>
                <span className="opacity-30">•</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            <div className="relative group/editor">
              <RichTextArea
                value={cl.body}
                onChange={(v) => updateCoverLetter({ body: v })}
                rows={18}
                placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in…"
                className="bg-muted/5 border-border/60 focus:bg-background transition-colors"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover/editor:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger render={
                      <button className="p-1.5 rounded-lg bg-background border border-border shadow-sm text-primary hover:bg-accent transition-colors">
                        <Sparkles size={14} />
                      </button>
                    } />
                    <TooltipContent side="left">
                      <p className="text-xs font-semibold">AI Assistant Coming Soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Info size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[10px] leading-relaxed text-primary/80">
                <strong className="font-bold">Pro-tip:</strong> Use markdown for styling. Single dashes or bullets create list items. Use double-newlines between paragraphs.
              </p>
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* Signature Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <PenLine size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Closing & Signature</h3>
                <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Final sign-off details.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FieldLabel>Signed Name</FieldLabel>
                <Input
                  value={cl.signature.fullName}
                  onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, fullName: e.target.value } })}
                  placeholder="Your Full Name"
                />
              </div>
              <div>
                <FieldLabel>Location (Place)</FieldLabel>
                <Input
                  value={cl.signature.place}
                  onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, place: e.target.value } })}
                  placeholder="New York, NY"
                />
              </div>
              <div>
                <FieldLabel>Signing Date</FieldLabel>
                <Input
                  type="date"
                  value={cl.signature.date}
                  onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, date: e.target.value } })}
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
