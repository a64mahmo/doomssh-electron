import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModernTemplate } from './ModernTemplate'
import { ClassicTemplate } from './ClassicTemplate'
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
    {
      id: 'sk1',
      type: 'skills',
      title: 'Key Skills',
      visible: true,
      items: [
        { id: 'skill-1', name: 'React', category: 'Frontend', level: 'expert' },
        { id: 'skill-2', name: 'Node.js', category: 'Backend', level: 'advanced' },
      ],
    },
  ],
}

describe('Resume Templates Rendering', () => {
  describe('ModernTemplate', () => {
    it('renders basic header information', () => {
      render(<ModernTemplate resume={mockResume} />)
      expect(screen.getByText('John Doe')).toBeDefined()
      expect(screen.getByText('Software Engineer')).toBeDefined()
    })

    it('renders section headings when enabled', () => {
      render(<ModernTemplate resume={mockResume} />)
      expect(screen.getByText('Professional Summary')).toBeDefined()
      expect(screen.getByText('Key Skills')).toBeDefined()
    })

    it('hides section headings when disabled in settings', () => {
      const hiddenSettings = { ...mockResume, settings: { ...DEFAULT_SETTINGS, showSectionLabels: false } }
      render(<ModernTemplate resume={hiddenSettings} />)
      expect(screen.queryByText('Professional Summary')).toBeNull()
    })
  })

  describe('ClassicTemplate', () => {
    it('renders basic header information', () => {
      render(<ClassicTemplate resume={mockResume} />)
      expect(screen.getByText('John Doe')).toBeDefined()
      expect(screen.getByText('Software Engineer')).toBeDefined()
    })

    it('renders contact information', () => {
      render(<ClassicTemplate resume={mockResume} />)
      expect(screen.getByText(/john@example.com/)).toBeDefined()
      expect(screen.getByText(/New York/)).toBeDefined()
    })

    it('renders summary content', () => {
      render(<ClassicTemplate resume={mockResume} />)
      expect(screen.getByText('Experienced developer')).toBeDefined()
    })
  })
})
