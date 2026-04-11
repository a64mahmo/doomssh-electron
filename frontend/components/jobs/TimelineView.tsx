'use client'

import { useState } from 'react'
import { Plus, Trash2, MessageSquare, ArrowRightLeft, Calendar, Flag, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { JobEvent, JobEventType } from '@/lib/store/jobTypes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const eventIcons: Record<JobEventType, any> = {
  'status-change': ArrowRightLeft,
  'note': MessageSquare,
  'interview': Calendar,
  'follow-up': Flag,
  'deadline-passed': Clock,
  'deadline-change': Calendar,
  'other': MessageSquare,
}

const eventColors: Record<JobEventType, string> = {
  'status-change': 'bg-blue-500/10 text-blue-500',
  'note': 'bg-emerald-500/10 text-emerald-500',
  'interview': 'bg-amber-500/10 text-amber-500',
  'follow-up': 'bg-purple-500/10 text-purple-500',
  'deadline-passed': 'bg-red-500/10 text-red-500',
  'deadline-change': 'bg-indigo-500/10 text-indigo-500',
  'other': 'bg-zinc-500/10 text-zinc-500',
}

interface TimelineViewProps {
  events: JobEvent[]
  onAddEvent: (event: Omit<JobEvent, 'id'>) => void
  onRemoveEvent: (eventId: string) => void
}

const inputStyles = "h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"

export function TimelineView({ events, onAddEvent, onRemoveEvent }: TimelineViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function handleSubmit() {
    if (!title.trim()) return
    onAddEvent({
      type: 'note',
      date: new Date().toISOString(),
      title: title.trim(),
      description: description.trim(),
    })
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Add Note */}
      {showForm ? (
        <div className="space-y-4 p-5 rounded-2xl border border-border bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyles}
              autoFocus
            />
            <Textarea
              placeholder="Detailed notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 resize-none py-3"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 px-4 text-xs font-bold uppercase tracking-widest" onClick={handleSubmit}>
              Add Note
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full h-12 border-dashed border-2 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
        >
          <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} className="text-foreground" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            Add Timeline Note
          </span>
        </Button>
      )}

      {/* Timeline */}
      <div className="relative pl-4">
        {sorted.map((event, i) => {
          const Icon = eventIcons[event.type] ?? MessageSquare
          const colorClass = eventColors[event.type]
          
          return (
            <div key={event.id} className="relative flex gap-6 pb-8 group last:pb-0">
              {/* Line */}
              {i < sorted.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border/40" />
              )}
              
              {/* Icon / Dot */}
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm border border-background',
                  colorClass
                )}
              >
                <Icon size={14} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold tracking-tight text-foreground">{event.title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 px-1.5 py-0.5 rounded">
                        <Clock size={10} />
                        {dayjs(event.date).fromNow()}
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-muted-foreground/80 font-medium leading-relaxed bg-muted/10 p-3 rounded-xl border border-border/40 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.type !== 'status-change' && event.type !== 'deadline-passed' && event.type !== 'deadline-change' && (
                    <button
                      onClick={() => onRemoveEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {sorted.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border-2 border-dashed border-border/40 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center">
              <MessageSquare size={20} className="text-muted-foreground/20" />
            </div>
            <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

