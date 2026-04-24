'use client'
import { useState, useMemo } from 'react'
import { FileText, Sparkles, Loader2, Wand2, ChevronDown, Info } from 'lucide-react'
import { RichTextArea } from '@/components/editor/RichTextArea'
import { useResumeStore } from '@/lib/store/resumeStore'
import { useJobStore } from '@/lib/store/jobStore'
import { useAI } from '@/hooks/useAI'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ControlGroup } from '@/components/editor/EditorPrimitives'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TONES = ['formal', 'enthusiastic', 'confident', 'friendly'] as const
const WORD_TARGET = { min: 250, max: 400 }

export function EditorCard() {
  const resume = useResumeStore(s => s.resume)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)
  const jobs = useJobStore(s => s.jobs)
  const ai = useAI()
  const [aiBusy, setAiBusy] = useState<null | 'generate' | 'improve' | 'shorten' | 'tone'>(null)

  const cl = resume?.coverLetter
  const header = resume?.sections.find(s => s.type === 'header')?.items as Record<string, string> | undefined
  const linkedJob = useMemo(
    () => jobs.find(j => j.id === cl?.linkedJobId),
    [jobs, cl?.linkedJobId],
  )

  const wordCount = cl?.body ? cl.body.trim().split(/\s+/).filter(Boolean).length : 0
  const wordStatus: 'low' | 'ok' | 'high' =
    wordCount < WORD_TARGET.min ? 'low' : wordCount > WORD_TARGET.max ? 'high' : 'ok'

  function resumeContextForAI(): string {
    const parts: string[] = []
    if (header?.fullName) parts.push(`Name: ${header.fullName}`)
    if (header?.jobTitle) parts.push(`Current title: ${header.jobTitle}`)
    if (header?.email) parts.push(`Email: ${header.email}`)
    return parts.join('\n')
  }

  async function runGenerate(tone: typeof TONES[number] = 'formal') {
    setAiBusy('generate')
    try {
      const out = await ai.generateCoverLetter({
        jobTitle: linkedJob?.role || '',
        company: linkedJob?.company || cl?.recipient.company || '',
        jobDescription: linkedJob?.notes || '',
        candidateName: header?.fullName || cl?.signature.fullName || '',
        resumeContext: resumeContextForAI(),
        tone,
      })
      if (out.trim()) updateCoverLetter({ body: out.trim() + '\n' })
    } catch { /* error handled by useAI */ }
    finally { setAiBusy(null) }
  }

  async function runImprove() {
    if (!cl?.body.trim()) return
    setAiBusy('improve')
    try {
      const out = await ai.improveCoverLetter(cl.body, linkedJob
        ? `Role: ${linkedJob.role} at ${linkedJob.company}`
        : undefined)
      if (out.trim()) updateCoverLetter({ body: out.trim() + '\n' })
    } catch { /**/ }
    finally { setAiBusy(null) }
  }

  async function runShorten() {
    if (!cl?.body.trim()) return
    setAiBusy('shorten')
    try {
      const out = await ai.shortenCoverLetter(cl.body)
      if (out.trim()) updateCoverLetter({ body: out.trim() + '\n' })
    } catch { /**/ }
    finally { setAiBusy(null) }
  }

  async function runTone(tone: string) {
    if (!cl?.body.trim()) return
    setAiBusy('tone')
    try {
      const out = await ai.rewriteCoverLetterTone(cl.body, tone)
      if (out.trim()) updateCoverLetter({ body: out.trim() + '\n' })
    } catch { /**/ }
    finally { setAiBusy(null) }
  }

  if (!cl) return null

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ControlGroup 
        title="Letter Composition"
        rightElement={
          <div className={cn(
            "px-2 py-0.5 rounded-md text-[9px] font-mono tabular-nums border transition-colors",
            wordStatus === 'ok' && "bg-emerald-500/5 text-emerald-600 border-emerald-500/20",
            wordStatus === 'low' && "bg-muted text-muted-foreground border-border/50",
            wordStatus === 'high' && "bg-amber-500/5 text-amber-600 border-amber-500/20",
          )}>
            {wordCount} words
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      render={
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-background hover:bg-accent/40 rounded-xl"
                        >
                          {aiBusy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-primary" />}
                          AI Assistant
                          <ChevronDown size={10} className="opacity-50" />
                        </Button>
                      }
                      disabled={aiBusy !== null || !ai.hasApiKey}
                    />
                    <DropdownMenuContent align="start" className="w-56 rounded-xl shadow-xl">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Drafting</DropdownMenuLabel>
                      {TONES.map(t => (
                        <DropdownMenuItem key={t} onClick={() => runGenerate(t)} className="text-xs py-2">
                          < Wand2 size={13} className="mr-2 opacity-50" />
                          <span className="capitalize">Write {t} draft</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Revision</DropdownMenuLabel>
                      <DropdownMenuItem onClick={runImprove} className="text-xs py-2">Improve Writing</DropdownMenuItem>
                      <DropdownMenuItem onClick={runShorten} className="text-xs py-2">Shorten Text</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Change Tone</DropdownMenuLabel>
                      {TONES.map(t => (
                        <DropdownMenuItem key={`tone-${t}`} onClick={() => runTone(t)} className="text-xs py-2">
                          <span className="capitalize">{t}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                {!ai.hasApiKey && (
                  <TooltipContent>Add your Anthropic API key in Settings to use AI features</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative group/editor">
            <RichTextArea
              value={cl.body}
              onChange={(v) => updateCoverLetter({ body: v })}
              rows={22}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in..."
              className="bg-muted/10 border-border/40 focus:bg-background transition-all min-h-[500px] rounded-2xl p-6 text-[13px] leading-relaxed"
            />
            
            {!cl.body.trim() && !aiBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10 shadow-sm">
                  <Sparkles size={32} className="text-primary/30" />
                </div>
                <h4 className="text-sm font-bold tracking-tight mb-2">Blank Canvas</h4>
                <p className="text-[11px] text-muted-foreground/60 max-w-[240px] leading-relaxed">
                  Use the AI Assistant above to generate a high-quality draft based on your profile and target job.
                </p>
              </div>
            )}

            {aiBusy && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Loader2 size={24} className="text-primary animate-spin" />
                  </div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest animate-pulse">
                    AI Processing...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
            <Info size={14} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-primary/70">
              <strong className="font-bold text-primary">Writing Tip:</strong> Aim for a narrative that highlights your impact. Use the AI to discover powerful phrasing, then personalize it to reflect your true voice. Optimal length is {WORD_TARGET.min}–{WORD_TARGET.max} words.
            </p>
          </div>
        </div>
      </ControlGroup>
    </div>
  )
}
