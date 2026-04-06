import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

export function ClassicTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  const bodySections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  const page: React.CSSProperties = {
    width:           s.paperSize === 'a4' ? '210mm' : '216mm',
    minHeight:       s.paperSize === 'a4' ? '297mm' : '279mm',
    backgroundColor: colors.background,
    color:           colors.text,
    fontFamily:      font,
    fontSize:        pt(base),
    lineHeight:      lh,
    paddingLeft:     `${s.marginHorizontal}mm`,
    paddingRight:    `${s.marginHorizontal}mm`,
    paddingTop:      `${s.marginVertical}mm`,
    paddingBottom:   `${s.marginVertical}mm`,
    boxSizing:       'border-box',
  }

  function ClassicHeading({ title }: { title: string }) {
    return s.showSectionLabels ? (
      <div style={{
        backgroundColor: colors.accent + '18',
        padding:    '3pt 6pt',
        marginTop:  gap,
        marginBottom: '5pt',
      }}>
        <span style={{
          fontSize:      pt(hSize),
          fontWeight:    'bold',
          color:         colors.heading,
          letterSpacing: '0.06em',
          textTransform: hCap ?? 'uppercase',
        }}>
          {title}
        </span>
      </div>
    ) : <div style={{ marginTop: gap }} />
  }

  function Footer() {
    if (!s.footerPageNumbers && !s.footerEmail && !s.footerName) return null
    return (
      <div data-footer-fixed style={{
        marginTop: 'auto',
        paddingTop: '10pt',
        borderTop: `0.5pt solid ${colors.accent}20`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: pt(base * 0.75),
        color: colors.subtitle,
        backgroundColor: colors.background,
      }}>
        <div>
          {s.footerName && <span style={{ marginRight: '12pt' }}>{h?.fullName}</span>}
          {s.footerEmail && <span>{h?.email}</span>}
        </div>
        {s.footerPageNumbers && <div data-page-number></div>}
      </div>
    )
  }

  return (
    <div style={page}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: s.headerAlignment as 'left' | 'center' | 'right', marginBottom: '14pt' }}>
          <div style={{ fontSize: pt(nameSize), fontWeight: s.nameBold ? 'bold' : 'normal', lineHeight: 1.15, marginBottom: '2pt' }}>
            {h?.fullName || 'Your Name'}
          </div>
          {h?.jobTitle && (
            <div style={{ fontSize: pt(base * 1.1), color: colors.subtitle, marginBottom: '4pt' }}>{h.jobTitle}</div>
          )}
          {h && <ContactLine h={h} ctx={ctx} display="inline" />}
        </div>

        {/* All sections in user-defined order */}
        {bodySections.map((section, i) => (
          <React.Fragment key={section.id}>
            {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
            <div data-section>
              <SectionRenderer section={section} ctx={ctx}
                renderHeading={(title) => <ClassicHeading title={title} />} />
            </div>
          </React.Fragment>
        ))}

        <Footer />
      </div>
    </div>
  )
}
