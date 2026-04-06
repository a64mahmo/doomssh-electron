import React from 'react'
import type { Resume, ResumeSection } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'

interface Props { 
  resume: Resume; 
  pads?: number[]; 
  hideFooter?: boolean;
  isMeasurement?: boolean;
}

export function MasterTemplate({ resume, pads, hideFooter, isMeasurement }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  // Filter visible sections excluding header
  const visibleSections = resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  // Column logic: if s.columnLayout is 'one', everything is in main.
  // Otherwise, use s.sectionColumns map or fallback to defaults.
  const sidebarTypes = ['skills', 'education', 'languages', 'certifications', 'awards', 'references']
  const mixMainTypes = ['summary', 'experience', 'projects', 'volunteering', 'publications', 'custom']

  let mainSections: ResumeSection[] = []
  let sidebarSections: ResumeSection[] = []

  if (s.columnLayout === 'one') {
    mainSections = visibleSections
  } else {
    visibleSections.forEach(sec => {
      const assigned = s.sectionColumns?.[sec.id]
      if (assigned === 'sidebar') {
        sidebarSections.push(sec)
      } else if (assigned === 'main') {
        mainSections.push(sec)
      } else {
        if (s.columnLayout === 'mix') {
          if (mixMainTypes.includes(sec.type)) mainSections.push(sec)
          else sidebarSections.push(sec)
        } else {
          if (sidebarTypes.includes(sec.type)) sidebarSections.push(sec)
          else mainSections.push(sec)
        }
      }
    })
  }

  const padH = `${s.marginHorizontal}mm`
  const padV = `${s.marginVertical}mm`

  function SectionHeading({ title, isSidebar = false }: { title: string; isSidebar?: boolean }) {
    if (!s.showSectionLabels) return <div style={{ marginTop: gap }} />
    
    return (
      <div style={{
        fontSize:      pt(isSidebar ? hSize * 0.9 : hSize),
        fontWeight:    'bold',
        color:         colors.heading,
        textTransform: hCap ?? 'uppercase',
        letterSpacing: '0.06em',
        borderBottom:  `1.5pt solid ${colors.accent}${isSidebar ? '30' : '60'}`,
        paddingBottom: '3pt',
        marginBottom:  '10pt',
        marginTop:     isSidebar ? '14pt' : gap,
        display:       'flex',
        alignItems:    'center',
        gap:           '6pt'
      }}>
        {title}
      </div>
    )
  }

  return (
    <div style={{
      width:           s.paperSize === 'a4' ? '210mm' : '216mm',
      minHeight:       isMeasurement ? 'auto' : (s.paperSize === 'a4' ? '297mm' : '279mm'),
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

      {/* Header */}
      <div style={{
        paddingLeft:   padH,
        paddingRight:  padH,
        paddingTop:    `calc(${padV} * 1.2)`,
        paddingBottom: '20pt',
        textAlign: s.headerAlignment as 'left' | 'center' | 'right',
        backgroundColor: s.columnLayout === 'one' ? colors.accent + '05' : 'transparent',
        borderBottom: s.columnLayout === 'one' ? `1pt solid ${colors.accent}15` : 'none',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: s.headerAlignment === 'center' ? 'column' : 'row',
          justifyContent: s.headerAlignment === 'right' ? 'flex-end' : s.headerAlignment === 'center' ? 'center' : 'space-between',
          alignItems: s.headerAlignment === 'center' ? 'center' : 'flex-end',
          flexWrap: 'wrap',
          gap: '10pt'
        }}>
          <div>
            <h1 style={{
              fontSize: pt(nameSize),
              fontWeight: s.nameBold ? 800 : 400,
              color: colors.accent,
              lineHeight: 1.1,
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
              }}>
                {h.jobTitle}
              </div>
            )}
          </div>
          
          <div style={{ 
            textAlign: s.headerAlignment as 'left' | 'center' | 'right',
            minWidth: s.headerAlignment === 'center' ? '100%' : 'auto' 
          }}>
            {h && <ContactLine h={h} ctx={ctx} display={s.headerAlignment === 'center' ? 'inline' : 'block'} />}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        background: s.columnLayout !== 'one' 
          ? `linear-gradient(to right, transparent 68%, ${colors.accent}05 68%)`
          : 'transparent',
      }}>

        {/* Main Column */}
        <div style={{
          flex: 1,
          paddingLeft: padH,
          paddingRight: s.columnLayout !== 'one' ? '20pt' : padH,
          paddingTop: '10pt',
          paddingBottom: isMeasurement ? '0' : '20pt',
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

        {/* Sidebar Column */}
        {s.columnLayout !== 'one' && sidebarSections.length > 0 && (
          <div style={{
            width: '32%',
            paddingLeft: '20pt',
            paddingRight: padH,
            paddingTop: '10pt',
            paddingBottom: isMeasurement ? '0' : '20pt',
            borderLeft: `0.5pt solid ${colors.accent}10`,
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
        )}

      </div>
      
      {!hideFooter && <TemplateFooter resume={resume} />}
    </div>
  )
}

export function TemplateFooter({ resume, pageNumber }: { resume: Resume; pageNumber?: number }) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, pt, s } = ctx
  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined
  const padH = `${s.marginHorizontal}mm`

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
      {s.footerPageNumbers && (
        <div style={{ fontVariantNumeric: 'tabular-nums' }}>
          {pageNumber !== undefined ? pageNumber : ''}
        </div>
      )}
    </div>
  )
}
