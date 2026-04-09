'use client'
import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const toolbarBtn = "h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  onAIImprove?: () => void
}

export function RichTextArea({ value, onChange, placeholder, className, rows = 4, onAIImprove }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertText(before: string, after: string = '') {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    // Toggle off: if selection is already wrapped in the markers, remove them
    if (before && after) {
      const beforeStart = value.substring(start - before.length, start)
      const afterEnd = value.substring(end, end + after.length)
      if (beforeStart === before && afterEnd === after) {
        const newText =
          value.substring(0, start - before.length) +
          selectedText +
          value.substring(end + after.length)
        onChange(newText)
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start - before.length, end - before.length)
        }, 0)
        return
      }
    }

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  function toggleBullets() {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (!selectedText) {
      insertText('• ', '')
      return
    }

    const lines = selectedText.split('\n')
    const allHaveBullets = lines.every(l => l.trim().startsWith('•'))

    const newLines = allHaveBullets
      ? lines.map(l => l.replace(/^\s*•\s*/, ''))
      : lines.map(l => l.trim().startsWith('•') ? l : `• ${l}`)

    const processed = newLines.join('\n')
    const finalResult = value.substring(0, start) + processed + value.substring(end)
    onChange(finalResult)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + processed.length)
    }, 0)
  }

  return (
    <div className={cn("group relative flex flex-col rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring/20 transition-all", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1.5 py-1 border-b border-border/50 bg-muted/5">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger aria-label="Bold" className={toolbarBtn} onClick={() => insertText('**', '**')}>
              <Bold size={14} />
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger aria-label="Italic" className={toolbarBtn} onClick={() => insertText('_', '_')}>
              <Italic size={14} />
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border/60 mx-1" />

          <Tooltip>
            <TooltipTrigger aria-label="Bullet List" className={toolbarBtn} onClick={toggleBullets}>
              <List size={14} />
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </div>

        {onAIImprove && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5 gap-1.5"
            onClick={onAIImprove}
          >
            <Sparkles size={12} />
            Improve with AI
          </Button>
        )}
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border-none focus-visible:ring-0 shadow-none resize-none text-xs leading-relaxed p-3"
      />
    </div>
  )
}
