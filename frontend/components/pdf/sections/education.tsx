import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { EducationItem } from '@/lib/store/types'
import { formatDateRange } from '@/lib/utils/dates'
import type { SectionPDFProps } from './shared'
import { Entry } from './shared'

export function EducationSectionPDF({ section, ctx, renderHeading, isSidebar }: SectionPDFProps) {
  const items = (section.items as EducationItem[]) || []
  if (!items.length) return null
  const { s, base, colors, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      {items.map(item => {
        const degreeStr = [item.degree, item.field].filter(Boolean).join(', ')
        const title = s.educationOrder === 'school-degree' ? item.institution : (degreeStr || item.institution)
        const sub = s.educationOrder === 'school-degree' ? degreeStr : item.institution
        return (
          <Entry key={item.id}
            title={title}
            subtitle={sub || undefined}
            location={item.location}
            date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
            extraLine={item.gpa ? (
              <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, marginBottom: 2 }}>GPA: {item.gpa}</Text>
            ) : undefined}
          />
        )
      })}
    </View>
  )
}
