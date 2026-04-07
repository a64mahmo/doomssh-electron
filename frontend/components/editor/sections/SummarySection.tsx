'use client'
import { useSection } from '@/hooks/useResume'
import { RichTextArea } from '../RichTextArea'
import type { SummaryItem } from '@/lib/store/types'
import { useAI } from '@/hooks/useAI'
import { toast } from 'sonner'

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
    } catch (err) {
      toast.error('Failed to improve summary')
    }
  }

  return (
    <div className="space-y-4">
      <RichTextArea
        rows={6}
        placeholder="A results-driven professional with experience in..."
        value={item.text}
        onChange={(v) => updateItems({ text: v })}
        onAIImprove={handleAIImprove}
      />
      <p className="text-[10px] text-muted-foreground italic px-1">
        Pro tip: A good summary is 3-5 sentences long and highlights your unique value proposition.
      </p>
    </div>
  )
}
