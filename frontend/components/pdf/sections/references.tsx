import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function ReferencesSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors, lh, s } = ctx;

  return (
    <View>
      {renderHeading(viewModel.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8pt 24pt' }}>
        {viewModel.items.map((item: any, index) => (
          <View key={item.id || index} style={{ minWidth: 140 }}>
            <Text style={{ fontWeight: 'bold', fontSize: ctx.pt(base * 0.9), lineHeight: 1.4 }}>{item.primaryText}</Text>
            {item.secondaryText && <Text style={{ fontSize: ctx.pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.secondaryText}</Text>}
            {item.company && <Text style={{ fontSize: ctx.pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.company}</Text>}
            {item.email && <Text style={{ fontSize: ctx.pt(base * 0.82), color: s.applyAccentLinkIcons ? colors.accent : colors.text, lineHeight: lh }}>{item.email}</Text>}
            {item.phone && <Text style={{ fontSize: ctx.pt(base * 0.82), color: colors.subtitle, lineHeight: lh }}>{item.phone}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}
