import { render, screen, fireEvent } from '@testing-library/react'
import { RichTextArea } from '@/components/editor/RichTextArea'
import { vi, describe, it, expect } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'

describe('RichTextArea', () => {
  it('renders initial value', () => {
    render(
      <TooltipProvider>
        <RichTextArea value="Hello world" onChange={() => {}} />
      </TooltipProvider>
    )
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(
      <TooltipProvider>
        <RichTextArea value="" onChange={onChange} placeholder="Type here" />
      </TooltipProvider>
    )
    
    const textarea = screen.getByPlaceholderText('Type here')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    expect(onChange).toHaveBeenCalledWith('New text')
  })

  it('inserts bold markers when clicking bold button', () => {
    const onChange = vi.fn()
    render(
      <TooltipProvider>
        <RichTextArea value="Hello" onChange={onChange} />
      </TooltipProvider>
    )
    
    const boldButton = screen.getByRole('button', { name: /bold/i })
    fireEvent.click(boldButton)
    
    // Default insertion at start/end if no selection
    expect(onChange).toHaveBeenCalledWith('****Hello')
  })

  it('toggles bullets when clicking list button', () => {
    const onChange = vi.fn()
    render(
      <TooltipProvider>
        <RichTextArea value="Line 1" onChange={onChange} />
      </TooltipProvider>
    )
    
    const listButton = screen.getByRole('button', { name: /bullet list/i })
    fireEvent.click(listButton)
    
    expect(onChange).toHaveBeenCalledWith('• Line 1')
  })
})
