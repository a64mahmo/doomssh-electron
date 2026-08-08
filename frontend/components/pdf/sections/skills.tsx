import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { SectionPDFProps } from './shared'
import { hexA } from './shared'
import { getSectionViewModel } from '@/lib/renderers'
import { isLight, LEVEL_ORDER, LEVEL_LABELS, levelScore } from '@/lib/pdf/styleUtils'
import type { ProficiencyLevel } from '@/lib/store/types'

export function SkillsSectionPDF({ section, ctx, renderHeading, isSidebar = false }: SectionPDFProps) {
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

  const bubbleBg = s.applyAccentDotsBarsBubbles ? colors.accent : colors.text;
  const bubbleText = isLight(bubbleBg) ? '#1a1a1a' : colors.background;
  const dotColor = s.applyAccentDotsBarsBubbles ? colors.accent : colors.text;
  const dotSize = Math.max(3, base * 0.42);

  return (
    <View>
      {renderHeading(viewModel.title)}
      {display === 'compact' && (() => {
        const items = viewModel.items as any[];
        // Categorised skills read as "Category: a, b, c" on their own line.
        // Joining everything with · collapses the groups into an unreadable run-on.
        const hasCategories = items.some((sk) => sk.category);
        if (!hasCategories) {
          return (
            <Text style={{ fontSize: ctx.pt(base), lineHeight: lh, color: colors.text }}>
              {items.map((sk) => sk.name).join(' · ')}
            </Text>
          );
        }
        return items.map((sk) => (
          <Text key={sk.id} style={{ fontSize: ctx.pt(base * 0.95), lineHeight: lh, color: colors.text, marginBottom: 2 }}>
            {sk.category && (
              // One string, not several children: @react-pdf treats a run boundary
              // as a break opportunity and slips a hyphen in ("Management-\n:").
              <Text style={{ fontWeight: 'bold', color: s.applyAccentEntrySubtitle ? colors.accent : colors.text }}>
                {`${sk.category}: `}
              </Text>
            )}
            {sk.name}
          </Text>
        ));
      })()}
      {display === 'grid' && (() => {
        // The sidebar is ~32% of the page — multi-column skills wrap to garbage there.
        const cols = isSidebar ? 1 : (s.skillColumns ?? 3);
        const colWidth = `${Math.floor(100 / cols)}%`;
        return (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {viewModel.items.map((sk: any) => (
              <Text key={sk.id} style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh, width: colWidth, marginBottom: 2 }}>
                {`${bullet} ${sk.category ? `${sk.category}: ` : ''}${sk.name}`}
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
                {sk.category ? `${sk.category}: ${sk.name}` : sk.name}
              </Text>
              {sk.level && (
                <Text style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh, color: colors.subtitle }}>
                  {LEVEL_LABELS[sk.level as ProficiencyLevel] ?? sk.level}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      {display === 'dots' && (
        <View>
          {viewModel.items.map((sk: any) => (
            <View key={sk.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: ctx.pt(base * 0.9), lineHeight: lh, flex: 1, marginRight: 8, color: colors.text }}>
                {sk.category ? `${sk.category}: ${sk.name}` : sk.name}
              </Text>
              <View style={{ flexDirection: 'row', flexShrink: 0 }}>
                {LEVEL_ORDER.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: dotSize,
                      height: dotSize,
                      borderRadius: dotSize / 2,
                      marginLeft: i === 0 ? 0 : 2,
                      backgroundColor: i < levelScore(sk.level) ? dotColor : hexA(dotColor, 0.2),
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      {display === 'bubble' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {viewModel.items.map((sk: any) => (
            <Text key={sk.id} style={{
              fontSize: ctx.pt(base * 0.85),
              backgroundColor: bubbleBg,
              color: bubbleText,
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
