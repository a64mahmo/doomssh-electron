import { render, screen, fireEvent } from '@testing-library/react'
import { SkillsSection } from './SkillsSection'
import { vi, describe, it, expect } from 'vitest'
import { useSection } from '@/hooks/useResume'

vi.mock('@/hooks/useResume', () => ({
  useSection: vi.fn()
}))

describe('SkillsSection', () => {
  const mockUpdateItems = vi.fn()
  
  it('groups skills by category', () => {
    (useSection as any).mockReturnValue({
      section: {
        items: [
          { id: '1', name: 'React', category: 'Frontend' },
          { id: '2', name: 'Node.js', category: 'Backend' },
          { id: '3', name: 'TypeScript', category: 'Frontend' },
        ]
      },
      updateItems: mockUpdateItems
    })

    render(<SkillsSection sectionId="test" />)
    
    // Category names are now input values
    expect(screen.getByDisplayValue('Frontend')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Backend')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('adds a new skill to a category', () => {
    (useSection as any).mockReturnValue({
      section: {
        items: [{ id: '1', name: 'React', category: 'Frontend' }]
      },
      updateItems: mockUpdateItems
    })

    render(<SkillsSection sectionId="test" />)
    
    const inputs = screen.getAllByPlaceholderText(/Add skills/i)
    fireEvent.change(inputs[0], { target: { value: 'Next.js' } })
    
    // The plus button next to the input
    const addButtons = screen.getAllByRole('button')
    // Find the button that contains the plus icon inside the category card
    const addButton = addButtons.find(b => b.querySelector('.lucide-plus'))
    if (addButton) fireEvent.click(addButton)
    
    expect(mockUpdateItems).toHaveBeenCalled()
  })
})
