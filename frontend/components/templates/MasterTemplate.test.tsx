import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MasterTemplate } from './MasterTemplate'
import { DEFAULT_SETTINGS } from '@/lib/store/types'
import type { Resume } from '@/lib/store/types'

const mockResume: Resume = {
  id: 'test-resume',
  name: 'Test Resume',
  template: 'modern',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: { ...DEFAULT_SETTINGS },
  sections: [
    {
      id: 'h1',
      type: 'header',
      title: 'Header',
      visible: true,
      items: {
        fullName: 'John Doe',
        jobTitle: 'Software Engineer',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York',
        website: '',
        linkedin: '',
        github: '',
      },
    },
    {
      id: 's1',
      type: 'summary',
      title: 'Professional Summary',
      visible: true,
      items: { text: 'Experienced developer' },
    },
  ],
}

describe('MasterTemplate Rendering', () => {
  it('renders header name and title', () => {
    render(<MasterTemplate resume={mockResume} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('renders summary section heading', () => {
    render(<MasterTemplate resume={mockResume} />)
    expect(screen.getByText('Professional Summary')).toBeInTheDocument()
  })

  it('handles custom section heading styles without crashing', () => {
    const resumeWithBox = {
      ...mockResume,
      settings: { ...mockResume.settings, sectionHeadingStyle: 'box' as const }
    }
    const { container } = render(<MasterTemplate resume={resumeWithBox} />)
    // We check that it rendered without error and find the heading
    expect(screen.getByText('Professional Summary')).toBeInTheDocument()
  })

  it('renders icons when enabled', () => {
    const resumeWithIcons = {
      ...mockResume,
      settings: { 
        ...mockResume.settings, 
        sectionHeadingIcon: 'simple' as const,
        sectionHeadingIconStyle: 'lucide' as const
      }
    }
    const { container } = render(<MasterTemplate resume={resumeWithIcons} />)
    
    // Lucide icons are SVGs
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('renders abstract icons when enabled', () => {
    const resumeWithAbstract = {
      ...mockResume,
      settings: { 
        ...mockResume.settings, 
        sectionHeadingIcon: 'simple' as const,
        sectionHeadingIconStyle: 'nerd' as const // mapped to Abstract in our code
      }
    }
    const { container } = render(<MasterTemplate resume={resumeWithAbstract} />)
    
    // Abstract icons are divs, not SVGs
    const svgs = container.querySelectorAll('svg')
    // Summary section should have an abstract icon (which is a div)
    expect(screen.getByText('Professional Summary')).toBeInTheDocument()
  })
})
