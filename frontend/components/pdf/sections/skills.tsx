import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { getSectionViewModel } from '@/lib/renderers'

export function SkillsSectionPDF({ section, ctx, renderHeading }: SectionPDFProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: ctx.pt,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, lh, colors, bullet, s } = ctx;
  const display = s.skillDisplay;

  return (
    <View>
      {renderHeading(viewModel.title)}
      {display === 'compact' && (
        <Text style={{ fontSize: ctx.pt(base), lineHeight: lh, color: colors.text }}>
          {viewModel.items.map((sk: any) => sk.name).join(' · ')}
        </Text>
      )}
      {display === 'grid' && (() => {
        const cols = s.skillColumns ?? 3;
        const colWidth = `${Math.floor(100 / cols)}%`;
        return (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {viewModel.items.map((sk: any) => (
              <Text key={sk.id} style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh, width: colWidth, marginBottom: 2 }}>
                {bullet} {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
            ))}
          </View>
        );
      })()}
      {display === 'level' && (
        <View>
          {viewModel.items.map((sk: any) => (
            <View key={sk.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
              <Text style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh }}>
                {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
              {sk.level && <Text style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh, color: colors.subtitle }}>{sk.level}</Text>}
            </View>
          ))}
        </View>
      )}
      {display === 'bubble' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {viewModel.items.map((sk: any) => (
            <Text key={sk.id} style={{
              fontSize: ctx.pt(base * 0.85),
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
