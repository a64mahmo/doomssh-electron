'use client'
import { useSection } from '@/hooks/useResume'
import { DebouncedRichTextArea } from '@/components/ui/debounced-rich-text-area'
import type { SummaryItem } from '@/lib/store/types'
import { useAI } from '@/hooks/useAI'
import { toast } from 'sonner'
import { ControlGroup, FieldLabel } from '../EditorPrimitives'
import { Sparkles } from 'lucide-react'

interface Props { sectionId: string }

export function SummarySection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const item = (section?.items as SummaryItem) || { text: '' }
  const { improveText } = useAI()

  async function handleAIImprove() {
    if (!item.text.trim()) {
      toast.error('Please enter some summary text first')
      return
    }
    try {
      const improved = await improveText(item.text, 'This is a professional resume summary.')
      updateItems({ text: improved })
      toast.success('Summary improved!')
    } catch {
      toast.error('Failed to improve summary')
    }
  }

  return (
    <div className="space-y-6">
      <ControlGroup title="Professional Summary">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel className="mb-0">Bio / Summary</FieldLabel>
            <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
              <Sparkles size={10} /> AI Enhanced
            </div>
          </div>
          <DebouncedRichTextArea
            rows={8}
            placeholder="A results-driven professional with experience in..."
            value={item.text}
            onChange={(v) => updateItems({ text: v })}
            onAIImprove={handleAIImprove}
          />
          <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
            Highlight your years of experience, key skills, and major achievements. 
            Aim for 3-5 punchy sentences that grab attention.
          </p>
        </div>
      </ControlGroup>
    </div>
  )
}
