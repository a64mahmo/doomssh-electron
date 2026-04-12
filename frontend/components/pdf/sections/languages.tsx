import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { LanguageItem } from '@/lib/store/types'
import type { SectionPDFProps } from './shared'

export function LanguagesSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const items = (section.items as LanguageItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4pt 20pt' }}>
        {items.map(item => (
          <Text key={item.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
            {item.language}
            {item.level && <Text style={{ color: colors.subtitle }}> · {item.level}</Text>}
          </Text>
        ))}
      </View>
    </View>
  )
}
