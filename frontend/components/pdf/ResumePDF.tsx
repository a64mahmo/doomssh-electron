import React from 'react'
import { Document, Page, View, Text, Image, Svg, Path, Circle, Rect, Line, G } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { Resume, SectionType, ResumeSection, SectionHeadingIcon } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { registerFont } from './fonts'
import { SectionRendererPDF, ContactLinePDF, hexA, type HeaderData } from './SectionsPDF'

// ─── Lucide icon SVG data (matches UI editor icons) ─────────────────────────

type SvgElement = { tag: string; [key: string]: string }

const SECTION_ICON_DATA: Record<SectionType, SvgElement[]> = {
  header: [
    { tag: 'path', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
    { tag: 'circle', cx: '12', cy: '7', r: '4' },
  ],
  summary: [
    { tag: 'path', d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z' },
    { tag: 'path', d: 'M14 2v5a1 1 0 0 0 1 1h5' },
    { tag: 'path', d: 'M10 9H8' },
    { tag: 'path', d: 'M16 13H8' },
    { tag: 'path', d: 'M16 17H8' },
  ],
  experience: [
    { tag: 'path', d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
    { tag: 'rect', width: '20', height: '14', x: '2', y: '6', rx: '2' },
  ],
  education: [
    { tag: 'path', d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z' },
    { tag: 'path', d: 'M22 10v6' },
    { tag: 'path', d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' },
  ],
  skills: [
    { tag: 'path', d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z' },
  ],
  projects: [
    { tag: 'path', d: 'M10 10.5 8 13l2 2.5' },
    { tag: 'path', d: 'm14 10.5 2 2.5-2 2.5' },
    { tag: 'path', d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z' },
  ],
  certifications: [
    { tag: 'path', d: 'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526' },
    { tag: 'circle', cx: '12', cy: '8', r: '6' },
  ],
  languages: [
    { tag: 'path', d: 'm5 8 6 6' },
    { tag: 'path', d: 'm4 14 6-6 2-3' },
    { tag: 'path', d: 'M2 5h12' },
    { tag: 'path', d: 'M7 2h1' },
    { tag: 'path', d: 'm22 22-5-10-5 10' },
    { tag: 'path', d: 'M14 18h6' },
  ],
  awards: [
    { tag: 'path', d: 'M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978' },
    { tag: 'path', d: 'M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978' },
    { tag: 'path', d: 'M18 9h1.5a1 1 0 0 0 0-5H18' },
    { tag: 'path', d: 'M4 22h16' },
    { tag: 'path', d: 'M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z' },
    { tag: 'path', d: 'M6 9H4.5a1 1 0 0 1 0-5H6' },
  ],
  volunteering: [
    { tag: 'path', d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5' },
  ],
  publications: [
    { tag: 'path', d: 'M12 7v14' },
    { tag: 'path', d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z' },
  ],
  references: [
    { tag: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { tag: 'path', d: 'M16 3.128a4 4 0 0 1 0 7.744' },
    { tag: 'path', d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
    { tag: 'circle', cx: '9', cy: '7', r: '4' },
  ],
  custom: [
    { tag: 'path', d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915' },
    { tag: 'circle', cx: '12', cy: '12', r: '3' },
  ],
}

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
  const elements = SECTION_ICON_DATA[type] || []
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
        if (tag === 'path') return <Path key={i} {...common} d={attrs.d} />
        if (tag === 'circle') return <Circle key={i} {...common} cx={attrs.cx} cy={attrs.cy} r={attrs.r} />
        if (tag === 'rect') return <Rect key={i} {...common} x={attrs.x} y={attrs.y} width={attrs.width} height={attrs.height} rx={attrs.rx} />
        if (tag === 'line') return <Line key={i} {...common} x1={attrs.x1} y1={attrs.y1} x2={attrs.x2} y2={attrs.y2} />
        return null
      })}
    </Svg>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, type, ctx, isSidebar = false }: {
  title: string
  type: SectionType
  ctx: ReturnType<typeof buildCtx>
  isSidebar?: boolean
}) {
  const { colors, s, pt, hSize, hCap, gap } = ctx
  if (!s.showSectionLabels) return <View style={{ marginTop: Number(gap.replace('pt', '')) }} />

  const style = s.sectionHeadingStyle || 'underline'
  const thick = s.sectionHeadingLineThickness || 1.5
  const fontSize = pt(hSize)
  const baseGap = Number(gap.replace('pt', ''))
  const sectionGap = baseGap * (s.sectionSpacing ?? 1.0)
  const marginTop = sectionGap
  const headingColor = colors.heading

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
  const lineColor = headingColor
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
    base.backgroundColor = hexA(headingColor, 0.12)
    base.paddingTop = pad
    base.paddingBottom = pad
    base.paddingLeft = 8
    base.paddingRight = 8
    base.borderRadius = 2
  } else if (style === 'left-bar') {
    base.borderLeftWidth = 3
    base.borderLeftColor = headingColor
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
        return (
          <View style={{
            width: isKnockout ? iconSize * 1.4 : iconSize,
            height: isKnockout ? iconSize * 1.4 : iconSize,
            marginRight: 6,
            flexShrink: 0,
            borderRadius: isKnockout ? 3 : 0,
            backgroundColor: isKnockout ? headingColor : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SectionIcon
              type={type}
              size={isKnockout ? iconSize * 0.75 : iconSize}
              color={isKnockout ? colors.background : headingColor}
              mode={mode}
              background={isKnockout ? colors.heading : colors.background}
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
  const photoSizeMap = { S: 36, M: 48, L: 64, XL: 80 }
  const photoPx = photoSizeMap[s.photoSize] || 48
  const photoBorderRadius = s.photoShape === 'circle' ? photoPx / 2 : s.photoShape === 'rounded' ? 6 : 0
  const photoStyle: Style = { width: photoPx, height: photoPx, borderRadius: photoBorderRadius, objectFit: 'cover' as const }

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
    backgroundColor: colors.background,
    color: colors.text,
    paddingLeft: `${s.marginHorizontal}mm`,
    paddingRight: `${s.marginHorizontal}mm`,
    paddingTop: `${s.marginVertical}mm`,
    paddingBottom: `${s.marginVertical}mm`,
  }

  return (
    <Document>
      <Page size={s.paperSize === 'a4' ? 'A4' : 'LETTER'} style={pageStyle}>

        {/* ── Header ───────────────────────────────────────────────── */}
        {(() => {
          const photoPos = s.photoPosition || 'beside-name'
          const contactLay = s.contactLayout || 'inline'
          const showPhoto = s.photoEnabled && h?.photo
          const photoIsTop = photoPos === 'top-center' || photoPos === 'top-left' || photoPos === 'top-right'
          const align = s.headerAlignment
          const cols = contactLay === 'columns-2' ? 2 : contactLay === 'columns-3' ? 3 : undefined

          const nameText = (textAlign: 'left' | 'center' | 'right') => (
            <View>
              <Text style={{ fontSize: pt(nameSize), fontWeight: s.nameBold ? 'bold' : 'normal', color: colors.accent, lineHeight: 1.1, letterSpacing: -0.02 * nameSize, textAlign }}>
                {h?.fullName || 'Your Name'}
              </Text>
              {h?.jobTitle && (
                <Text style={{ fontSize: pt(base * 1.15), color: colors.subtitle, marginTop: 3, textAlign }}>
                  {h.jobTitle}
                </Text>
              )}
            </View>
          )

          return (
            <View style={{ marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.accent, borderBottomStyle: 'solid' }}>
              {/* Top-positioned photo */}
              {showPhoto && photoIsTop && (
                <View style={{
                  alignItems: photoPos === 'top-center' ? 'center' : photoPos === 'top-right' ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}>
                  <Image src={h.photo!} style={photoStyle} />
                </View>
              )}

              {align === 'center' ? (
                <View style={{ alignItems: 'center' }}>
                  {showPhoto && !photoIsTop && <Image src={h.photo!} style={{ ...photoStyle, marginBottom: 6 }} />}
                  {nameText('center')}
                  {h && (
                    <View style={{ marginTop: 6, width: '100%' }}>
                      <ContactLinePDF h={h} ctx={ctx} display={cols ? 'block' : 'inline'} align="center" columns={cols} />
                    </View>
                  )}
                </View>
              ) : align === 'right' ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {h && (
                    <View style={{ flex: 1, paddingRight: 16 }}>
                      <ContactLinePDF h={h} ctx={ctx} display={cols ? 'block' : 'block'} align="left" columns={cols} />
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {nameText('right')}
                    {showPhoto && !photoIsTop && <Image src={h.photo!} style={photoStyle} />}
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 16 }}>
                    {showPhoto && !photoIsTop && <Image src={h.photo!} style={photoStyle} />}
                    {nameText('left')}
                  </View>
                  {h && (
                    <View>
                      <ContactLinePDF h={h} ctx={ctx} display={cols ? 'block' : 'block'} align="right" columns={cols} />
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        })()}

        {/* ── Body ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', flex: 1 }}>

          {/* Main column */}
          <View style={{
            width: hasSidebar ? '68%' : '100%',
            paddingRight: hasSidebar ? 20 : 0,
            borderRightWidth: hasSidebar ? 0.5 : 0,
            borderRightColor: colors.accent,
            borderRightStyle: 'solid',
          }}>
            {mainSections.map(section => (
              <SectionRendererPDF
                key={section.id}
                section={section}
                ctx={ctx}
                renderHeading={(title) => (
                  <SectionHeading title={title} type={section.type} ctx={ctx} />
                )}
              />
            ))}
          </View>

          {/* Sidebar column */}
          {hasSidebar && (
            <View style={{
              width: '32%',
              paddingLeft: 20,
            }}>
              {sidebarSections.map(section => (
                <SectionRendererPDF
                  key={section.id}
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => (
                    <SectionHeading title={title} type={section.type} ctx={ctx} isSidebar />
                  )}
                  isSidebar
                />
              ))}
            </View>
          )}
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
            borderTopColor: colors.accent,
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
