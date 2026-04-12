import React from 'react'
import { View } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { renderMd } from './shared'

export function SummarySectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const text = (section.items as { text: string })?.text || ''
  if (!text) return null
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ marginTop: 2 }}>{renderMd(text, ctx)}</View>
    </View>
  )
}
