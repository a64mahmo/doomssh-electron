import { describe, it, expect, vi } from 'vitest';
import { experienceController } from '@/lib/renderers/experience';
import type { RenderContext } from '@/lib/renderers/types';

describe('experienceController', () => {
  const mockCtx: RenderContext = {
    settings: {
      experienceOrder: 'position-employer',
      dateFormat: 'MMMM YYYY',
    },
    helpers: {
      formatDate: (s, e, p, f) => `${s} - ${e || (p ? 'Present' : '')}`,
      pt: (s) => `${s}pt`,
    },
  };

  const mockSection = {
    id: 'sec-1',
    type: 'experience' as const,
    title: 'Experience',
    visible: true,
    items: [
      {
        id: 'item-1',
        company: 'Acme Corp',
        position: 'Software Engineer',
        location: 'New York',
        startDate: '2020-01',
        endDate: '2022-01',
        present: false,
        description: 'Built stuff',
      },
    ],
  };

  it('should correctly map position as primary when order is position-employer', () => {
    const vm = experienceController(mockSection as any, mockCtx);
    expect(vm.items[0].primaryText).toBe('Software Engineer');
    expect(vm.items[0].secondaryText).toBe('Acme Corp');
  });

  it('should correctly map company as primary when order is employer-title', () => {
    const ctx = { ...mockCtx, settings: { ...mockCtx.settings, experienceOrder: 'employer-title' } };
    const vm = experienceController(mockSection as any, ctx);
    expect(vm.items[0].primaryText).toBe('Acme Corp');
    expect(vm.items[0].secondaryText).toBe('Software Engineer');
  });

  it('should hide section if no items are present', () => {
    const sectionNoItems = { ...mockSection, items: [] };
    const vm = experienceController(sectionNoItems as any, mockCtx);
    expect(vm.isVisible).toBe(false);
  });
});
