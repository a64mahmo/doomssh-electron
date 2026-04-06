import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

export function CrispTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  const bodySections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  function CrispHeading({ title }: { title: string }) {
    return s.showSectionLabels ? (
      <div style={{
        fontSize:      pt(hSize),
        fontWeight:    'bold',
        color:         colors.accent,
        letterSpacing: '0.12em',
        textTransform: hCap ?? 'uppercase',
        borderBottom:  `0.5pt solid ${colors.accent}40`,
        paddingBottom: '2pt',
        marginBottom:  '10pt',
        marginTop:     gap,
      }}>
        {title}
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
    <div style={{
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
      display:         'flex',
      flexDirection:   'column',
    }}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30pt' }}>
        {/* Left column: identity + contact */}
        <div>
          <div style={{ marginBottom: '20pt' }}>
            <div style={{ fontSize: pt(nameSize * 0.8), fontWeight: s.nameBold ? 'bold' : 'normal', lineHeight: 1.1, marginBottom: '4pt', color: colors.text }}>
              {h?.fullName || 'Your Name'}
            </div>
            {h?.jobTitle && (
              <div style={{ fontSize: pt(base), color: colors.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h.jobTitle}
              </div>
            )}
          </div>
          {h && (
            <div style={{ marginBottom: '16pt' }}>
              <ContactLine h={h} ctx={ctx} display="block" />
            </div>
          )}
        </div>

        {/* Right column: all sections */}
        <div style={{ borderLeft: `0.5pt solid ${colors.accent}20`, paddingLeft: '30pt' }}>
          {bodySections.map((section, i) => (
            <React.Fragment key={section.id}>
              {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
              <div data-section>
                <SectionRenderer section={section} ctx={ctx}
                  renderHeading={(title) => <CrispHeading title={title} />} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
