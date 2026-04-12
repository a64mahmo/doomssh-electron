import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { SkillItem } from '@/lib/store/types'
import type { SectionPDFProps } from './shared'

export function SkillsSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const items = (section.items as SkillItem[]) || []
  if (!items.length) return null
  const { base, lh, colors, bullet, s, pt } = ctx
  const display = s.skillDisplay

  return (
    <View>
      {renderHeading(section.title)}
      {display === 'compact' && (
        <Text style={{ fontSize: pt(base), lineHeight: lh, color: colors.text }}>
          {items.map(sk => sk.name).join(' · ')}
        </Text>
      )}
      {display === 'grid' && (() => {
        const cols = s.skillColumns ?? 3
        const colWidth = `${Math.floor(100 / cols)}%`
        return (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {items.map(sk => (
              <Text key={sk.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh, width: colWidth, marginBottom: 2 }}>
                {bullet} {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
            ))}
          </View>
        )
      })()}
      {display === 'level' && (
        <View>
          {items.map(sk => (
            <View key={sk.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
              <Text style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
                {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
              {sk.level && <Text style={{ fontSize: pt(base * 0.9), lineHeight: lh, color: colors.subtitle }}>{sk.level}</Text>}
            </View>
          ))}
        </View>
      )}
      {display === 'bubble' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {items.map(sk => (
            <Text key={sk.id} style={{
              fontSize: pt(base * 0.85),
              backgroundColor: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text,
              color: colors.background,
              paddingVertical: 2,
              paddingHorizontal: 7,
              borderRadius: 99,
              fontWeight: 500,
            }}>
              {sk.name}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
