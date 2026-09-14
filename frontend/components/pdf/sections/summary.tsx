import React from 'react'
import { View } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { renderMd } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function SummarySectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  const text = (viewModel.items[0] as any)?.text || '';

  // The heading travels with the first paragraph so it can't be stranded.
  const lines = renderMd(text, ctx)

  return (
    <View>
      <View wrap={false}>
        {renderHeading(viewModel.title)}
        <View style={{ marginTop: 2 }}>{lines[0]}</View>
      </View>
      {lines.slice(1)}
    </View>
  )
}
