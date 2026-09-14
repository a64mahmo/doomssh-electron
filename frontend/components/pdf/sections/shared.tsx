import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { ResumeSection } from '@/lib/store/types'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'
import { parseMdLines, tokenizeMd } from '@/lib/utils/text'
import { BsIconPDF } from '@/lib/icons/BsIconPDF'

export type HeadingFn = (title: string) => React.ReactNode

/**
 * Cap on the date/location column of an entry. Without it that column is sized
 * to its widest content, so a long location ("Kitchener–Waterloo–Cambridge
 * Regional Municipality, Ontario") starves the title column and the job title
 * wraps one word per line.
 */
const META_MAX_WIDTH = '42%'

export interface SectionPDFProps {
  section: ResumeSection
  ctx: TemplateCtx
  renderHeading: HeadingFn
  isSidebar?: boolean
  /** Last section in its column — its last entry drops its trailing margin. */
  isLastInColumn?: boolean
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
        <View key={i} wrap={false} style={{
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
  title, subtitle, location, date, description, ctx, extraLine, isSidebar = false, heading, isLast = false,
}: {
  /**
   * Last entry in its column. Its bottom margin would sit below all content, and
   * when that lands past the page's bottom edge the whole two-column body breaks
   * onto an otherwise empty page.
   */
  isLast?: boolean
  /**
   * Section heading, passed to a section's first entry so the two share one
   * unbreakable block. minPresenceAhead has no effect in @react-pdf 4, so this
   * is the only way to stop a heading being stranded at the foot of a page.
   */
  heading?: React.ReactNode
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
    <View style={{ opacity: 0.8 }}>
      <Text style={{ fontSize: pt(base * 0.85), color: s.applyAccentDates ? colors.accent : colors.date, fontWeight: 500 }}>
        {date}
      </Text>
    </View>
  ) : null;

  const LocationElement = location ? (
    <View style={{ opacity: 0.8 }}>
      <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, fontWeight: 500 }}>
        {location}
      </Text>
    </View>
  ) : null;

  const isSameLine = s.subtitlePlacement === "same-line";

  // A <Text> nested inside another <Text> shares one text run, and @react-pdf
  // renders a hyphen when a line breaks at that boundary — "Computational
  // Mathematics-" / "University of Waterloo". Registering a no-op hyphenation
  // callback (see ./fonts) suppresses word hyphenation but not this one. Laying
  // the two out as siblings in a wrapping row removes the shared run entirely.
  const TitleLine = ({ align = 'flex-start' }: { align?: 'flex-start' | 'flex-end' }) => {
    const titleStyle = {
      fontWeight: titleWeight as 'bold' | 'normal',
      fontSize: pt(titleFontSize),
      lineHeight: lh,
      color: colors.text,
    };
    if (!subtitle || !isSameLine) {
      return <Text style={titleStyle}>{title}</Text>;
    }
    return (
      // columnGap, not marginLeft: a margin travels with the subtitle and indents
      // it when the row wraps.
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: align, columnGap: 5 }}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={subStyle}>{subtitle}</Text>
      </View>
    );
  };

  // Only the head of an entry (title, meta and its first line) is kept together.
  // Holding the whole entry together pushed any long job onto the next page and
  // left a large blank gap behind it.
  const descLines = description ? renderMd(description, ctx) : []

  return (
    // With nothing after the head, the entry itself must be the unbreakable
    // node: an unbreakable only child inside a breakable View is squeezed into
    // the page's bottom margin instead of moving to the next page.
    <View style={{ marginBottom: isLast ? 0 : Number(ctx.gap.replace('pt', '')) }} wrap={descLines.length > 1 ? undefined : false}>
      <View wrap={false}>
      {heading}
      {layout === "date-location-right" ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TitleLine />
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', marginTop: 2, maxWidth: META_MAX_WIDTH, flexShrink: 1 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-location-left" ? (
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginLeft: 8, alignItems: 'flex-end' }}>
            <TitleLine align="flex-end" />
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh, textAlign: 'right' }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-start', marginTop: 2, maxWidth: META_MAX_WIDTH, flexShrink: 1 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-content-location" ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ marginRight: 12 }}><TitleLine /></View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {DateElement}
              {date && location && <Text style={{ fontSize: pt(base * 0.8), opacity: 0.2, marginHorizontal: 6 }}>{"•"}</Text>}
              {LocationElement}
            </View>
          </View>
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
        </View>
      ) : (
        <View>
          <TitleLine />
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
          {!isSidebar && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              {DateElement}
              {date && location && <Text style={{ fontSize: pt(base * 0.8), opacity: 0.2, marginHorizontal: 6 }}>{"•"}</Text>}
              {LocationElement}
            </View>
          )}
        </View>
      )}

      {extraLine}

      {descLines.length > 0 && <View style={{ marginTop: 3 }}>{descLines[0]}</View>}
      </View>

      {descLines.slice(1)}

      {isSidebar && (
        <View style={{ marginTop: 2 }}>
          {DateElement}
          <View style={{ marginTop: 1 }}>
            {LocationElement}
          </View>
        </View>
      )}
    </View>
  )
}
