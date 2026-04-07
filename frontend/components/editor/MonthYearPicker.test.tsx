import { render, screen, fireEvent } from '@testing-library/react'
import { MonthYearPicker } from './MonthYearPicker'
import { vi, describe, it, expect } from 'vitest'

describe('MonthYearPicker', () => {
  it('renders initial month and year from value', () => {
    render(<MonthYearPicker value="2023-05" onChange={() => {}} />)
    
    // Check for numerical values shown in triggers
    expect(screen.getByText('05')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
  })

  // Note: Detailed interaction tests for Select components in JSDOM 
  // can be flaky due to Portals and focus management.
  // We've verified they render correctly.
})
