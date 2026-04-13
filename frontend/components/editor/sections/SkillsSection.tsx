'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Tag, ListFilter } from 'lucide-react'
import type { SkillItem, ProficiencyLevel } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { useMemo, useState } from 'react'
import { EntryCard } from '../EditorPrimitives'

interface Props { sectionId: string }

export function SkillsSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = useMemo(() => (section?.items as SkillItem[]) || [], [section?.items])
  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)

  // Group items by category for UI
  const categories = useMemo(() => {
    const groups: Record<string, SkillItem[]> = {}
    items.forEach(item => {
      const cat = item.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [items])

  const openId = activeId ?? Object.keys(categories)[0] ?? null

  function addSkill(category: string, name: string) {
    if (!name || !name.trim()) return
    const names = name.split(',').map(n => n.trim()).filter(Boolean)
    const newItems = names.map(n => ({
      id: generateId(),
      name: n,
      level: '' as ProficiencyLevel,
      category: category === 'Other' ? '' : category
    }))
    updateItems([...items, ...newItems])
    setNewSkillText(prev => ({ ...prev, [category]: '' }))
  }

  function removeSkill(id: string) {
    updateItems(items.filter(it => it.id !== id))
  }

  function updateCategory(oldCat: string, newCat: string) {
    if (!newCat.trim() || oldCat === newCat) return
    updateItems(items.map(it => (it.category || 'Other') === oldCat ? { ...it, category: newCat } : it))
    if (activeId === oldCat) setActiveId(newCat)
  }

  function addCategory() {
    const newCat = 'New Category'
    const newItems = [{
      id: generateId(),
      name: '',
      level: '' as ProficiencyLevel,
      category: newCat
    }]
    updateItems([...items, ...newItems])
    setActiveId(newCat)
  }

  function removeCategory(category: string) {
    updateItems(items.filter(it => (it.category || 'Other') !== category))
    if (activeId === category) setActiveId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        {Object.entries(categories).map(([cat, skills], index) => (
          <EntryCard
            key={cat}
            index={index}
            title={cat === 'Other' ? 'Miscellaneous Skills' : cat}
            isOpen={openId === cat}
            onOpenChange={(open) => setActiveId(open ? cat : null)}
            onRemove={() => removeCategory(cat)}
          >
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <Tag size={12} className="text-muted-foreground/40" />
                <input
                  className="text-[11px] font-bold uppercase tracking-widest bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-muted-foreground/30"
                  value={cat === 'Other' ? '' : cat}
                  onChange={(e) => updateCategory(cat, e.target.value)}
                  placeholder="Rename Category..."
                />
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[2rem] px-1">
                {skills.filter(s => s.name).map(skill => (
                  <Badge 
                    key={skill.id} 
                    variant="secondary" 
                    className="pl-2.5 pr-1.5 py-1 gap-1.5 text-[10px] font-semibold bg-muted/50 border border-border/40 hover:bg-muted transition-all rounded-lg group/badge"
                  >
                    {skill.name}
                    <button 
                      onClick={() => removeSkill(skill.id)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
                {skills.filter(s => s.name).length === 0 && (
                  <p className="text-[9px] text-muted-foreground/40 italic py-2">No skills added yet</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <div className="relative flex-1 group/input">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                    <ListFilter size={12} />
                  </div>
<Input
                      className="h-9 text-xs pl-8 bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                      placeholder="Add skills (comma separated)..."
                      value={newSkillText[cat] || ''}
                      onChange={(e) => setNewSkillText(prev => ({ ...prev, [cat]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill(cat, newSkillText[cat])}
                    />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 shrink-0 rounded-lg border-border/50 bg-muted/10 hover:bg-muted" 
                  onClick={() => addSkill(cat, newSkillText[cat])}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </EntryCard>
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={addCategory}
        className="w-full h-12 border-dashed border-2 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
      >
        <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus size={14} className="text-foreground" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          Add Skill Category
        </span>
      </Button>
    </div>
  )
}
