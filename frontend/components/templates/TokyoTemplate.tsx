import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

function TokyoHeading({ title, ctx }: { title: string; ctx: ReturnType<typeof buildCtx> }) {
  const { colors, hSize, hCap, gap, pt, s } = ctx
  return s.showSectionLabels ? (
    <div style={{
      fontSize:      pt(hSize),
      fontWeight:    'bold',
      color:         colors.heading,
      letterSpacing: '0.05em',
      textTransform: hCap ?? 'uppercase',
      borderLeft:    `4pt solid ${colors.accent}`,
      paddingLeft:   '8pt',
      marginBottom:  '10pt',
      marginTop:     gap,
    }}>
      {title}
    </div>
  ) : <div style={{ marginTop: gap }} />
}

function Footer({ ctx, h }: { ctx: ReturnType<typeof buildCtx>; h?: HeaderData }) {
  const { colors, base, pt, s } = ctx
  const padH = `${s.marginHorizontal}mm`
  if (!s.footerPageNumbers && !s.footerEmail && !s.footerName) return null
  return (
    <div data-footer-fixed style={{
      marginTop: 'auto',
      paddingTop: '10pt',
      paddingLeft: padH,
      paddingRight: padH,
      paddingBottom: '4pt',
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

export function TokyoTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  const bodySections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  const padH = `${s.marginHorizontal}mm`
  const padV = `${s.marginVertical}mm`

  return (
    <div style={{
      width:           s.paperSize === 'a4' ? '210mm' : '216mm',
      minHeight:       s.paperSize === 'a4' ? '297mm' : '279mm',
      backgroundColor: colors.background,
      color:           colors.text,
      fontFamily:      font,
      fontSize:        pt(base),
      lineHeight:      lh,
      boxSizing:       'border-box',
      display:         'flex',
      flexDirection:   'column',
    }}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ flex: 1 }}>
        {/* Full-width colored header banner */}
        <div style={{
          backgroundColor: colors.accent,
          color:           '#fff',
          paddingLeft:     padH,
          paddingRight:    padH,
          paddingTop:      `calc(${padV} * 1.2)`,
          paddingBottom:   `calc(${padV} * 0.8)`,
          marginBottom:    '20pt',
        }}>
          <div style={{ fontSize: pt(nameSize), fontWeight: s.nameBold ? 'bold' : 'normal', marginBottom: '4pt', lineHeight: 1.1 }}>
            {h?.fullName || 'Your Name'}
          </div>
          {h?.jobTitle && (
            <div style={{ fontSize: pt(base * 1.2), color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {h.jobTitle}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', paddingLeft: padH, paddingRight: padH, paddingBottom: padV }}>
          {/* Sidebar: contact info */}
          <div style={{ width: '30%', paddingRight: '20pt', boxSizing: 'border-box' }}>
            {h && <ContactLine h={h} ctx={ctx} display="block" />}
          </div>

          {/* Main: all sections in order */}
          <div style={{ flex: 1 }}>
            {bodySections.map((section, i) => (
              <React.Fragment key={section.id}>
                {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
                <div data-section>
                  <SectionRenderer section={section} ctx={ctx}
                    renderHeading={(title) => <TokyoHeading title={title} ctx={ctx} />} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <Footer ctx={ctx} h={h} />
    </div>
  )
}
