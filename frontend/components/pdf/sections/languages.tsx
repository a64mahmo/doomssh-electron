import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function LanguagesSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors, lh } = ctx;

  return (
    <View>
      {renderHeading(viewModel.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4pt 20pt' }}>
        {viewModel.items.map((item: any, index) => (
          <Text key={item.id || index} style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh }}>
            {item.language}
            {item.level && <Text style={{ color: colors.subtitle }}> · {item.level}</Text>}
          </Text>
        ))}
      </View>
    </View>
  )
}
