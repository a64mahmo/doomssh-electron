'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Languages, Signal } from 'lucide-react'
import type { LanguageItem, ProficiencyLevel } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'

interface Props { sectionId: string }

const LEVELS = [
  { value: 'none', label: 'No level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert / Native' },
]

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

export function LanguagesSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as LanguageItem[]) || []

  function add() {
    updateItems([{ id: generateId(), language: '', level: '' }, ...items])
  }

  function update(id: string, changes: Partial<LanguageItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
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
              <Field label="Language" icon={Languages}>
                <Input 
                  placeholder="e.g. English"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.language} 
                  onChange={(e) => update(item.id, { language: e.target.value })} 
                />
              </Field>
              <Field label="Proficiency" icon={Signal}>
                <Select
                  value={item.level || 'none'}
                  onValueChange={(v) => update(item.id, { level: v === 'none' ? '' : v as ProficiencyLevel })}
                >
                  <SelectTrigger className="h-9 text-xs focus:ring-1">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Add Language</span>
      </Button>
    </div>
  )
}
