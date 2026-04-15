'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Trash2, Sparkles, ChevronDown, ChevronRight,
  MessageSquare, BookOpen, ListChecks, ClipboardCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { useAI } from '@/hooks/useAI'
import { generateId } from '@/lib/utils/ids'
import type {
  InterviewPrep,
  InterviewQuestion,
  PostInterviewReflection,
  QuestionCategory,
  JobApplication,
} from '@/lib/store/jobTypes'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_PREP: InterviewPrep = {
  questions: [],
  companyNotes: '',
  cheatSheet: [],
  reflections: [],
}

const CATEGORY_CONFIG: Record<QuestionCategory, { label: string; color: string }> = {
  technical:   { label: 'Technical',   color: 'oklch(0.65 0.15 200)' },
  behavioral:  { label: 'Behavioral',  color: 'oklch(0.65 0.15 140)' },
  situational: { label: 'Situational', color: 'oklch(0.65 0.15 60)' },
  general:     { label: 'General',     color: 'oklch(0.6 0.1 250)' },
}

const inputStyles = 'w-full h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20'
const textareaBase = 'w-full text-xs bg-muted/20 border border-border/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/40'

// ─── Props ────────────────────────────────────────────────────────────────────

interface InterviewPrepTabProps {
  job: JobApplication
  onUpdate: (updates: Partial<JobApplication>) => void
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InterviewPrepTab({ job, onUpdate }: InterviewPrepTabProps) {
  const prep = job.interviewPrep ?? EMPTY_PREP
  const [activeSection, setActiveSection] = useState<'questions' | 'company' | 'cheatsheet' | 'reflections'>('questions')

  const updatePrep = useCallback((updates: Partial<InterviewPrep>) => {
    onUpdate({ interviewPrep: { ...prep, ...updates } })
  }, [prep, onUpdate])

  const sections = [
    { key: 'questions' as const,    icon: MessageSquare, label: 'Questions',       count: prep.questions.length },
    { key: 'company' as const,      icon: BookOpen,      label: 'Company Notes',   count: prep.companyNotes ? 1 : 0 },
    { key: 'cheatsheet' as const,   icon: ListChecks,    label: 'Cheat Sheet',     count: prep.cheatSheet.length },
    { key: 'reflections' as const,  icon: ClipboardCheck,label: 'Reflections',     count: prep.reflections.length },
  ]

  return (
    <div className="space-y-6">
      {/* Section Nav */}
      <div className="flex gap-1.5 flex-wrap">
        {sections.map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeSection === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Icon size={12} />
            {label}
            {count > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                activeSection === key ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {activeSection === 'questions' && (
        <QuestionsSection
          questions={prep.questions}
          job={job}
          onChange={(questions) => updatePrep({ questions })}
        />
      )}
      {activeSection === 'company' && (
        <CompanyNotesSection
          notes={prep.companyNotes}
          onChange={(companyNotes) => updatePrep({ companyNotes })}
        />
      )}
      {activeSection === 'cheatsheet' && (
        <CheatSheetSection
          items={prep.cheatSheet}
          onChange={(cheatSheet) => updatePrep({ cheatSheet })}
        />
      )}
      {activeSection === 'reflections' && (
        <ReflectionsSection
          reflections={prep.reflections}
          onChange={(reflections) => updatePrep({ reflections })}
        />
      )}
    </div>
  )
}

// ─── Questions Section ────────────────────────────────────────────────────────

function QuestionsSection({
  questions,
  job,
  onChange,
}: {
  questions: InterviewQuestion[]
  job: JobApplication
  onChange: (q: InterviewQuestion[]) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newCategory, setNewCategory] = useState<QuestionCategory>('general')
  const [aiChunks, setAiChunks] = useState('')

  const { loading: aiLoading, hasApiKey, generateInterviewQuestions } = useAI({
    onChunk: (chunk) => setAiChunks(prev => prev + chunk),
  })

  const aiDisabled = aiLoading || !hasApiKey

  const handleGenerateAI = async () => {
    if (!hasApiKey) return
    setAiChunks('')
    try {
      const result = await generateInterviewQuestions(
        job.role || 'Software Engineer',
        job.company || 'Company',
        job.notes || job.role || '',
      )

      // Parse JSON from AI response
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed: Array<{ question: string; category: string }> = JSON.parse(jsonMatch[0])
        const newQuestions: InterviewQuestion[] = parsed.map((q) => ({
          id: generateId(),
          question: q.question,
          category: (q.category as QuestionCategory) || 'general',
          answer: '',
        }))
        onChange([...questions, ...newQuestions])
      }
    } catch {
      // Error handled by useAI hook → UIStore
    } finally {
      setAiChunks('')
    }
  }

  const addManual = () => {
    if (!newQuestion.trim()) return
    onChange([...questions, {
      id: generateId(),
      question: newQuestion.trim(),
      category: newCategory,
      answer: '',
    }])
    setNewQuestion('')
    setAdding(false)
  }

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id))
  }

  const updateAnswer = (id: string, answer: string) => {
    onChange(questions.map(q => q.id === id ? { ...q, answer } : q))
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex gap-2 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold uppercase tracking-widest gap-1.5"
                onClick={handleGenerateAI}
                disabled={aiDisabled}
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading ? 'Generating...' : 'AI Generate'}
              </Button>
            </TooltipTrigger>
            {!hasApiKey && (
              <TooltipContent>Add your Anthropic API key in Settings to use AI features</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs font-bold uppercase tracking-widest gap-1.5"
          onClick={() => setAdding(!adding)}
        >
          <Plus size={12} />
          Add Manual
        </Button>
      </div>

      {/* AI streaming indicator */}
      {aiLoading && aiChunks && (
        <div className="p-3 rounded-xl bg-muted/20 border border-border/50 animate-pulse">
          <p className="text-[10px] text-muted-foreground font-mono truncate">{aiChunks.slice(-120)}</p>
        </div>
      )}

      {/* Manual add form */}
      {adding && (
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <Input
            placeholder="Type your interview question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className={inputStyles}
            autoFocus
          />
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              {(Object.keys(CATEGORY_CONFIG) as QuestionCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    newCategory === cat
                      ? 'text-white'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  }`}
                  style={newCategory === cat ? { backgroundColor: CATEGORY_CONFIG[cat].color } : undefined}
                >
                  {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="h-7 px-3 text-xs font-bold uppercase tracking-widest" onClick={addManual}>Add</Button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-2">
        {questions.map((q) => {
          const expanded = expandedId === q.id
          const cfg = CATEGORY_CONFIG[q.category]
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-border bg-card hover:bg-muted/10 transition-colors group"
            >
              <button
                className="w-full flex items-start gap-3 p-4 text-left"
                onClick={() => setExpandedId(expanded ? null : q.id)}
              >
                {expanded
                  ? <ChevronDown size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                  : <ChevronRight size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold uppercase tracking-widest h-4 px-1.5 border-0"
                      style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                    >
                      {cfg.label}
                    </Badge>
                    {q.answer && (
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        Answer drafted
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeQuestion(q.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </button>

              {expanded && (
                <div className="px-4 pb-4 pl-11 animate-in fade-in slide-in-from-top-1 duration-150">
                  {q.category === 'behavioral' ? (
                    <STAREditor
                      value={q.answer}
                      onChange={(answer) => updateAnswer(q.id, answer)}
                    />
                  ) : (
                    <textarea
                      placeholder="Draft your answer here..."
                      value={q.answer}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      rows={4}
                      className={textareaBase}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {questions.length === 0 && !adding && !aiLoading && (
        <EmptyState icon={MessageSquare} label="No questions yet" subtitle="Generate with AI or add manually" />
      )}
    </div>
  )
}

// ─── STAR Method Editor ───────────────────────────────────────────────────────

function STAREditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  // Parse STAR sections from stored value
  const parts = parseSTAR(value)

  const updatePart = (key: keyof typeof parts, text: string) => {
    const updated = { ...parts, [key]: text }
    onChange(serializeSTAR(updated))
  }

  const fields = [
    { key: 'situation' as const, label: 'Situation', placeholder: 'Set the scene. What was the context?' },
    { key: 'task' as const,      label: 'Task',      placeholder: 'What was your specific responsibility?' },
    { key: 'action' as const,    label: 'Action',    placeholder: 'What steps did you take?' },
    { key: 'result' as const,    label: 'Result',    placeholder: 'What was the outcome? Quantify if possible.' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">STAR Method</p>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1 block">
            {label}
          </label>
          <textarea
            placeholder={placeholder}
            value={parts[key]}
            onChange={(e) => updatePart(key, e.target.value)}
            rows={2}
            className={textareaBase}
          />
        </div>
      ))}
    </div>
  )
}

function parseSTAR(raw: string): { situation: string; task: string; action: string; result: string } {
  const def = { situation: '', task: '', action: '', result: '' }
  if (!raw) return def
  try {
    const parsed = JSON.parse(raw)
    return { ...def, ...parsed }
  } catch {
    // Legacy plain text — put it all in situation
    return { ...def, situation: raw }
  }
}

function serializeSTAR(parts: { situation: string; task: string; action: string; result: string }): string {
  return JSON.stringify(parts)
}

// ─── Company Notes Section ────────────────────────────────────────────────────

function CompanyNotesSection({
  notes,
  onChange,
}: {
  notes: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        Company Research Vault
      </p>
      <p className="text-[11px] text-muted-foreground/60">
        Store key facts about the company, their values, recent news, and people you&apos;ll be meeting.
      </p>
      <textarea
        placeholder="Company mission, values, recent funding, team culture, interviewer backgrounds..."
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className={textareaBase}
      />
    </div>
  )
}

// ─── Cheat Sheet Section ──────────────────────────────────────────────────────

function CheatSheetSection({
  items,
  onChange,
}: {
  items: string[]
  onChange: (v: string[]) => void
}) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    onChange([...items, newItem.trim()])
    setNewItem('')
  }

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, value: string) => {
    onChange(items.map((item, i) => i === idx ? value : item))
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        Cheat Sheet
      </p>
      <p className="text-[11px] text-muted-foreground/60">
        Quick talking points for at-a-glance reference during remote interviews.
      </p>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a talking point..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
          className={inputStyles + ' flex-1'}
        />
        <Button size="sm" className="h-9 px-3 text-xs font-bold uppercase tracking-widest" onClick={addItem}>
          Add
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <span className="text-muted-foreground/40 text-xs font-bold mt-2 w-5 text-right shrink-0">{idx + 1}</span>
            <textarea
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              rows={1}
              className={`${textareaBase} flex-1 min-h-[36px]`}
            />
            <button
              onClick={() => removeItem(idx)}
              className="opacity-0 group-hover:opacity-100 p-1.5 mt-1 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <EmptyState icon={ListChecks} label="No talking points yet" />
      )}
    </div>
  )
}

// ─── Reflections Section ──────────────────────────────────────────────────────

function ReflectionsSection({
  reflections,
  onChange,
}: {
  reflections: PostInterviewReflection[]
  onChange: (v: PostInterviewReflection[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const [wentWell, setWentWell] = useState('')
  const [wasDifficult, setWasDifficult] = useState('')
  const [followUp, setFollowUp] = useState('')

  const addReflection = () => {
    if (!wentWell.trim() && !wasDifficult.trim() && !followUp.trim()) return
    onChange([
      {
        id: generateId(),
        date: new Date().toISOString(),
        wentWell: wentWell.trim(),
        wasDifficult: wasDifficult.trim(),
        followUp: followUp.trim(),
      },
      ...reflections,
    ])
    setWentWell('')
    setWasDifficult('')
    setFollowUp('')
    setAdding(false)
  }

  const removeReflection = (id: string) => {
    onChange(reflections.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          Post-Interview Reflections
        </p>
      </div>

      {adding ? (
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-green-500/80 mb-1 block">
              What went well?
            </label>
            <textarea
              placeholder="Strong answers, good rapport, relevant examples..."
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              rows={2}
              className={textareaBase}
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 mb-1 block">
              What was difficult?
            </label>
            <textarea
              placeholder="Tough questions, gaps in knowledge, areas to improve..."
              value={wasDifficult}
              onChange={(e) => setWasDifficult(e.target.value)}
              rows={2}
              className={textareaBase}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500/80 mb-1 block">
              Follow-up tasks
            </label>
            <textarea
              placeholder="Send thank-you note, prepare for next round, research topic X..."
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              rows={2}
              className={textareaBase}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="h-7 px-3 text-xs font-bold uppercase tracking-widest" onClick={addReflection}>
              Save Reflection
            </Button>
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
            Add Reflection
          </span>
        </Button>
      )}

      {/* Reflections list */}
      <div className="space-y-3">
        {reflections.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl border border-border bg-card group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-muted-foreground font-medium">
                {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <button
                onClick={() => removeReflection(r.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {r.wentWell && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-green-500/70">Went well</span>
                  <p className="text-xs text-foreground/80 mt-0.5">{r.wentWell}</p>
                </div>
              )}
              {r.wasDifficult && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/70">Difficult</span>
                  <p className="text-xs text-foreground/80 mt-0.5">{r.wasDifficult}</p>
                </div>
              )}
              {r.followUp && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500/70">Follow-up</span>
                  <p className="text-xs text-foreground/80 mt-0.5">{r.followUp}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {reflections.length === 0 && !adding && (
        <EmptyState icon={ClipboardCheck} label="No reflections yet" subtitle="Log your thoughts after each interview" />
      )}
    </div>
  )
}

// ─── Shared Empty State ───────────────────────────────────────────────────────

function EmptyState({ icon: Icon, label, subtitle }: { icon: typeof MessageSquare; label: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-2 border-dashed border-border/40 rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center">
        <Icon size={20} className="text-muted-foreground/20" />
      </div>
      <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">{label}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/30">{subtitle}</p>}
    </div>
  )
}
