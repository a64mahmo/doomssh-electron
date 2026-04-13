import type { SectionType, ResumeSection, DateFormat } from '@/lib/store/types';

export interface SectionViewModel {
  title: string;
  isVisible: boolean;
  type: SectionType;
  // The actual processed items for rendering
  items: any[]; 
  // Any shared metadata for the section (e.g. total items, status)
  meta?: Record<string, any>;
}

export interface RenderContext {
  // Global settings (colors, fonts, layouts) passed from the store/context
  settings: any;
  // Helper functions (e.g. for date formatting, unit conversion)
  helpers: {
    formatDate: (start: string, end: string, present: boolean, format?: DateFormat) => string;
    pt: (size: number) => string;
  };
}

export type SectionController = (
  section: ResumeSection,
  ctx: RenderContext
) => SectionViewModel;
