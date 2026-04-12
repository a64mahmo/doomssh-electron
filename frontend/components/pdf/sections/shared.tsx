import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { ResumeSection } from '@/lib/store/types'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'
import { parseMdLines, tokenizeMd } from '@/lib/utils/text'
import { BsIconPDF } from '@/lib/icons/BsIconPDF'

export type HeadingFn = (title: string) => React.ReactNode

export interface SectionPDFProps {
  section: ResumeSection
  ctx: TemplateCtx
  renderHeading: HeadingFn
  isSidebar?: boolean
}

/** Convert 6-digit hex + decimal opacity → rgba string safe for @react-pdf */
export function hexA(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export function renderMd(text: string, ctx: TemplateCtx) {
  const { base, lh, colors, bullet, pt, s } = ctx;
  const lines = parseMdLines(text);

  return lines.map((line, i) => {
    const renderedContent = tokenizeMd(line.content).map((tok, j) => (
      <Text key={j} style={{
        fontWeight: tok.bold ? 'bold' : 'normal',
        fontStyle: tok.italic ? 'italic' : 'normal'
      }}>
        {tok.text}
      </Text>
    ));

    if (line.type === 'bullet') {
      return (
        <View key={i} style={{
          flexDirection: 'row',
          marginLeft: s.indentBody ? 12 : 0,
          marginBottom: 1.5,
        }}>
          <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, marginRight: 6, color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text, flexShrink: 0 }}>
            {bullet}
          </Text>
          <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, flex: 1, color: colors.text }}>
            {renderedContent}
          </Text>
        </View>
      );
    }

    return (
      <Text key={i} style={{
        fontSize: pt(base * 0.92),
        lineHeight: lh,
        marginBottom: 3,
        color: colors.text
      }}>
        {renderedContent}
      </Text>
    );
  });
}

export function Entry({
  title, subtitle, location, date, description, ctx, extraLine, isSidebar = false,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  location?: string
  date?: string
  description?: string
  ctx: TemplateCtx
  extraLine?: React.ReactNode
  isSidebar?: boolean
}) {
  const { base, lh, colors, s, pt } = ctx

  const subStyle: any = {
    fontSize:    pt(base * 0.9),
    fontStyle:   (s.subtitleStyle === 'italic' ? 'italic' : 'normal') as 'italic' | 'normal',
    fontWeight:  (s.subtitleStyle === 'bold'   ? 'bold'   : 'normal') as 'bold' | 'normal',
    color:       s.applyAccentEntrySubtitle ? colors.accent : colors.subtitle,
  }

  const titleSizes = { S: 1.0, M: 1.05, L: 1.15 };
  const currentTitleSize = titleSizes[s.titleSize || "M"];
  const titleFontSize = base * currentTitleSize;
  const titleWeight = s.titleBold !== false ? 'bold' : 'normal'

  const layout = isSidebar ? "full-width" : (s.entryLayout || "date-location-right");

  const DateElement = date ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
      <View style={{ marginRight: 4 }}>
        <BsIconPDF name="calendar" size={8} color={s.applyAccentDates ? colors.accent : colors.date} />
      </View>
      <Text style={{ fontSize: pt(base * 0.85), color: s.applyAccentDates ? colors.accent : colors.date, fontWeight: 500 }}>
        {date}
      </Text>
    </View>
  ) : null;

  const LocationElement = location ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
      <View style={{ marginRight: 4 }}>
        <BsIconPDF name="geo-alt" size={8} color={colors.subtitle} />
      </View>
      <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, fontWeight: 500 }}>
        {location}
      </Text>
    </View>
  ) : null;

  const isSameLine = s.subtitlePlacement === "same-line";

  return (
    <View style={{ marginBottom: Number(ctx.gap.replace('pt', '')) }} wrap={false}>
      {layout === "date-location-right" ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', marginTop: 2 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-location-left" ? (
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginLeft: 8, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text, textAlign: 'right' }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh, textAlign: 'right' }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-start', marginTop: 2 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-content-location" ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text, marginRight: 12 }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {DateElement}
              {date && location && <View style={{ width: 12 }} />}
              {LocationElement}
            </View>
          </View>
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
        </View>
      ) : (
        <View>
          <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text }}>
            {title}
            {subtitle && isSameLine && (
              <Text style={subStyle}>{"  "}{subtitle}</Text>
            )}
          </Text>
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
          {!isSidebar && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              {DateElement}
              {date && location && <View style={{ width: 12 }} />}
              {LocationElement}
            </View>
          )}
        </View>
      )}

      {extraLine}

      {description && (
        <View style={{ marginTop: 3 }}>
          {renderMd(description, ctx)}
        </View>
      )}

      {isSidebar && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          {DateElement}
          {date && location && <View style={{ width: 12 }} />}
          {LocationElement}
        </View>
      )}
    </View>
  )
}
