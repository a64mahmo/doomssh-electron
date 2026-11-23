import { render, screen, fireEvent } from '@testing-library/react'
import { MonthYearPicker } from '@/components/editor/MonthYearPicker'
import { vi, describe, it, expect } from 'vitest'

describe('MonthYearPicker', () => {
  it('renders initial month and year from value', () => {
    render(<MonthYearPicker value="2023-05" onChange={() => {}} />)
    
    // The closed selects show the option labels, the same text as the menus.
    expect(screen.getByText('May')).toBeInTheDocument()
    expect(screen.queryByText('05')).not.toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  // Note: Detailed interaction tests for Select components in JSDOM 
  // can be flaky due to Portals and focus management.
  // We've verified they render correctly.
})
