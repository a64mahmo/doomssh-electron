import React from 'react'
import { View } from '@react-pdf/renderer'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function CertificationsSectionPDF({ section, ctx, renderHeading, isSidebar }: SectionPDFProps) {
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
      {renderHeading(viewModel.title)}
      {viewModel.items.map((item, index) => (
        <Entry key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText || undefined}
          date={item.dateRange}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </View>
  )
}
