import type { ResumeSection } from '@/lib/store/types';
import type { SectionViewModel, RenderContext, SectionController } from './types';
import type { ExperienceItem } from '@/lib/store/types';

export const experienceController: SectionController = (section, ctx) => {
  const items = (section.items as ExperienceItem[]) || [];
  const { helpers } = ctx;
  const settings = (ctx.settings || {}) as any;

  const processedItems = items.map(item => {
    const isEmployerFirst = settings.experienceOrder === 'employer-title';
    
    return {
      id: item.id,
      primaryText: isEmployerFirst ? item.company : item.position,
      secondaryText: isEmployerFirst ? item.position : item.company,
      location: item.location,
      dateRange: helpers.formatDate(item.startDate, item.endDate, item.present, settings.dateFormat || 'YYYY'),
      description: item.description,
    };
  });

  return {
    title: section.title,
    isVisible: section.visible !== false && processedItems.length > 0,
    type: 'experience',
    items: processedItems,
  };
};
