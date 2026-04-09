import React from 'react'
import type { Resume, ResumeSection, SectionType } from '@/lib/store/types'
import { buildCtx } from '@/lib/pdf/templateCtx'
import { SectionRenderer, ContactLine, type HeaderData } from './SectionRenderers'
import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

// Section icons — must match the UI editor (SectionItem.tsx)
const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  header: LucideIcons.User,
  summary: LucideIcons.FileText,
  experience: LucideIcons.Briefcase,
  education: LucideIcons.GraduationCap,
  skills: LucideIcons.Wrench,
  projects: LucideIcons.FolderCode,
  certifications: LucideIcons.Award,
  languages: LucideIcons.Languages,
  awards: LucideIcons.Trophy,
  volunteering: LucideIcons.Heart,
  publications: LucideIcons.BookOpen,
  references: LucideIcons.Users,
  custom: LucideIcons.Settings,
}

// Abstract geometric symbols for a minimalist look
const ABSTRACT_ICONS: Record<SectionType, React.ReactNode> = {
  header: <div style={{ width: '60%', height: '60%', borderRadius: '50%', border: '1.5pt solid currentColor' }} />,
  summary: <div style={{ width: '50%', height: '2pt', backgroundColor: 'currentColor', boxShadow: '0 4pt 0 0 currentColor, 0 -4pt 0 0 currentColor' }} />,
  experience: <div style={{ width: '60%', height: '40%', border: '1.5pt solid currentColor', borderRadius: '1pt' }} />,
  education: <div style={{ width: '0', height: '0', borderLeft: '5pt solid transparent', borderRight: '5pt solid transparent', borderBottom: '8pt solid currentColor' }} />,
  skills: <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2pt' }}>{[...Array(4)].map((_,i)=><div key={i} style={{width:'3pt',height:'3pt',backgroundColor:'currentColor',borderRadius:'50%'}}/>)}</div>,
  projects: <div style={{ width: '50%', height: '50%', transform: 'rotate(45deg)', border: '1.5pt solid currentColor' }} />,
  certifications: <div style={{ width: '50%', height: '50%', borderRadius: '1pt', border: '1.5pt solid currentColor', position: 'relative' }}><div style={{ position:'absolute', top:'-2pt', right:'-2pt', width:'4pt', height:'4pt', backgroundColor:'currentColor', borderRadius:'50%' }}/></div>,
  languages: <div style={{ width: '60%', height: '60%', border: '1.5pt solid currentColor', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '100%', height: '1pt', backgroundColor: 'currentColor' }}/></div>,
  awards: <div style={{ width: '0', height: '0', borderLeft: '5pt solid transparent', borderRight: '5pt solid transparent', borderTop: '8pt solid currentColor', borderRadius: '1pt' }} />,
  volunteering: <div style={{ width: '50%', height: '50%', backgroundColor: 'currentColor', borderRadius: '1pt', transform: 'rotate(45deg)' }} />,
  publications: <div style={{ width: '60%', height: '60%', borderLeft: '2pt solid currentColor', borderBottom: '2pt solid currentColor' }} />,
  references: <div style={{ width: '40%', height: '40%', border: '2pt solid currentColor', borderRight: 'none', borderBottom: 'none', borderRadius: '1pt' }} />,
  custom: <div style={{ width: '50%', height: '5pt', border: '1.5pt solid currentColor', borderRadius: '1pt' }} />,
}

interface Props { 
  resume: Resume; 
  pads?: number[]; 
  hideFooter?: boolean;
  hideHeader?: boolean;
  isMeasurement?: boolean;
  sectionsOverride?: ResumeSection[];
}

function SectionHeading({ title, type, ctx, isSidebar = false }: { title: string; type: SectionType; ctx: ReturnType<typeof buildCtx>; isSidebar?: boolean }) {
  const { colors, hSize, hCap, gap, pt, s } = ctx
  if (!s.showSectionLabels) return <div style={{ marginTop: gap }} />
  
  const style = s.sectionHeadingStyle || 'underline'
  const thickness = `${s.sectionHeadingLineThickness || 1.5}pt`
  const sectionMarginTop = pt(Number(gap.replace('pt', '')) * (s.sectionSpacing ?? 1.0))
  
  const containerStyle: React.CSSProperties = {
    fontSize:      pt(hSize),
    fontWeight:    'bold',
    color:         colors.heading,
    textTransform: hCap ?? 'uppercase',
    letterSpacing: '0.06em',
    lineHeight:    1.1,
    marginTop:     sectionMarginTop,
    marginBottom:  '8pt',
    display:       'flex',
    alignItems:    'center',
    gap:           '8pt',
    position:      'relative',
  }

  if (style === 'underline') {
    containerStyle.borderBottom = `${thickness} solid ${colors.heading}`
    containerStyle.paddingBottom = '3pt'
  } else if (style === 'overline') {
    containerStyle.borderTop = `${thickness} solid ${colors.heading}`
    containerStyle.paddingTop = '3pt'
  } else if (style === 'top-bottom') {
    containerStyle.borderTop = `${thickness} solid ${colors.heading}`
    containerStyle.borderBottom = `${thickness} solid ${colors.heading}`
    containerStyle.paddingTop = '3pt'
    containerStyle.paddingBottom = '3pt'
  } else if (style === 'box') {
    containerStyle.border = `${thickness} solid ${colors.heading}`
    containerStyle.padding = '4pt 8pt'
    containerStyle.borderRadius = '2pt'
  } else if (style === 'background') {
    containerStyle.backgroundColor = colors.heading + '10'
    containerStyle.padding = '4pt 8pt'
    containerStyle.borderRadius = '2pt'
    containerStyle.color = colors.heading
  } else if (style === 'left-bar') {
    containerStyle.borderLeft = `3pt solid ${colors.heading}`
    containerStyle.paddingLeft = '8pt'
  }

  const showIcon = s.sectionHeadingIcon !== 'none'
  const iconStyle = s.sectionHeadingIconStyle || 'lucide'
  const iconSizeMultiplier = s.sectionHeadingIconSize || 1.0

  return (
    <div style={containerStyle}>
      {showIcon && (() => {
        const mode = s.sectionHeadingIcon
        const isKnockout = mode === 'knockout'
        const boxSize = hSize * 1.1 * iconSizeMultiplier
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: pt(isKnockout ? boxSize * 1.4 : boxSize),
            height: pt(isKnockout ? boxSize * 1.4 : boxSize),
            borderRadius: isKnockout ? '4pt' : 0,
            backgroundColor: isKnockout ? colors.heading : 'transparent',
            color: isKnockout ? colors.background : colors.heading,
            border: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {iconStyle === 'lucide' ? (
                React.createElement(SECTION_ICONS[type] || LucideIcons.Circle, {
                  size: pt(hSize * 0.75 * iconSizeMultiplier),
                  strokeWidth: mode === 'filled' ? 1.2 : 1.5,
                  fill: mode === 'filled' ? 'currentColor' : 'none',
                  stroke: mode === 'filled' ? colors.background : 'currentColor',
                })
              ) : (
                ABSTRACT_ICONS[type] || null
              )}
            </div>
          </div>
        )
      })()}
      <span>{title}</span>
    </div>
  )
}

export function MasterTemplate({ resume, pads, hideFooter, hideHeader, isMeasurement, sectionsOverride }: Props) {
  const ctx = buildCtx(resume.settings)
  const { colors, base, lh, gap, hSize, hCap, nameSize, font, fontHref, s, pt } = ctx

  const header = resume.sections.find(sec => sec.type === 'header')
  const h = header?.items as HeaderData | undefined

  // Filter visible sections excluding header, or use the override
  const visibleSections = sectionsOverride || resume.sections.filter(sec => sec.visible !== false && sec.type !== 'header')

  // Column logic: if s.columnLayout is 'one', everything is in main.
  // Otherwise, use s.sectionColumns map or fallback to defaults.
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
      {!hideHeader && (() => {
        const photoPos = s.photoPosition || 'beside-name'
        const contactLay = s.contactLayout || 'inline'
        const showPhoto = s.photoEnabled && h?.photo
        const sizeMap = { S: 36, M: 48, L: 64, XL: 80 }
        const photoPx = sizeMap[s.photoSize] || 48
        const photoBr = s.photoShape === 'circle' ? '50%' : s.photoShape === 'rounded' ? '6pt' : '0'
        const photoIsTop = photoPos === 'top-center' || photoPos === 'top-left' || photoPos === 'top-right'

        const photoEl = showPhoto ? (
          <img
            src={h.photo}
            alt={h?.fullName || 'Profile'}
            style={{ width: `${photoPx}pt`, height: `${photoPx}pt`, borderRadius: photoBr, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : null

        const nameEl = (
          <div>
            <h1 style={{ fontSize: pt(nameSize), fontWeight: s.nameBold ? 800 : 400, color: colors.accent, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
              {h?.fullName || 'Your Name'}
            </h1>
            {h?.jobTitle && (
              <div style={{ fontSize: pt(base * 1.2), color: colors.subtitle, marginTop: '4pt', fontWeight: 500 }}>
                {h.jobTitle}
              </div>
            )}
          </div>
        )

        const contactDisplay = contactLay === 'inline' ? (s.headerAlignment === 'center' ? 'inline' : 'block') : 'block'
        const contactEl = h ? <ContactLine h={h} ctx={ctx} display={contactDisplay} columns={contactLay === 'columns-2' ? 2 : contactLay === 'columns-3' ? 3 : undefined} /> : null

        return (
          <div data-header style={{
            paddingLeft: padH, paddingRight: padH,
            paddingTop: `calc(${padV} * 1.2)`, paddingBottom: '20pt',
            textAlign: s.headerAlignment as 'left' | 'center' | 'right',
            backgroundColor: s.columnLayout === 'one' ? colors.accent + '05' : 'transparent',
            borderBottom: s.columnLayout === 'one' ? `1pt solid ${colors.accent}` : 'none',
          }}>
            {/* Top-positioned photo */}
            {showPhoto && photoIsTop && (
              <div style={{
                display: 'flex',
                justifyContent: photoPos === 'top-center' ? 'center' : photoPos === 'top-right' ? 'flex-end' : 'flex-start',
                marginBottom: '10pt',
              }}>
                {photoEl}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: s.headerAlignment === 'center' ? 'column' : 'row',
              justifyContent: s.headerAlignment === 'right' ? 'flex-end' : s.headerAlignment === 'center' ? 'center' : 'space-between',
              alignItems: s.headerAlignment === 'center' ? 'center' : 'flex-end',
              flexWrap: 'wrap',
              gap: '10pt',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14pt' }}>
                {showPhoto && !photoIsTop && photoEl}
                {nameEl}
              </div>

              <div style={{
                textAlign: s.headerAlignment as 'left' | 'center' | 'right',
                minWidth: s.headerAlignment === 'center' ? '100%' : 'auto',
              }}>
                {contactEl}
              </div>
            </div>
          </div>
        )
      })()}

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
          borderRight: s.columnLayout !== 'one' && sidebarSections.length > 0 ? `0.5pt solid ${colors.accent}` : 'none',
        }}>
          {mainSections.map((section, i) => (
            <React.Fragment key={section.id}>
              {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
              <div data-section>
                <SectionRenderer
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => <SectionHeading title={title} type={section.type} ctx={ctx} />}
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
          }}>
            {sidebarSections.map((section, i) => (
              <div key={section.id} data-section>
                <SectionRenderer
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => <SectionHeading title={title} type={section.type} ctx={ctx} isSidebar={true} />}
                  isSidebar={true}
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
      borderTop: `0.5pt solid ${colors.accent}`,
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
