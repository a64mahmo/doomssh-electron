import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

describe('Select', () => {
  it('shows the chosen option’s label when closed, not its value', () => {
    render(
      <Select value="L">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {[['M', 'Medium (M)'], ['L', 'Large (L)']].map(([v, l]) => (
            <SelectItem key={v} value={v}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>,
    )
    expect(screen.getByText('Large (L)')).toBeInTheDocument()
    expect(screen.queryByText(/^L$/)).not.toBeInTheDocument()
  })

  it('keeps a custom display given to SelectValue', () => {
    render(
      <Select value="a">
        <SelectTrigger><SelectValue>{() => 'Custom'}</SelectValue></SelectTrigger>
        <SelectContent><SelectItem value="a">Alpha</SelectItem></SelectContent>
      </Select>,
    )
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })
})
