import React from 'react'
import { View } from '@react-pdf/renderer'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function VolunteeringSectionPDF({ section, ctx, renderHeading, isSidebar, isLastInColumn }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: formatDateRange,
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  return (
    <View>
      {viewModel.items.length === 0 && renderHeading(viewModel.title)}
      {viewModel.items.map((item, index) => (
        <Entry heading={index === 0 ? renderHeading(viewModel.title) : undefined} isLast={isLastInColumn && index === viewModel.items.length - 1} key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText || undefined}
          date={item.dateRange}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </View>
  )
}
