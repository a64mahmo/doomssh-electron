import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { ProjectItem } from '@/lib/store/types'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'

export function ProjectsSectionPDF({ section, ctx, renderHeading, isSidebar }: SectionPDFProps) {
  const items = (section.items as ProjectItem[]) || []
  if (!items.length) return null
  const { base, colors, s, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.name}
          subtitle={item.url ? (
            <Text style={{
              fontSize: pt(base * 0.85),
              color: s.linkBlue ? '#0066cc' : (s.applyAccentLinkIcons ? colors.accent : colors.text),
              textDecoration: s.linkUnderline ? 'underline' : 'none',
            }}>{item.url}</Text>
          ) : undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </View>
  )
}
