import { experienceController } from './experience';
import type { SectionType, ResumeSection, DateFormat } from '@/lib/store/types';
import type { SectionViewModel, RenderContext, SectionController } from './types';

/** Date line for items the editor stores with a single `date` field. */
function singleDate(
  item: { date?: string; startDate?: string; endDate?: string; present?: boolean },
  ctx: RenderContext,
  s: { dateFormat?: DateFormat },
): string | undefined {
  if (item.date) return ctx.helpers.formatDate(item.date, '', false, s.dateFormat || 'YYYY')
  if (item.startDate) return ctx.helpers.formatDate(item.startDate, item.endDate ?? '', !!item.present, s.dateFormat || 'YYYY')
  return undefined
}

const controllers: Record<SectionType, SectionController> = {
  experience: experienceController,
  header: (section) => ({
    title: section.title,
    isVisible: section.visible !== false,
    type: 'header',
    items: [section.items],
  }),
  summary: (section) => ({
    title: section.title,
    isVisible: section.visible !== false && !!(section.items as any)?.text,
    type: 'summary',
    items: [(section.items as any)],
  }),
  education: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};

    const processedItems = items.map(item => {
      const degreeStr = [item.degree, item.field].filter(Boolean).join(', ');
      return {
        id: item.id,
        primaryText: s.educationOrder === 'school-degree' ? item.institution : (degreeStr || item.institution),
        secondaryText: s.educationOrder === 'school-degree' ? degreeStr : item.institution,
        location: item.location,
        dateRange: ctx.helpers.formatDate(item.startDate, item.endDate, item.present, s.dateFormat || 'YYYY'),
        description: item.description,
        gpa: item.gpa,
      };
    });

    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'education',
      items: processedItems,
    };
  },
  skills: (section) => ({
    title: section.title,
    isVisible: section.visible !== false && (section.items as any[]).length > 0,
    type: 'skills',
    items: section.items as any[],
  }),
  projects: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.name,
      secondaryText: item.url,
      dateRange: item.date ? ctx.helpers.formatDate(item.date, '', false, s.dateFormat || 'YYYY') : undefined,
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'projects',
      items: processedItems,
    };
  },
  certifications: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.name,
      secondaryText: item.issuer,
      dateRange: singleDate(item, ctx, s),
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'certifications',
      items: processedItems,
    };
  },
  languages: (section) => ({
    title: section.title,
    isVisible: section.visible !== false && (section.items as any[]).length > 0,
    type: 'languages',
    items: section.items as any[],
  }),
  awards: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.title ?? item.name,
      secondaryText: item.issuer,
      dateRange: singleDate(item, ctx, s),
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'awards',
      items: processedItems,
    };
  },
  volunteering: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.role ?? item.position,
      secondaryText: item.organization,
      location: item.location,
      dateRange: ctx.helpers.formatDate(item.startDate, item.endDate, item.present, s.dateFormat || 'YYYY'),
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'volunteering',
      items: processedItems,
    };
  },
  publications: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.title,
      secondaryText: item.publisher,
      dateRange: singleDate(item, ctx, s),
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'publications',
      items: processedItems,
    };
  },
  references: (section) => {
    const items = (section.items as any[]) || [];
    return {
      title: section.title,
      isVisible: section.visible !== false && items.length > 0,
      type: 'references',
      items: items.map(item => ({
        ...item,
        primaryText: item.name,
        secondaryText: item.position,
      })),
    };
  },
  custom: (section, ctx) => {
    const items = (section.items as any[]) || [];
    const s = ctx.settings as any || {};
    const processedItems = items.map(item => ({
      id: item.id,
      primaryText: item.title,
      secondaryText: item.subtitle,
      dateRange: item.date ? ctx.helpers.formatDate(item.date, '', false, s.dateFormat || 'YYYY') : undefined,
      description: item.description,
    }));
    return {
      title: section.title,
      isVisible: section.visible !== false && processedItems.length > 0,
      type: 'custom',
      items: processedItems,
    };
  },
};

export function getSectionViewModel(
  section: ResumeSection,
  ctx: RenderContext
): SectionViewModel {
  const controller = controllers[section.type];
  if (!controller) {
    throw new Error(`No controller found for section type: ${section.type}`);
  }
  return controller(section, ctx);
}
