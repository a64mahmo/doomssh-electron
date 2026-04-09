import React from 'react'
import type { ResumeSection, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem, LanguageItem, AwardItem, VolunteeringItem, PublicationItem, ReferenceItem, CustomItem } from '@/lib/store/types'
import { parseBullets } from '@/lib/pdf/pdfStyles'
import { formatDateRange } from '@/lib/utils/dates'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  if (!text) return []
  const parts: React.ReactNode[] = []
  
  // Simple bold/italic regex
  // **bold** | _italic_
  const tokens = text.split(/(\*\*.*?\*\*|_.*?_)/g)
  
  tokens.forEach((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={i} style={{ fontWeight: 700 }}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('_') && token.endsWith('_')) {
      parts.push(<em key={i} style={{ fontStyle: 'italic' }}>{token.slice(1, -1)}</em>)
    } else if (token) {
      parts.push(token)
    }
  })
  
  return parts
}

// ─── Shared primitive ─────────────────────────────────────────────────────────
// A standard two-line entry used by experience, education, projects, etc.
function Entry({
  title, subtitle, date, description, ctx, extraLine, isSidebar = false,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  date?: string
  description?: string
  ctx: TemplateCtx
  extraLine?: React.ReactNode
  isSidebar?: boolean
}) {
  const { base, lh, colors, bullet, s, pt } = ctx
  const bullets = parseBullets(description || '')
  
  const subStyle: React.CSSProperties = {
    fontSize:   pt(base * 0.9),
    fontStyle:  s.subtitleStyle === 'italic' ? 'italic' : 'normal',
    fontWeight: s.subtitleStyle === 'bold'   ? 'bold'   : 'normal',
    color:      colors.subtitle,
  }

  const isSameLine = s.subtitlePlacement === 'same-line' && !isSidebar

  return (
    <div style={{ marginBottom: ctx.gap }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isSidebar ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isSidebar ? 'flex-start' : 'baseline', 
        flexWrap: 'wrap',
        gap: isSidebar ? '2pt' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6pt', flex: 1, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', fontSize: pt(base) }}>{title}</span>
          {subtitle && isSameLine && (
            <span style={subStyle}>{subtitle}</span>
          )}
        </div>
        {date && (
          <span style={{ 
            fontSize: pt(base * 0.85), 
            color: colors.date, 
            marginLeft: isSidebar ? '0' : '8pt', 
            whiteSpace: 'nowrap', 
            flexShrink: 0,
            fontStyle: isSidebar ? 'italic' : 'normal',
            marginTop: isSidebar ? '1pt' : '0'
          }}>
            {date}
          </span>
        )}
      </div>
      
      {subtitle && !isSameLine && (
        <div style={{ ...subStyle, marginTop: '1pt' }}>{subtitle}</div>
      )}
      
      {extraLine}
      
      <div style={{ marginTop: bullets.length ? '3pt' : 0 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{
            display: 'flex',
            fontSize: pt(base * 0.92), 
            lineHeight: lh,
            marginLeft: s.indentBody ? '12pt' : 0,
            marginBottom: '1.5pt',
            color: colors.text,
          }}>
            <span style={{ marginRight: '6pt', shrink: 0, color: colors.accent }}>{bullet}</span>
            <span>{renderMarkdown(b)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Contact header ───────────────────────────────────────────────────────────
export type ContactDisplay = 'inline' | 'block'

export interface HeaderData {
  fullName: string; jobTitle: string; email: string; phone: string;
  location: string; website: string; linkedin: string; github: string
}

export function ContactLine({ h, ctx, display = 'inline' }: {
  h: HeaderData
  ctx: TemplateCtx
  display?: ContactDisplay
}) {
  const { base, colors, s, pt, lh } = ctx
  const parts = [
    { val: h.email, label: 'Email' },
    { val: h.phone, label: 'Phone' },
    { val: h.location, label: 'Location' },
    { val: h.linkedin, label: 'LinkedIn' },
    { val: h.github, label: 'GitHub' },
    { val: h.website, label: 'Website' }
  ].filter(p => p.val)
  
  if (!parts.length) return null
  
  const arrangement = s.headerArrangement
  const sep = arrangement === 'pipe' ? ' | ' : arrangement === 'bullet' ? ' • ' : arrangement === 'bar' ? ' / ' : ' · '

  if (display === 'block') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2pt' }}>
        {parts.map((p, i) => (
          <div key={i} style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>
            {arrangement === 'icon' && <span style={{ fontWeight: 'bold', color: colors.accent, marginRight: '4pt' }}>{p.label[0]}:</span>}
            {p.val}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ fontSize: pt(base * 0.85), color: colors.subtitle, display: 'flex', flexWrap: 'wrap', justifyContent: s.headerAlignment, gap: '0 8pt' }}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {arrangement === 'icon' && <span style={{ fontWeight: 'bold', color: colors.accent, marginRight: '3pt' }}>{p.label[0]}:</span>}
            {p.val}
          </div>
          {i < parts.length - 1 && <span>{sep}</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Section dispatchers ──────────────────────────────────────────────────────
type HeadingFn = (title: string) => React.ReactNode

export function SectionRenderer({ section, ctx, renderHeading, isSidebar = false }: {
  section: ResumeSection
  ctx: TemplateCtx
  renderHeading: HeadingFn
  isSidebar?: boolean
}) {
  if (!section.visible) return null
  switch (section.type) {
    case 'summary':        return <SummarySection        section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'experience':     return <ExperienceSection     section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'education':      return <EducationSection      section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'skills':         return <SkillsSection         section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'projects':       return <ProjectsSection       section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'certifications': return <CertificationsSection section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'languages':      return <LanguagesSection      section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'awards':         return <AwardsSection         section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'volunteering':   return <VolunteeringSection   section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'publications':   return <PublicationsSection   section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'references':     return <ReferencesSection     section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    case 'custom':         return <CustomSectionRender   section={section} ctx={ctx} renderHeading={renderHeading} isSidebar={isSidebar} />
    default: return null
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
function SummarySection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const text = (section.items as { text: string })?.text || ''
  if (!text) return null
  return (
    <div>
      {renderHeading(section.title)}
      <div style={{ fontSize: ctx.pt(ctx.base), lineHeight: ctx.lh }}>{renderMarkdown(text)}</div>
    </div>
  )
}

// ── Experience ────────────────────────────────────────────────────────────────
function ExperienceSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ExperienceItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => {
        const title = s.experienceOrder === 'employer-title' ? item.company  : item.position
        const sub   = s.experienceOrder === 'employer-title' ? item.position : item.company
        return (
          <Entry key={item.id}
            title={title}
            subtitle={sub ? `${sub}${item.location ? ` · ${item.location}` : ''}` : undefined}
            date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
          />
        )
      })}
    </div>
  )
}

// ── Education ─────────────────────────────────────────────────────────────────
function EducationSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as EducationItem[]) || []
  if (!items.length) return null
  const { s, base, colors, pt } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => {
        const degreeStr = [item.degree, item.field].filter(Boolean).join(', ')
        const title = s.educationOrder === 'school-degree' ? item.institution : (degreeStr || item.institution)
        const sub   = s.educationOrder === 'school-degree' ? degreeStr : item.institution
        return (
          <Entry key={item.id}
            title={title}
            subtitle={sub || undefined}
            date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
            extraLine={item.gpa ? (
              <div style={{ fontSize: pt(base * 0.85), color: colors.subtitle, marginBottom: '2pt' }}>GPA: {item.gpa}</div>
            ) : undefined}
          />
        )
      })}
    </div>
  )
}

// ── Skills ────────────────────────────────────────────────────────────────────
function SkillsSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as SkillItem[]) || []
  if (!items.length) return null
  const { base, lh, colors, bullet, s, pt } = ctx

  const display = s.skillDisplay

  return (
    <div>
      {renderHeading(section.title)}
      {display === 'compact' && (
        <div style={{ fontSize: pt(base), lineHeight: lh, color: colors.text }}>
          {items.map(sk => sk.name).join(' · ')}
        </div>
      )}
      {display === 'grid' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt 16pt' }}>
          {items.map(sk => (
            <span key={sk.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
              {bullet} {sk.category ? `${sk.category}: ` : ''}{sk.name}
            </span>
          ))}
        </div>
      )}
      {display === 'level' && (
        <div>
          {items.map(sk => (
            <div key={sk.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: pt(base * 0.9), lineHeight: lh, marginBottom: '1pt' }}>
              <span>{sk.category ? `${sk.category}: ` : ''}{sk.name}</span>
              {sk.level && <span style={{ color: colors.subtitle }}>{sk.level}</span>}
            </div>
          ))}
        </div>
      )}
      {display === 'bubble' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt' }}>
          {items.map(sk => (
            <span key={sk.id} style={{
              fontSize: pt(base * 0.85),
              backgroundColor: colors.accent + '18',
              color: colors.accent,
              padding: '2pt 7pt',
              borderRadius: '99pt',
              fontWeight: 500,
            }}>
              {sk.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Projects ──────────────────────────────────────────────────────────────────
function ProjectsSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ProjectItem[]) || []
  if (!items.length) return null
  const { base, colors, s, pt } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.name}
          subtitle={item.url ? <span style={{ fontSize: pt(base * 0.85), color: colors.accent }}>{item.url}</span> : undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}

// ── Certifications ────────────────────────────────────────────────────────────
function CertificationsSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as CertificationItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.name}
          subtitle={item.issuer || undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}

// ── Languages ─────────────────────────────────────────────────────────────────
function LanguagesSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as LanguageItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt 20pt' }}>
        {items.map(item => (
          <div key={item.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
            {item.language}
            {item.level && <span style={{ color: colors.subtitle }}> · {item.level}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Awards ────────────────────────────────────────────────────────────────────
function AwardsSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as AwardItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.title}
          subtitle={item.issuer || undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}

// ── Volunteering ──────────────────────────────────────────────────────────────
function VolunteeringSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as VolunteeringItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.role}
          subtitle={item.organization || undefined}
          date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}

// ── Publications ──────────────────────────────────────────────────────────────
function PublicationsSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as PublicationItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.title}
          subtitle={item.publisher || undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}

// ── References ────────────────────────────────────────────────────────────────
function ReferencesSection({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ReferenceItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8pt 24pt' }}>
        {items.map(item => (
          <div key={item.id} style={{ minWidth: '140pt' }}>
            <div style={{ fontWeight: 'bold', fontSize: pt(base * 0.9) }}>{item.name}</div>
            {item.position && <div style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.position}</div>}
            {item.company  && <div style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.company}</div>}
            {item.email    && <div style={{ fontSize: pt(base * 0.82), color: colors.accent,   lineHeight: lh }}>{item.email}</div>}
            {item.phone    && <div style={{ fontSize: pt(base * 0.82), color: colors.subtitle, lineHeight: lh }}>{item.phone}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Custom ────────────────────────────────────────────────────────────────────
function CustomSectionRender({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as CustomItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <div>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.title}
          subtitle={item.subtitle || undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  )
}
