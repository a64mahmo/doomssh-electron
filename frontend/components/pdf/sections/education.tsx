import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function EducationSectionPDF({ section, ctx, renderHeading, isSidebar }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: formatDateRange,
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors } = ctx;

  return (
    <View>
      {renderHeading(viewModel.title)}
      {viewModel.items.map((item, index) => (
        <Entry 
          key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText || undefined}
          location={item.location}
          date={item.dateRange}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
          extraLine={item.gpa ? (
            <Text style={{ fontSize: ctx.pt(base * 0.85), color: colors.subtitle, marginBottom: 2 }}>GPA: {item.gpa}</Text>
          ) : undefined}
        />
      ))}
    </View>
  )
}
