import React from 'react'
import { Document, Page, View, Text, Image, Svg, Path, Circle, Rect, Line, G, Polyline } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { Resume, SectionType, ResumeSection, SectionHeadingIcon, HeaderData } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { registerFont } from './fonts'
import { SectionRendererPDF, ContactLinePDF, hexA } from './sections'
import { SECTION_ICONS, type SvgElement } from "@/lib/icons/sectionIcons";
import { isLight } from '@/lib/pdf/styleUtils'

function SectionIcon({ 
  type, 
  size, 
  color, 
  mode, 
  background 
}: { 
  type: SectionType; 
  size: number; 
  color: string; 
  mode: SectionHeadingIcon; 
  background: string 
}) {
  const elements = SECTION_ICONS[type].pdf
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      {elements.map((el, i) => {
        const { tag, ...attrs } = el
        const isFilledMode = mode === 'filled'
        const common = {
          fill: isFilledMode ? color : 'none',
          stroke: isFilledMode ? background : color,
          strokeWidth: isFilledMode ? 1.2 : 1.5,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        }
        if (tag === 'path') return <Path key={i} {...common} d={attrs.d as string} />
        if (tag === 'circle') return <Circle key={i} {...common} cx={attrs.cx as number} cy={attrs.cy as number} r={attrs.r as number} />
        if (tag === 'rect') return <Rect key={i} {...common} x={attrs.x as number} y={attrs.y as number} width={attrs.width as number} height={attrs.height as number} rx={attrs.rx as number} />
        if (tag === 'line') return <Line key={i} {...common} x1={attrs.x1 as number} y1={attrs.y1 as number} x2={attrs.x2 as number} y2={attrs.y2 as number} />
        if (tag === 'polyline') return <Polyline key={i} {...common} points={attrs.points as string} />
        return null
      })}
    </Svg>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  type,
  ctx,
  isSidebar = false,
  isFirst = false,
}: {
  title: string;
  type: SectionType;
  ctx: ReturnType<typeof buildCtx>;
  isSidebar?: boolean;
  isFirst?: boolean;
}) {
  const { colors, s, pt, hSize, hCap, gap } = ctx;
  if (!s.showSectionLabels)
    return (
      <View
        style={{ marginTop: isFirst ? 0 : Number(gap.replace("pt", "")) }}
      />
    );

  const style = s.sectionHeadingStyle || "underline";
  const thick = s.sectionHeadingLineThickness || 1.5;
  const fontSize = pt(hSize);
  const baseGap = Number(gap.replace("pt", ""));
  const sectionGap = baseGap * (s.sectionSpacing ?? 1.0);
  const marginTop = isFirst ? 0 : sectionGap;
  const headingColor = s.applyAccentHeadings ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);
  const lineColor = s.applyAccentHeadingLine ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);

  const showIcon = s.sectionHeadingIcon !== 'none'
  const iconSize = Number(pt(hSize * 1.1 * (s.sectionHeadingIconSize || 1.0)).replace('pt', ''))

  // Base container — always a full-width row, always left-justified
  const base: Style = {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop,
    marginBottom: 8,
  }

  // Decoration overrides
  const pad = 4  // consistent vertical padding for all decorated styles

  if (style === 'underline') {
    base.borderBottomWidth = thick
    base.borderBottomColor = lineColor
    base.borderBottomStyle = 'solid'
    base.paddingBottom = pad
  } else if (style === 'overline') {
    base.borderTopWidth = thick
    base.borderTopColor = lineColor
    base.borderTopStyle = 'solid'
    base.paddingTop = pad
  } else if (style === 'top-bottom') {
    base.borderTopWidth = thick
    base.borderTopColor = lineColor
    base.borderTopStyle = 'solid'
    base.borderBottomWidth = thick
    base.borderBottomColor = lineColor
    base.borderBottomStyle = 'solid'
    base.paddingTop = pad
    base.paddingBottom = pad
  } else if (style === 'box') {
    base.borderWidth = thick
    base.borderColor = lineColor
    base.borderStyle = 'solid'
    base.paddingTop = pad
    base.paddingBottom = pad
    base.paddingLeft = 8
    base.paddingRight = 8
    base.borderRadius = 2
  } else if (style === 'background') {
    base.backgroundColor = hexA(lineColor, 0.12)
    base.paddingTop = pad
    base.paddingBottom = pad
    base.paddingLeft = 8
    base.paddingRight = 8
    base.borderRadius = 2
  } else if (style === 'left-bar') {
    base.borderLeftWidth = 3
    base.borderLeftColor = lineColor
    base.borderLeftStyle = 'solid'
    base.paddingLeft = 8
    base.paddingTop = 1
    base.paddingBottom = 1
  }

  // Text style — placed on the Text node itself so it's never inherited/overridden.
  // lineHeight: 1 is critical: removes inherited line-height so the padding on the
  // container is the only vertical spacing, keeping text visually centered in
  // top-bottom / box / background decorations.
  const textStyle: Style = {
    fontSize,
    fontWeight: 'bold',
    color: headingColor,
    textTransform: hCap ?? 'none',
    letterSpacing: 0.06 * (isSidebar ? hSize * 0.9 : hSize),
    textAlign: 'left',
    lineHeight: 1.1,
    flex: 1,
  }

  return (
    <View style={base}>
      {showIcon && (() => {
        const mode = s.sectionHeadingIcon
        const isKnockout = mode === 'knockout'
        const knockoutText = isLight(headingColor) ? '#1a1a1a' : colors.background;
        return (
          <View style={{
            width: isKnockout ? iconSize * 1.4 : iconSize,
            height: isKnockout ? iconSize * 1.4 : iconSize,
            marginRight: 6,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isKnockout ? 4 : 0,
            backgroundColor: isKnockout ? headingColor : 'transparent',
            color: isKnockout ? knockoutText : headingColor,
            border: 'none',
          }}>
            <SectionIcon
              type={type}
              size={isKnockout ? iconSize * 0.75 : iconSize}
              color={isKnockout ? knockoutText : headingColor}
              mode={mode}
              background={isKnockout ? headingColor : colors.background}
            />
          </View>
        )
      })()}
      <Text style={textStyle}>{title}</Text>
    </View>
  )
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function ResumePDF({ resume }: { resume: Resume }) {
  // Register the font family being used before rendering
  registerFont(resume.settings.fontFamily)

  const ctx = buildCtx(resume.settings)
  const { colors, s, pt, base, lh, nameSize } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  // Photo dimensions & shape
  const photoSizeMap = { XS: 28, S: 36, M: 48, L: 64, XL: 80 }
  const photoPx = photoSizeMap[s.photoSize] || 48
  const photoBorderRadius = s.photoShape === 'circle' ? photoPx / 2 : s.photoShape === 'rounded' ? 6 : 0
  const photoGap = s.photoGap || 12
  const photoBorderWidth = s.photoBorderStyle === 'none' ? 0 
    : s.photoBorderStyle === 'thin' ? 0.5 
    : s.photoBorderStyle === 'medium' ? 1 
    : 1.5
  const photoStyle: Style = { 
    width: photoPx, 
    height: photoPx, 
    borderRadius: photoBorderRadius, 
    objectFit: 'cover' as const,
    borderWidth: photoBorderWidth,
    borderColor: s.photoBorderColor || '#e5e7eb',
  }

  const visibleSections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  // Column assignment — same logic as MasterTemplate
  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const mixMainTypes = ['summary', 'experience', 'projects', 'volunteering', 'publications', 'custom']

  const mainSections: ResumeSection[] = []
  const sidebarSections: ResumeSection[] = []

  if (s.columnLayout === 'one') {
    mainSections.push(...visibleSections)
  } else {
    visibleSections.forEach(sec => {
      const assigned = s.sectionColumns?.[sec.id]
      if (assigned === 'sidebar') {
        sidebarSections.push(sec)
      } else if (assigned === 'main') {
        mainSections.push(sec)
      } else if (s.columnLayout === 'mix') {
        if (mixMainTypes.includes(sec.type)) mainSections.push(sec)
        else sidebarSections.push(sec)
      } else {
        if (sidebarTypes.includes(sec.type)) sidebarSections.push(sec)
        else mainSections.push(sec)
      }
    })
  }

  const hasFooter = s.footerPageNumbers || s.footerEmail || s.footerName
  const hasSidebar = s.columnLayout !== 'one' && sidebarSections.length > 0

  const pageStyle: Style = {
    fontFamily: s.fontFamily,
    fontSize: pt(base),
    lineHeight: lh,
    backgroundColor: (s.themeColorStyle === 'advanced' && s.backgroundColor === '#ffffff') ? hexA(colors.accent, 0.02) : colors.background,
    color: colors.text,
    paddingLeft: `${s.marginHorizontal}mm`,
    paddingRight: `${s.marginHorizontal}mm`,
    paddingTop: `${s.marginVertical}mm`,
    paddingBottom: `${s.marginVertical}mm`,
    borderWidth: s.themeColorStyle === 'border' ? 12 : 0,
    borderColor: colors.accent,
    borderStyle: 'solid',
  }

  return (
    <Document>
      <Page size={s.paperSize === 'a4' ? 'A4' : 'LETTER'} style={pageStyle}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={{
          backgroundColor: s.themeColorStyle === 'advanced' ? colors.accent : 'transparent',
          color: s.themeColorStyle === 'advanced' ? (isLight(colors.accent) ? '#1a1a1a' : '#ffffff') : colors.text,
          marginLeft: s.themeColorStyle === 'advanced' ? `-${s.marginHorizontal}mm` : 0,
          marginRight: s.themeColorStyle === 'advanced' ? `-${s.marginHorizontal}mm` : 0,
          marginTop: s.themeColorStyle === 'advanced' ? `-${s.marginVertical}mm` : 0,
          paddingLeft: s.themeColorStyle === 'advanced' ? `${s.marginHorizontal}mm` : 0,
          paddingRight: s.themeColorStyle === 'advanced' ? `${s.marginHorizontal}mm` : 0,
          paddingTop: s.themeColorStyle === 'advanced' ? `${s.marginVertical}mm` : 0,
          paddingBottom: s.themeColorStyle === 'advanced' ? 15 : 0,
          marginBottom: s.themeColorStyle === 'advanced' ? 15 : 0,
        }}>
          {(() => {
            const showPhoto = s.photoEnabled && h?.photo
            const align = s.headerAlignment
            const photoPos = s.photoPosition
            const isLightBg = s.themeColorStyle === 'advanced' && isLight(colors.accent);
            const headerTextColor = s.themeColorStyle === 'advanced' ? (isLightBg ? '#1a1a1a' : '#ffffff') : (s.applyAccentName ? colors.accent : colors.text);

            const nameText = (textAlign: 'left' | 'center' | 'right') => (
              <View style={{ alignItems: textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start') }}>
                <Text style={{ 
                  fontSize: pt(nameSize), 
                  fontWeight: 'bold', 
                  color: s.themeColorStyle === 'advanced' ? (isLightBg ? '#1a1a1a' : '#ffffff') : (s.applyAccentName ? colors.accent : colors.text), 
                  lineHeight: 1.1, 
                  letterSpacing: -0.5, 
                  textAlign 
                }}>
                  {h?.fullName || 'Your Name'}
                </Text>
                {h?.jobTitle && (
                  <Text style={{ 
                    fontSize: pt(base * 1.1), 
                    color: s.themeColorStyle === 'advanced' ? (isLightBg ? '#1a1a1a' : '#ffffff') : (s.applyAccentJobTitle ? hexA(colors.accent, 0.7) : hexA(colors.text, 0.7)), 
                    marginTop: 4, 
                    textAlign,
                    textTransform: 'uppercase',
                    letterSpacing: 2.5,
                  }}>
                    {h.jobTitle}
                  </Text>
                )}
              </View>
            )

            const photoEl = showPhoto ? <Image src={h.photo!} style={photoStyle} /> : null

            // Center Alignment
            if (align === "center") {
              const sizeMap = { XS: 28, S: 36, M: 48, L: 64, XL: 80 };
              const photoPx = sizeMap[s.photoSize as keyof typeof sizeMap] || 48;

              return (
                <View
                  style={{
                    width: "100%",
                    marginBottom: 4,
                    paddingBottom: 4,
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* Photo on the side - absolutely positioned so it doesn't push the center */}
                  {photoPos === "beside" && photoEl && (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        marginTop: -(photoPx / 2),
                      }}
                    >
                      {photoEl}
                    </View>
                  )}

                  <View style={{ alignItems: "center" }}>
                    {photoPos === "top" && photoEl && (
                      <View style={{ marginBottom: photoGap / 2 }}>{photoEl}</View>
                    )}
                    {nameText("center")}
                    {photoPos === "bottom" && photoEl && (
                      <View style={{ marginTop: photoGap / 2 }}>{photoEl}</View>
                    )}
                  </View>

                  <View style={{ marginTop: 8, width: "100%" }}>
                    <ContactLinePDF h={h!} ctx={ctx} textColorOverride={headerTextColor} />
                  </View>
                </View>
              );
            }

            // Left / Right Alignment
            const isRight = align === "right";
            const isBeside = s.detailsPosition === "beside";
            const photoAlignment = s.photoAlignment || 'left';
            const photoVAlign = s.photoVerticalAlign || 'center';

            if (isBeside) {
              const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
              return (
                <View
                  style={{
                    marginBottom: 4,
                    paddingBottom: 4,
                    flexDirection: "row",
                    alignItems: photoVAlign === 'top' ? 'flex-start' : photoVAlign === 'bottom' ? 'flex-end' : 'center',
                    width: "100%",
                  }}
                >
                  {/* Side A: Identity */}
                  <View
                    style={{
                      flexDirection: photoOnRight ? "row-reverse" : "row",
                      alignItems: photoVAlign === 'top' ? 'flex-start' : photoVAlign === 'bottom' ? 'flex-end' : 'center',
                      flex: 1,
                    }}
                  >
                    {!photoOnRight && photoEl && (
                      <View style={{ [isRight ? "marginLeft" : "marginRight"]: photoGap }}>
                        {photoEl}
                      </View>
                    )}
                    {nameText(isRight ? "right" : "left")}
                    {photoOnRight && photoEl && (
                      <View style={{ [isRight ? "marginLeft" : "marginRight"]: photoGap }}>
                        {photoEl}
                      </View>
                    )}
                  </View>

                  {/* Side B: Contacts */}
                  <View
                    style={{
                      flex: 1,
                      alignItems:
                        s.detailsTextAlignment === "left"
                          ? "flex-start"
                          : s.detailsTextAlignment === "right"
                            ? "flex-end"
                            : "center",
                    }}
                  >
                    {h && <ContactLinePDF h={h} ctx={ctx} textColorOverride={headerTextColor} />}
                  </View>
                </View>
              );
            }

            // Below arrangement
            const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
            return (
              <View
                style={{
                  width: "100%",
                  marginBottom: 4,
                  paddingBottom: 4,
                  flexDirection: photoOnRight ? "row-reverse" : "row",
                  alignItems: photoVAlign === 'top' ? 'flex-start' : photoVAlign === 'bottom' ? 'flex-end' : 'center',
                }}
              >
                {/* Photo Side */}
                {photoEl && (
                  <View style={{ [photoOnRight ? "marginLeft" : "marginRight"]: photoGap }}>
                    {photoEl}
                  </View>
                )}

                {/* Text Side (Identity + Contacts Stack) */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: isRight ? "flex-end" : "flex-start",
                  }}
                >
                  <View style={{ marginBottom: 8 }}>{nameText(align)}</View>
                  <View
                    style={{
                      width: "100%",
                      alignItems:
                        s.detailsTextAlignment === "left"
                          ? "flex-start"
                          : s.detailsTextAlignment === "right"
                            ? "flex-end"
                            : "center",
                    }}
                  >
                    {h && <ContactLinePDF h={h} ctx={ctx} textColorOverride={headerTextColor} />}
                  </View>
                </View>
              </View>
            );
          })()}
        </View>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: s.columnReverse ? 'row-reverse' : 'row', flex: 1 }}>
          {(() => {
            const sidebarWidth = s.columnWidthMode === "manual" ? s.columnWidth : 32;
            const mainWidth = 100 - sidebarWidth;
            
            const dividerColor = s.applyAccentDotsBarsBubbles ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);
            const sidebarTint = s.applyAccentDotsBarsBubbles ? colors.accent : "transparent";
            const sidebarBg = hexA(sidebarTint, 0.02); // very light tint

            return (
              <>
                {/* Main column */}
                <View style={{
                  width: hasSidebar ? `${mainWidth}%` : '100%',
                  paddingRight: !s.columnReverse && hasSidebar ? 20 : 0,
                  paddingLeft: s.columnReverse && hasSidebar ? 20 : 0,
                  paddingTop: 5,
                  paddingBottom: 20,
                  borderRightWidth: !s.columnReverse && hasSidebar ? 0.5 : 0,
                  borderRightColor: dividerColor,
                  borderRightStyle: 'solid',
                  borderLeftWidth: s.columnReverse && hasSidebar ? 0.5 : 0,
                  borderLeftColor: dividerColor,
                  borderLeftStyle: 'solid',
                }}>
                  {mainSections.map((section, i) => (
                    <SectionRendererPDF
                      key={section.id}
                      section={section}
                      ctx={ctx}
                      renderHeading={(title) => (
                        <SectionHeading title={title} type={section.type} ctx={ctx} isFirst={i === 0} />
                      )}
                    />
                  ))}
                </View>

                {/* Sidebar column */}
                {hasSidebar && (
                  <View style={{
                    width: `${sidebarWidth}%`,
                    paddingLeft: !s.columnReverse ? 20 : 0,
                    paddingRight: s.columnReverse ? 20 : 0,
                    paddingTop: 5,
                    paddingBottom: 20,
                    backgroundColor: sidebarBg,
                  }}>
                    {sidebarSections.map((section, i) => (
                      <SectionRendererPDF
                        key={section.id}
                        section={section}
                        ctx={ctx}
                        renderHeading={(title) => (
                          <SectionHeading title={title} type={section.type} ctx={ctx} isSidebar isFirst={i === 0} />
                        )}
                        isSidebar
                      />
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </View>

        {/* ── Footer (fixed on every page) ─────────────────────────── */}
        {hasFooter && (
          <View fixed style={{
            position: 'absolute',
            bottom: `${s.marginVertical}mm`,
            left: `${s.marginHorizontal}mm`,
            right: `${s.marginHorizontal}mm`,
            paddingTop: 10,
            borderTopWidth: 0.5,
            borderTopColor: s.applyAccentDotsBarsBubbles ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading),
            borderTopStyle: 'solid',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: pt(base * 0.75),
            color: colors.subtitle,
          }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {s.footerName  && <Text>{h?.fullName}</Text>}
              {s.footerEmail && <Text>{h?.email}</Text>}
            </View>
            {s.footerPageNumbers && (
              <Text render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              } />
            )}
          </View>
        )}

      </Page>
    </Document>
  )
}
