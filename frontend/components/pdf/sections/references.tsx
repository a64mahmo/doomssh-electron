import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { ReferenceItem } from '@/lib/store/types'
import type { SectionPDFProps } from './shared'

export function ReferencesSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const items = (section.items as ReferenceItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt, s } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8pt 24pt' }}>
        {items.map(item => (
          <View key={item.id} style={{ minWidth: 140 }}>
            <Text style={{ fontWeight: 'bold', fontSize: pt(base * 0.9), lineHeight: 1.4 }}>{item.name}</Text>
            {item.position && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.position}</Text>}
            {item.company && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.company}</Text>}
            {item.email && <Text style={{ fontSize: pt(base * 0.82), color: s.applyAccentLinkIcons ? colors.accent : colors.text, lineHeight: lh }}>{item.email}</Text>}
            {item.phone && <Text style={{ fontSize: pt(base * 0.82), color: colors.subtitle, lineHeight: lh }}>{item.phone}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}
