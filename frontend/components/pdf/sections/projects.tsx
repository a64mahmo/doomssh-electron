import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function ProjectsSectionPDF({ section, ctx, renderHeading, isSidebar }: SectionPDFProps) {
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
        <Entry key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText ? (
            <Text style={{
              fontSize: ctx.pt(base * 0.85),
              color: ctx.s.linkBlue ? '#0066cc' : (ctx.s.applyAccentLinkIcons ? colors.accent : colors.text),
              textDecoration: ctx.s.linkUnderline ? 'underline' : 'none',
            }}>{item.secondaryText}</Text>
          ) : undefined}
          date={item.dateRange}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </View>
  )
}
