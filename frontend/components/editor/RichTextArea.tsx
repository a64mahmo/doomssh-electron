'use client'
import { useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Reset focus and selection
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
    
    insertText('', '') // trigger state sync if needed
    const processed = newLines.join('\n')
    const finalResult = value.substring(0, start) + processed + value.substring(end)
    onChange(finalResult)
  }

  return (
    <div className={cn("group relative flex flex-col rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring/20 transition-all", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1.5 py-1 border-b border-border/50 bg-muted/5">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Bold" variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => insertText('**', '**')}>
                <Bold size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Italic" variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => insertText('_', '_')}>
                <Italic size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border/60 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Bullet List" variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={toggleBullets}>
                <List size={14} />
              </Button>
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
