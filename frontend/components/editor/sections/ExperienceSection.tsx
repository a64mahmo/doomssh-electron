'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Calendar, MapPin, Building2, Briefcase } from 'lucide-react'
import type { ExperienceItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { MonthYearPicker } from '../MonthYearPicker'
import { RichTextArea } from '../RichTextArea'
import { useAI } from '@/hooks/useAI'
import { toast } from 'sonner'

interface Props { sectionId: string }

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        {Icon && <Icon size={12} className="text-muted-foreground/70" />}
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</Label>
      </div>
      {children}
    </div>
  )
}

export function ExperienceSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as ExperienceItem[]) || []
  const { improveText, loading } = useAI()

  function add() {
    updateItems([{
      id: generateId(), company: '', position: '', location: '',
      startDate: '', endDate: '', present: false, description: '',
    }, ...items])
  }

  function update(id: string, changes: Partial<ExperienceItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
  }

  async function handleAIImprove(id: string, text: string, jobTitle: string) {
    if (!text.trim()) {
      toast.error('Please enter some description first')
      return
    }
    try {
      const improved = await improveText(text, `Job Title: ${jobTitle}`)
      update(id, { description: improved })
      toast.success('Description improved!')
    } catch (err) {
      toast.error('Failed to improve text')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="group relative bg-background rounded-xl border border-border/60 p-4 pt-5 shadow-sm transition-all hover:border-foreground/10 hover:shadow-md"
          >
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-background border border-border rounded text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
              Entry #{items.length - index}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => remove(item.id)}
            >
              <Trash2 size={14} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Position" icon={Briefcase}>
                <Input 
                  placeholder="e.g. Senior Software Engineer"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.position} 
                  onChange={(e) => update(item.id, { position: e.target.value })} 
                />
              </Field>
              <Field label="Company" icon={Building2}>
                <Input 
                  placeholder="e.g. Acme Corp"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.company} 
                  onChange={(e) => update(item.id, { company: e.target.value })} 
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-1">
                <Field label="Location" icon={MapPin}>
                  <Input 
                    placeholder="e.g. Remote / New York"
                    className="h-9 text-xs focus-visible:ring-1" 
                    value={item.location} 
                    onChange={(e) => update(item.id, { location: e.target.value })} 
                  />
                </Field>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <Field label="Start Date" icon={Calendar}>
                  <MonthYearPicker 
                    value={item.startDate} 
                    onChange={(v) => update(item.id, { startDate: v })} 
                  />
                </Field>
                <Field label="End Date" icon={Calendar}>
                  <MonthYearPicker 
                    value={item.endDate} 
                    disabled={item.present}
                    onChange={(v) => update(item.id, { endDate: v })} 
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 ml-0.5">
              <input
                type="checkbox"
                id={`present-${item.id}`}
                checked={item.present}
                onChange={(e) => update(item.id, { present: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor={`present-${item.id}`} className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
                I currently work here
              </label>
            </div>

            <div className="pt-2">
              <Field label="Description & Achievements">
                <RichTextArea
                  placeholder="• Reduced system latency by 40% through query optimization&#10;• Led a team of 5 engineers to deliver..."
                  value={item.description}
                  onChange={(v) => update(item.id, { description: v })}
                  onAIImprove={() => handleAIImprove(item.id, item.description, item.position)}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2 text-xs h-10 border-dashed border-2 hover:border-foreground/20 hover:bg-muted/50 rounded-xl transition-all" 
        onClick={add}
      >
        <Plus size={14} className="text-muted-foreground" />
        <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Add Experience</span>
      </Button>
    </div>
  )
}
