'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Layout, Subtitles, Calendar } from 'lucide-react'
import type { CustomItem } from '@/lib/store/types'
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

export function CustomSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as CustomItem[]) || []
  const { improveText } = useAI()

  function add() {
    updateItems([{ id: generateId(), title: '', subtitle: '', date: '', description: '' }, ...items])
  }

  function update(id: string, changes: Partial<CustomItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
  }

  async function handleAIImprove(id: string, text: string, title: string) {
    if (!text.trim()) {
      toast.error('Please enter some description first')
      return
    }
    try {
      const improved = await improveText(text, `Context: ${title}`)
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
              <Field label="Title" icon={Layout}>
                <Input 
                  placeholder="e.g. Major Achievement"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.title} 
                  onChange={(e) => update(item.id, { title: e.target.value })} 
                />
              </Field>
              <Field label="Subtitle" icon={Subtitles}>
                <Input 
                  placeholder="e.g. Context or Location"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.subtitle} 
                  onChange={(e) => update(item.id, { subtitle: e.target.value })} 
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Field label="Date" icon={Calendar}>
                <MonthYearPicker 
                  value={item.date} 
                  onChange={(v) => update(item.id, { date: v })} 
                />
              </Field>
            </div>

            <div className="pt-2">
              <Field label="Description">
                <RichTextArea
                  placeholder="Details about this entry..."
                  value={item.description}
                  onChange={(v) => update(item.id, { description: v })}
                  onAIImprove={() => handleAIImprove(item.id, item.description, item.title)}
                  rows={3}
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
        <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Add Entry</span>
      </Button>
    </div>
  )
}
