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

  return (
    <View>
      {renderHeading(viewModel.title)}
      <View style={{ marginTop: 2 }}>{renderMd(text, ctx)}</View>
    </View>
  )
}
