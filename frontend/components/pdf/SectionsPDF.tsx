import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type {
  ResumeSection, ExperienceItem, EducationItem, SkillItem,
  ProjectItem, CertificationItem, LanguageItem, AwardItem,
  VolunteeringItem, PublicationItem, ReferenceItem, CustomItem,
} from '@/lib/store/types'
import { parseBullets } from '@/lib/pdf/pdfStyles'
import { formatDateRange } from '@/lib/utils/dates'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert 6-digit hex + decimal opacity → rgba string safe for @react-pdf */
export function hexA(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

/** Render **bold** / _italic_ markdown inside a <Text> */
function renderMd(text: string): React.ReactNode[] {
  if (!text) return []
  return text.split(/(\*\*.*?\*\*|_.*?_)/g).map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**'))
      return <Text key={i} style={{ fontWeight: 'bold' }}>{tok.slice(2, -2)}</Text>
    if (tok.startsWith('_') && tok.endsWith('_'))
      return <Text key={i} style={{ fontStyle: 'italic' }}>{tok.slice(1, -1)}</Text>
    return tok || null
  }).filter(Boolean) as React.ReactNode[]
}

// ─── Shared Entry primitive ───────────────────────────────────────────────────

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

  const subStyle = {
    fontSize:    pt(base * 0.9),
    fontStyle:   (s.subtitleStyle === 'italic' ? 'italic' : 'normal') as 'italic' | 'normal',
    fontWeight:  (s.subtitleStyle === 'bold'   ? 'bold'   : 'normal') as 'bold' | 'normal',
    color:       colors.subtitle,
  }

  const isSameLine = s.subtitlePlacement === 'same-line' && !isSidebar
  const titleFontSize = s.titleSize === 'S' ? base * 0.9 : s.titleSize === 'L' ? base * 1.1 : base
  const titleWeight = s.titleBold !== false ? 'bold' : 'normal'

  return (
    <View style={{ marginBottom: Number(ctx.gap.replace('pt', '')) }} wrap={false}>
      {/* Title + date row */}
      {isSidebar ? (
        <View>
          <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh }}>
            {title}
          </Text>
          {date && (
            <Text style={{ fontSize: pt(base * 0.85), color: colors.date, fontStyle: 'italic', marginTop: 1, lineHeight: lh }}>
              {date}
            </Text>
          )}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, flex: 1, marginRight: 8 }}>
            {title}
            {subtitle && isSameLine && (
              <Text style={subStyle}>{'  '}{subtitle}</Text>
            )}
          </Text>
          {date && (
            <Text style={{ fontSize: pt(base * 0.85), color: colors.date, lineHeight: lh, flexShrink: 0, marginTop: 1 }}>
              {date}
            </Text>
          )}
        </View>
      )}

      {/* Subtitle second line */}
      {subtitle && !isSameLine && (
        <Text style={{ ...subStyle, marginTop: 2, lineHeight: lh }}>{subtitle}</Text>
      )}

      {extraLine}

      {/* Bullet list */}
      {bullets.length > 0 && (
        <View style={{ marginTop: 3 }}>
          {bullets.map((b, i) => (
            <View key={i} style={{
              flexDirection: 'row',
              marginLeft: s.indentBody ? 12 : 0,
              marginBottom: 1.5,
            }}>
              <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, marginRight: 6, color: colors.accent, flexShrink: 0 }}>
                {bullet}
              </Text>
              <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, flex: 1, color: colors.text }}>
                {renderMd(b)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Contact line ─────────────────────────────────────────────────────────────

export interface HeaderData {
  fullName: string; jobTitle: string; email: string; phone: string
  location: string; website: string; linkedin: string; github: string
  photo?: string
  twitter?: string
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  pinterest?: string
  medium?: string
  behance?: string
  dribbble?: string
  stackoverflow?: string
  gitlab?: string
  bitbucket?: string
  discord?: string
  reddit?: string
  bluesky?: string
  threads?: string
  mastodon?: string
  nationality?: string
  dateOfBirth?: string
  visa?: string
  passportOrId?: string
  availability?: string
  genderPronoun?: string
  disability?: string
  workMode?: string
  relocation?: string
  expectedSalary?: string
  secondPhone?: string
  drivingLicense?: string
  securityClearance?: string
  maritalStatus?: string
  militaryService?: string
  smoking?: string
  height?: string
  weight?: string
}

export function ContactLinePDF({ h, ctx, display = 'inline', align = 'left' }: {
  h: HeaderData
  ctx: TemplateCtx
  display?: 'inline' | 'block'
  align?: 'left' | 'center' | 'right'
}) {
  const { base, colors, s, pt, lh } = ctx

  const parts = [
    // Contact
    { val: h.email,         label: 'E' },
    { val: h.phone,         label: 'P' },
    { val: h.secondPhone,   label: 'P2' },
    { val: h.location,      label: 'L' },
    // Links
    { val: h.website,       label: 'W' },
    { val: h.linkedin,      label: 'in' },
    { val: h.github,        label: 'gh' },
    { val: h.gitlab,        label: 'gl' },
    { val: h.bitbucket,     label: 'bb' },
    { val: h.stackoverflow, label: 'SO' },
    // Social
    { val: h.twitter,       label: 'X' },
    { val: h.bluesky,       label: 'BS' },
    { val: h.threads,       label: 'TH' },
    { val: h.mastodon,      label: 'MT' },
    { val: h.instagram,     label: 'IG' },
    { val: h.facebook,      label: 'FB' },
    { val: h.youtube,       label: 'YT' },
    { val: h.tiktok,        label: 'TT' },
    { val: h.pinterest,     label: 'PN' },
    { val: h.reddit,        label: 'RD' },
    { val: h.discord,       label: 'DC' },
    { val: h.medium,        label: 'MD' },
    { val: h.behance,       label: 'Bh' },
    { val: h.dribbble,      label: 'Dr' },
    // Personal details
    { val: h.nationality,      label: 'Nat' },
    { val: h.dateOfBirth,      label: 'DOB' },
    { val: h.genderPronoun,    label: 'G' },
    { val: h.maritalStatus,    label: 'MS' },
    { val: h.visa,             label: 'Visa' },
    { val: h.passportOrId,     label: 'ID' },
    { val: h.drivingLicense,   label: 'DL' },
    { val: h.availability,     label: 'Avail' },
    { val: h.workMode,         label: 'WM' },
    { val: h.relocation,       label: 'Rel' },
    { val: h.expectedSalary,   label: '$' },
    { val: h.securityClearance, label: 'SC' },
    { val: h.militaryService,  label: 'Mil' },
    { val: h.disability,       label: 'Dis' },
  ].filter(p => p.val)

  if (!parts.length) return null

  const arrangement = s.headerArrangement
  const sep = arrangement === 'pipe' ? ' | ' : arrangement === 'bullet' ? ' • ' : arrangement === 'bar' ? ' / ' : ' · '

  const itemStyle = { fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh, textAlign: align as 'left' | 'center' | 'right' }

  if (display === 'block') {
    return (
      <View style={{ gap: 2 }}>
        {parts.map((p, i) => (
          <Text key={i} style={itemStyle}>
            {arrangement === 'icon' && <Text style={{ fontWeight: 'bold', color: colors.accent }}>{p.label}: </Text>}
            {p.val}
          </Text>
        ))}
      </View>
    )
  }

  // inline: all items in a wrapping row, centered via Text alignment
  const allText = parts.map((p, i) => {
    const prefix = i > 0 ? sep : ''
    const labelPart = arrangement === 'icon' ? `${p.label}: ` : ''
    return `${prefix}${labelPart}${p.val}`
  }).join('')

  return (
    <Text style={{ ...itemStyle, textAlign: align as 'left' | 'center' | 'right' }}>
      {allText}
    </Text>
  )
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

type HeadingFn = (title: string) => React.ReactNode

export function SectionRendererPDF({ section, ctx, renderHeading, isSidebar = false }: {
  section: ResumeSection
  ctx: TemplateCtx
  renderHeading: HeadingFn
  isSidebar?: boolean
}) {
  if (!section.visible) return null
  const props = { section, ctx, renderHeading, isSidebar }
  switch (section.type) {
    case 'summary':        return <SummarySectionPDF        {...props} />
    case 'experience':     return <ExperienceSectionPDF     {...props} />
    case 'education':      return <EducationSectionPDF      {...props} />
    case 'skills':         return <SkillsSectionPDF         {...props} />
    case 'projects':       return <ProjectsSectionPDF       {...props} />
    case 'certifications': return <CertificationsSectionPDF {...props} />
    case 'languages':      return <LanguagesSectionPDF      {...props} />
    case 'awards':         return <AwardsSectionPDF         {...props} />
    case 'volunteering':   return <VolunteeringSectionPDF   {...props} />
    case 'publications':   return <PublicationsSectionPDF   {...props} />
    case 'references':     return <ReferencesSectionPDF     {...props} />
    case 'custom':         return <CustomSectionPDF         {...props} />
    default: return null
  }
}

// ─── Section renderers ────────────────────────────────────────────────────────

function SummarySectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const text = (section.items as { text: string })?.text || ''
  if (!text) return null
  return (
    <View>
      {renderHeading(section.title)}
      <Text style={{ fontSize: ctx.pt(ctx.base), lineHeight: ctx.lh }}>{renderMd(text)}</Text>
    </View>
  )
}

function ExperienceSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ExperienceItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}

function EducationSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as EducationItem[]) || []
  if (!items.length) return null
  const { s, base, colors, pt } = ctx
  return (
    <View>
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
              <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, marginBottom: 2 }}>GPA: {item.gpa}</Text>
            ) : undefined}
          />
        )
      })}
    </View>
  )
}

function SkillsSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as SkillItem[]) || []
  if (!items.length) return null
  const { base, lh, colors, bullet, s, pt } = ctx
  const display = s.skillDisplay

  return (
    <View>
      {renderHeading(section.title)}
      {display === 'compact' && (
        <Text style={{ fontSize: pt(base), lineHeight: lh, color: colors.text }}>
          {items.map(sk => sk.name).join(' · ')}
        </Text>
      )}
      {display === 'grid' && (() => {
        const cols = s.skillColumns ?? 3
        const colWidth = `${Math.floor(100 / cols)}%`
        return (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {items.map(sk => (
              <Text key={sk.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh, width: colWidth, marginBottom: 2 }}>
                {bullet} {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
            ))}
          </View>
        )
      })()}
      {display === 'level' && (
        <View>
          {items.map(sk => (
            <View key={sk.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
              <Text style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
                {sk.category ? `${sk.category}: ` : ''}{sk.name}
              </Text>
              {sk.level && <Text style={{ fontSize: pt(base * 0.9), lineHeight: lh, color: colors.subtitle }}>{sk.level}</Text>}
            </View>
          ))}
        </View>
      )}
      {display === 'bubble' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {items.map(sk => (
            <Text key={sk.id} style={{
              fontSize: pt(base * 0.85),
              backgroundColor: colors.accent,
              color: colors.background,
              paddingVertical: 2,
              paddingHorizontal: 7,
              borderRadius: 99,
              fontWeight: 500,
            }}>
              {sk.name}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

function ProjectsSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ProjectItem[]) || []
  if (!items.length) return null
  const { base, colors, s, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      {items.map(item => (
        <Entry key={item.id}
          title={item.name}
          subtitle={item.url ? (
            <Text style={{
              fontSize: pt(base * 0.85),
              color: s.linkBlue ? '#0066cc' : colors.accent,
              textDecoration: s.linkUnderline ? 'underline' : 'none',
            }}>{item.url}</Text>
          ) : undefined}
          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </View>
  )
}

function CertificationsSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as CertificationItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}

function LanguagesSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as LanguageItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '4pt 20pt' }}>
        {items.map(item => (
          <Text key={item.id} style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
            {item.language}
            {item.level && <Text style={{ color: colors.subtitle }}> · {item.level}</Text>}
          </Text>
        ))}
      </View>
    </View>
  )
}

function AwardsSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as AwardItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}

function VolunteeringSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as VolunteeringItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}

function PublicationsSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as PublicationItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}

function ReferencesSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as ReferenceItem[]) || []
  if (!items.length) return null
  const { base, colors, lh, pt } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8pt 24pt' }}>
        {items.map(item => (
          <View key={item.id} style={{ minWidth: 140 }}>
            <Text style={{ fontWeight: 'bold', fontSize: pt(base * 0.9), lineHeight: 1.4 }}>{item.name}</Text>
            {item.position && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.position}</Text>}
            {item.company  && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.company}</Text>}
            {item.email    && <Text style={{ fontSize: pt(base * 0.82), color: colors.accent,   lineHeight: lh }}>{item.email}</Text>}
            {item.phone    && <Text style={{ fontSize: pt(base * 0.82), color: colors.subtitle, lineHeight: lh }}>{item.phone}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}

function CustomSectionPDF({ section, ctx, renderHeading, isSidebar }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const items = (section.items as CustomItem[]) || []
  if (!items.length) return null
  const { s } = ctx
  return (
    <View>
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
    </View>
  )
}
