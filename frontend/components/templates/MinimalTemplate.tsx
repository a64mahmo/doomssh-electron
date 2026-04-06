import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

export function MinimalTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  const bodySections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  const labelStyle: React.CSSProperties = {
    width:         '72pt',
    flexShrink:    0,
    fontSize:      pt(base * 0.78),
    color:         colors.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight:    'bold',
    paddingTop:    '1pt',
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
    <div style={{
      width:           s.paperSize === 'a4' ? '210mm' : '216mm',
      minHeight:       s.paperSize === 'a4' ? '297mm' : '279mm',
      backgroundColor: colors.background,
      color:           colors.text,
      fontFamily:      font,
      fontSize:        pt(base),
      lineHeight:      lh,
      padding:         `${s.marginVertical}mm ${s.marginHorizontal}mm`,
      boxSizing:       'border-box',
      display:         'flex',
      flexDirection:   'column',
    }}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '20pt', textAlign: s.headerAlignment as 'left' | 'center' | 'right' }}>
          <div style={{ fontSize: pt(nameSize), fontWeight: s.nameBold ? 'bold' : 'normal', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '2pt' }}>
            {h?.fullName || 'Your Name'}
          </div>
          {h?.jobTitle && (
            <div style={{ fontSize: pt(base * 1.05), color: colors.subtitle, marginBottom: '4pt' }}>{h.jobTitle}</div>
          )}
          {h && <ContactLine h={h} ctx={ctx} display="inline" />}
        </div>

        {/* All sections: left label + right content */}
        {bodySections.map((section, i) => (
          <React.Fragment key={section.id}>
            {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
            <div data-section style={{ display: 'flex', gap: '14pt', marginBottom: '12pt' }}>
              {s.showSectionLabels && (
                <div style={labelStyle}>{section.title}</div>
              )}
              <div style={{ flex: 1 }}>
                <SectionRenderer section={section} ctx={ctx}
                  renderHeading={() => null} />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <Footer />
    </div>
  )
}
