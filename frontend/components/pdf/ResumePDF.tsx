import React from 'react'
import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import type { Resume, SectionType } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { registerFont } from './fonts'
import { SectionRendererPDF, ContactLinePDF, hexA, type HeaderData } from './SectionsPDF'

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
  const fontSize = pt(isSidebar ? hSize * 0.9 : hSize)
  const baseGap = Number(gap.replace('pt', ''))
  const sectionGap = baseGap * (s.sectionSpacing ?? 1.0)
  const marginTop = isSidebar ? 14 : sectionGap
  const headingColor = colors.heading

  const showIcon = s.sectionHeadingIcon !== 'none'
  const iconSize = Number(pt(hSize * 1.1 * (s.sectionHeadingIconSize || 1.0)).replace('pt', ''))

  // Base container — always a full-width row, always left-justified
  const base: Record<string, any> = {
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
  const textStyle: Record<string, any> = {
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
      {showIcon && (
        <View style={{
          width: iconSize,
          height: iconSize,
          marginRight: 6,
          flexShrink: 0,
          borderRadius: s.sectionHeadingIcon === 'filled' ? 3 : 0,
          backgroundColor: s.sectionHeadingIcon === 'filled' ? headingColor : 'transparent',
          borderWidth: s.sectionHeadingIcon === 'filled' ? 0 : 1.5,
          borderColor: headingColor,
          borderStyle: 'solid',
        }} />
      )}
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

  const visibleSections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  // Column assignment — same logic as MasterTemplate
  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const mixMainTypes = ['summary', 'experience', 'projects', 'volunteering', 'publications', 'custom']

  let mainSections = visibleSections
  let sidebarSections: typeof visibleSections = []

  if (s.columnLayout !== 'one') {
    mainSections = []
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

  const pageStyle = {
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
        <View style={{
          marginBottom: 14,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.accent,
          borderBottomStyle: 'solid',
        }}>
          {s.headerAlignment === 'center' ? (
            // ── Center: everything stacked, text-aligned center ────
            <View style={{ alignItems: 'center' }}>
              {s.photoEnabled && h?.photo && (
                <Image src={h.photo} style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover', marginBottom: 6 }} />
              )}
              <Text style={{
                fontSize: pt(nameSize),
                fontWeight: s.nameBold ? 'bold' : 'normal',
                color: colors.accent,
                lineHeight: 1.1,
                letterSpacing: -0.02 * nameSize,
                textAlign: 'center',
              }}>
                {h?.fullName || 'Your Name'}
              </Text>
              {h?.jobTitle && (
                <Text style={{
                  fontSize: pt(base * 1.15),
                  color: colors.subtitle,
                  marginTop: 3,
                  textAlign: 'center',
                }}>
                  {h.jobTitle}
                </Text>
              )}
              {h && (
                <View style={{ marginTop: 6 }}>
                  <ContactLinePDF h={h} ctx={ctx} display="inline" align="center" />
                </View>
              )}
            </View>
          ) : s.headerAlignment === 'right' ? (
            // ── Right: contacts on left, name+title on right ───────
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {h && (
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <ContactLinePDF h={h} ctx={ctx} display="block" align="left" />
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View>
                  <Text style={{
                  fontSize: pt(nameSize),
                  fontWeight: s.nameBold ? 'bold' : 'normal',
                  color: colors.accent,
                  lineHeight: 1.1,
                  letterSpacing: -0.02 * nameSize,
                  textAlign: 'right',
                }}>
                  {h?.fullName || 'Your Name'}
                </Text>
                {h?.jobTitle && (
                  <Text style={{
                    fontSize: pt(base * 1.15),
                    color: colors.subtitle,
                    marginTop: 3,
                    textAlign: 'right',
                  }}>
                    {h.jobTitle}
                  </Text>
                )}
                </View>
                {s.photoEnabled && h?.photo && (
                  <Image src={h.photo} style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover' }} />
                )}
              </View>
            </View>
          ) : (
            // ── Left: name+title on left, contacts block on right ──
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 16 }}>
                {s.photoEnabled && h?.photo && (
                  <Image src={h.photo} style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover' }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: pt(nameSize),
                    fontWeight: s.nameBold ? 'bold' : 'normal',
                    color: colors.accent,
                    lineHeight: 1.1,
                    letterSpacing: -0.02 * nameSize,
                    textAlign: 'left',
                  }}>
                    {h?.fullName || 'Your Name'}
                  </Text>
                  {h?.jobTitle && (
                    <Text style={{
                      fontSize: pt(base * 1.15),
                      color: colors.subtitle,
                      marginTop: 3,
                      textAlign: 'left',
                    }}>
                      {h.jobTitle}
                    </Text>
                  )}
                </View>
              </View>
              {h && (
                <View>
                  <ContactLinePDF h={h} ctx={ctx} display="block" align="right" />
                </View>
              )}
            </View>
          )}
        </View>

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
