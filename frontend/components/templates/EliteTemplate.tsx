import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

function EliteHeading({ title, isSidebar, ctx }: { title: string; isSidebar?: boolean; ctx: ReturnType<typeof buildCtx> }) {
  const { colors, hSize, hCap, gap, pt, s } = ctx
  if (!s.showSectionLabels) return <div style={{ marginTop: gap }} />
  return (
    <div style={{
      fontSize: pt(isSidebar ? hSize * 0.8 : hSize),
      fontWeight: 'bold',
      color: isSidebar ? '#fff' : colors.accent,
      textTransform: hCap ?? 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '8pt',
      marginTop: isSidebar ? '14pt' : gap,
      borderBottom: isSidebar ? '1pt solid rgba(255,255,255,0.2)' : `1.5pt solid ${colors.accent}`,
      paddingBottom: '2pt',
    }}>
      {title}
    </div>
  )
}

function Footer({ ctx, h }: { ctx: ReturnType<typeof buildCtx>; h?: HeaderData }) {
  const { colors, base, pt, s } = ctx
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

export function EliteTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  const sidebarTypes = ['skills', 'languages', 'certifications', 'awards']
  const sidebarSections = resume.sections.filter(sec => sec.visible !== false && sidebarTypes.includes(sec.type))
  const mainSections = resume.sections.filter(sec => sec.visible !== false && !sidebarTypes.includes(sec.type) && sec.type !== 'header')

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
      display:         'flex',
      flexDirection:   'column',
      boxSizing:       'border-box',
      // Dynamic padding handles web preview; @page margin handles print.
      paddingLeft:     padH,
      paddingRight:    padH,
      paddingTop:      padV,
      paddingBottom:   padV,
    }}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar - Dark Professional */}
        <div style={{
          width: '30%',
          backgroundColor: colors.accent,
          color: '#fff',
          padding: '24pt 18pt',
          marginRight: '24pt',
          borderRadius: '4pt',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ marginBottom: '24pt' }}>
            <div style={{ fontSize: pt(nameSize * 0.7), fontWeight: 800, lineHeight: 1.1, marginBottom: '6pt' }}>
              {h?.fullName || 'Your Name'}
            </div>
            {h?.jobTitle && (
              <div style={{ fontSize: pt(base * 0.9), color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {h.jobTitle}
              </div>
            )}
          </div>

          {h && (
            <div style={{ marginBottom: '10pt' }}>
              <EliteHeading title="Contact" isSidebar ctx={ctx} />
              <ContactLine h={h} ctx={ctx} display="block" />
            </div>
          )}

          {sidebarSections.map(sec => (
            <SectionRenderer key={sec.id} section={sec} ctx={{ ...ctx, colors: { ...ctx.colors, text: '#fff', subtitle: 'rgba(255,255,255,0.7)' } }}
              renderHeading={(t) => <EliteHeading title={t} isSidebar ctx={ctx} />} />
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, paddingTop: '12pt' }}>
          {mainSections.map((section, i) => (
            <React.Fragment key={section.id}>
              {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
              <div data-section>
                <SectionRenderer section={section} ctx={ctx}
                  renderHeading={(title) => <EliteHeading title={title} ctx={ctx} />} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Footer ctx={ctx} h={h} />
    </div>
  )
}
