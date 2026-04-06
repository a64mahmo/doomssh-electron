import React from 'react'
import type { Resume } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { resume: Resume; pads?: number[] }

export function ModernTemplate({ resume, pads }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  // Split sections into Main (Experience, Projects, etc.) and Sidebar (Skills, Education, etc.)
  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const sidebarSections = resume.sections.filter(sec => sec.visible !== false && sidebarTypes.includes(sec.type))
  const mainSections = resume.sections.filter(sec => sec.visible !== false && !sidebarTypes.includes(sec.type) && sec.type !== 'header')

  const padH = `${s.marginHorizontal}mm`
  const padV = `${s.marginVertical}mm`

  function SectionHeading({ title, isSidebar = false }: { title: string; isSidebar?: boolean }) {
    if (!s.showSectionLabels) return <div style={{ marginTop: gap }} />
    
    return (
      <div style={{
        fontSize:      pt(isSidebar ? hSize * 0.85 : hSize),
        fontWeight:    'bold',
        color:         isSidebar ? colors.accent : colors.accent,
        textTransform: hCap ?? 'uppercase',
        letterSpacing: '0.06em',
        borderBottom:  `1.5pt solid ${colors.accent}${isSidebar ? '40' : ''}`,
        paddingBottom: '2pt',
        marginBottom:  '10pt',
        marginTop:     isSidebar ? '16pt' : gap,
        display:       'flex',
        alignItems:    'center',
        gap:           '6pt'
      }}>
        {title}
      </div>
    )
  }

  function Footer() {
    if (!s.footerPageNumbers && !s.footerEmail && !s.footerName) return null
    return (
      <div data-footer-fixed style={{
        marginTop: 'auto',
        paddingTop: '10pt',
        paddingLeft: padH,
        paddingRight: padH,
        paddingBottom: '4pt',
        borderTop: `0.5pt solid ${colors.accent}15`,
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
      fontFamily:      font,
      fontSize:        pt(base),
      lineHeight:      lh,
      boxSizing:       'border-box',
      backgroundColor: colors.background,
      color:           colors.text,
      display:         'flex',
      flexDirection:   'column',
    }}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      {/* Header — Full Width, Modern Impact */}
      <div style={{
        paddingLeft:   padH,
        paddingRight:  padH,
        paddingTop:    `calc(${padV} * 1.2)`,
        paddingBottom: '20pt',
        backgroundColor: colors.accent + '05', // Very subtle tint
        borderBottom: `1pt solid ${colors.accent}15`,
        textAlign: s.headerAlignment as 'left' | 'center' | 'right',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: s.headerAlignment === 'center' ? 'column' : 'row',
          justifyContent: s.headerAlignment === 'right' ? 'flex-end' : s.headerAlignment === 'center' ? 'center' : 'space-between',
          alignItems: s.headerAlignment === 'center' ? 'center' : 'flex-end',
          flexWrap: 'wrap',
          gap: '12pt'
        }}>
          <div style={{ textAlign: s.headerAlignment as 'left' | 'center' | 'right' }}>
            <h1 style={{
              fontSize: pt(nameSize),
              fontWeight: s.nameBold ? 800 : 400,
              color: colors.accent,
              lineHeight: 1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {h?.fullName || 'Your Name'}
            </h1>
            {h?.jobTitle && (
              <div style={{
                fontSize: pt(base * 1.2),
                color: colors.subtitle,
                marginTop: '4pt',
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {h.jobTitle}
              </div>
            )}
          </div>
          
          <div style={{ 
            textAlign: s.headerAlignment as 'left' | 'center' | 'right',
            minWidth: s.headerAlignment === 'center' ? '100%' : '200pt' 
          }}>
            {h && <ContactLine h={h} ctx={ctx} display={s.headerAlignment === 'center' ? 'inline' : 'block'} />}
          </div>
        </div>
      </div>

      {/* Body — Two Column Layout
          The sidebar color is a gradient on the ROW, not on the sidebar div.
          This guarantees the tint fills 100% of the row height regardless of
          which column has more content — critical for multi-page rendering. */}
      <div style={{
        display: 'flex',
        flex: 1,
        background: `linear-gradient(to right, transparent 68%, ${colors.accent}08 68%)`,
      }}>

        {/* Main Column */}
        <div style={{
          flex: 1,
          paddingLeft: padH,
          paddingRight: '20pt',
          paddingTop: '15pt',
          paddingBottom: '15pt',
          borderRight: `0.5pt solid ${colors.accent}15`,
        }}>
          {mainSections.map((section, i) => (
            <React.Fragment key={section.id}>
              {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
              <div data-section>
                <SectionRenderer
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => <SectionHeading title={title} />}
                />
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Sidebar Column — no background here; it lives on the parent row */}
        <div style={{
          width: '32%',
          paddingLeft: '20pt',
          paddingRight: padH,
          paddingTop: '15pt',
          paddingBottom: '15pt',
        }}>
          {sidebarSections.map((section, i) => (
            <div key={section.id} data-section>
              <SectionRenderer
                section={section}
                ctx={ctx}
                renderHeading={(title) => <SectionHeading title={title} isSidebar={true} />}
              />
            </div>
          ))}
        </div>

      </div>
      
      <Footer />
    </div>
  )
}
