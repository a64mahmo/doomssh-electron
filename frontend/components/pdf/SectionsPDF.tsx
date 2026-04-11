import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type {
  ResumeSection, ExperienceItem, EducationItem, SkillItem,
  ProjectItem, CertificationItem, LanguageItem, AwardItem,
  VolunteeringItem, PublicationItem, ReferenceItem, CustomItem,
  HeaderData,
} from '@/lib/store/types'
import { parseMdLines, tokenizeMd } from '@/lib/utils/text'
import { formatDateRange } from '@/lib/utils/dates'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'
import { BsIconPDF } from '@/lib/icons/BsIconPDF'
import { DEFAULT_CONTACT_ICONS } from '@/lib/icons/bootstrapIcons'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert 6-digit hex + decimal opacity → rgba string safe for @react-pdf */
export function hexA(hex: string, opacity: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

/** Render **bold** / _italic_ markdown inside a <Text> or <View> list */
function renderMd(text: string, ctx: TemplateCtx) {
  const { base, lh, colors, bullet, pt, s } = ctx;
  const lines = parseMdLines(text);

  return lines.map((line, i) => {
    const renderedContent = tokenizeMd(line.content).map((tok, j) => (
      <Text key={j} style={{ 
        fontWeight: tok.bold ? 'bold' : 'normal',
        fontStyle: tok.italic ? 'italic' : 'normal'
      }}>
        {tok.text}
      </Text>
    ));

    if (line.type === 'bullet') {
      return (
        <View key={i} style={{
          flexDirection: 'row',
          marginLeft: s.indentBody ? 12 : 0,
          marginBottom: 1.5,
        }}>
          <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, marginRight: 6, color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text, flexShrink: 0 }}>
            {bullet}
          </Text>
          <Text style={{ fontSize: pt(base * 0.92), lineHeight: lh, flex: 1, color: colors.text }}>
            {renderedContent}
          </Text>
        </View>
      );
    }

    return (
      <Text key={i} style={{ 
        fontSize: pt(base * 0.92), 
        lineHeight: lh, 
        marginBottom: 3,
        color: colors.text 
      }}>
        {renderedContent}
      </Text>
    );
  });
}

// ─── Shared Entry primitive ───────────────────────────────────────────────────

function Entry({
  title, subtitle, location, date, description, ctx, extraLine, isSidebar = false,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  location?: string
  date?: string
  description?: string
  ctx: TemplateCtx
  extraLine?: React.ReactNode
  isSidebar?: boolean
}) {
  const { base, lh, colors, bullet, s, pt } = ctx

  const subStyle: any = {
    fontSize:    pt(base * 0.9),
    fontStyle:   (s.subtitleStyle === 'italic' ? 'italic' : 'normal') as 'italic' | 'normal',
    fontWeight:  (s.subtitleStyle === 'bold'   ? 'bold'   : 'normal') as 'bold' | 'normal',
    color:       s.applyAccentEntrySubtitle ? colors.accent : colors.subtitle,
  }

  const titleSizes = { S: 1.0, M: 1.05, L: 1.15 };
  const currentTitleSize = titleSizes[s.titleSize || "M"];
  const titleFontSize = base * currentTitleSize;
  const titleWeight = s.titleBold !== false ? 'bold' : 'normal'

  const layout = isSidebar ? "full-width" : (s.entryLayout || "date-location-right");

  const DateElement = date ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
      <View style={{ marginRight: 4 }}>
        <BsIconPDF name="calendar" size={8} color={s.applyAccentDates ? colors.accent : colors.date} />
      </View>
      <Text style={{ fontSize: pt(base * 0.85), color: s.applyAccentDates ? colors.accent : colors.date, fontWeight: 500 }}>
        {date}
      </Text>
    </View>
  ) : null;

  const LocationElement = location ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
      <View style={{ marginRight: 4 }}>
        <BsIconPDF name="geo-alt" size={8} color={colors.subtitle} />
      </View>
      <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, fontWeight: 500 }}>
        {location}
      </Text>
    </View>
  ) : null;

  const isSameLine = s.subtitlePlacement === "same-line";

  return (
    <View style={{ marginBottom: Number(ctx.gap.replace('pt', '')) }} wrap={false}>
      {layout === "date-location-right" ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', marginTop: 2 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-location-left" ? (
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginLeft: 8, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text, textAlign: 'right' }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            {subtitle && !isSameLine && (
              <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh, textAlign: 'right' }}>{subtitle}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-start', marginTop: 2 }}>
            {DateElement}
            {LocationElement}
          </View>
        </View>
      ) : layout === "date-content-location" ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text, marginRight: 12 }}>
              {title}
              {subtitle && isSameLine && (
                <Text style={subStyle}>{"  "}{subtitle}</Text>
              )}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {DateElement}
              {date && location && <View style={{ width: 12 }} />}
              {LocationElement}
            </View>
          </View>
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
        </View>
      ) : (
        <View>
          <Text style={{ fontWeight: titleWeight, fontSize: pt(titleFontSize), lineHeight: lh, color: colors.text }}>
            {title}
            {subtitle && isSameLine && (
              <Text style={subStyle}>{"  "}{subtitle}</Text>
            )}
          </Text>
          {subtitle && !isSameLine && (
            <Text style={{ ...subStyle, marginTop: 1, lineHeight: lh }}>{subtitle}</Text>
          )}
          {!isSidebar && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              {DateElement}
              {date && location && <View style={{ width: 12 }} />}
              {LocationElement}
            </View>
          )}
        </View>
      )}

      {extraLine}

      {/* Structured content (paragraphs & bullets) */}
      {description && (
        <View style={{ marginTop: 3 }}>
          {renderMd(description, ctx)}
        </View>
      )}

      {isSidebar && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          {DateElement}
          {date && location && <View style={{ width: 12 }} />}
          {LocationElement}
        </View>
      )}
    </View>
  )
}

// ─── Contact line ─────────────────────────────────────────────────────────────

function ContactItemPDF({ 
  iconName, 
  value, 
  ctx,
  itemStyleOverrides,
  textColorOverride
}: { 
  iconName?: string; 
  value: string; 
  ctx: TemplateCtx;
  itemStyleOverrides?: any;
  textColorOverride?: string;
}) {
  const { colors, s, pt, base, lh } = ctx
  const isBlue = s.linkBlue
  const showIcons = s.contactIcons
  const iconStyle = s.contactIconStyle || 'none'

  const defaultText = s.themeColorStyle === 'advanced' ? colors.background : colors.text;
  const finalTextColor = isBlue ? '#2563eb' : (textColorOverride || defaultText);
  const finalIconColor = isBlue ? "#2563eb" : (s.applyAccentHeaderIcons ? (s.themeColorStyle === 'advanced' ? colors.background : colors.accent) : finalTextColor);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...itemStyleOverrides }}>
      {showIcons && iconName && (
        <View style={{ 
          marginRight: 6,
          alignItems: 'center',
          justifyContent: 'center',
          ...(iconStyle === 'circle-filled' && { borderRadius: 999 }),
          ...(iconStyle === 'rounded-filled' && { borderRadius: 2 }),
          ...(iconStyle === 'square-filled' && { borderRadius: 0 }),
          ...(iconStyle === 'circle-outline' && { borderRadius: 999, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle === 'rounded-outline' && { borderRadius: 2, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle === 'square-outline' && { borderRadius: 0, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle.includes('filled') ? { 
            width: 13, 
            height: 13, 
            backgroundColor: finalIconColor 
          } : (iconStyle.includes('outline') ? {
            width: 13,
            height: 13,
            backgroundColor: 'transparent'
          } : {}))
        }}>
          <BsIconPDF 
            name={iconName} 
            size={iconStyle === 'none' ? 11 : 8} 
            color={iconStyle.includes('filled') ? '#ffffff' : finalIconColor} 
          />
        </View>
      )}
      <Text 
        style={{ 
          fontSize: pt(base * 0.85),
          color: finalTextColor,
          lineHeight: lh,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function ContactLinePDF({
  h,
  ctx,
  alignOverride,
  textColorOverride,
}: {
  h: HeaderData;
  ctx: TemplateCtx;
  alignOverride?: "left" | "center" | "right";
  textColorOverride?: string;
}) {
  const { s, pt, base, colors } = ctx;

  const parts = [
    // Contact
    { val: h.email, key: "email" },
    { val: h.phone, key: "phone" },
    { val: h.secondPhone, key: "secondPhone" },
    { val: h.location, key: "location" },
    // Links
    { val: h.website, key: "website" },
    { val: h.linkedin, key: "linkedin" },
    { val: h.github, key: "github" },
    { val: h.gitlab, key: "gitlab" },
    { val: h.bitbucket, key: "bitbucket" },
    { val: h.stackoverflow, key: "stackoverflow" },
    // Social
    { val: h.twitter, key: "twitter" },
    { val: h.bluesky, key: "bluesky" },
    { val: h.threads, key: "threads" },
    { val: h.mastodon, key: "mastodon" },
    { val: h.instagram, key: "instagram" },
    { val: h.facebook, key: "facebook" },
    { val: h.youtube, key: "youtube" },
    { val: h.tiktok, key: "tiktok" },
    { val: h.pinterest, key: "pinterest" },
    { val: h.reddit, key: "reddit" },
    { val: h.discord, key: "discord" },
    { val: h.medium, key: "medium" },
    { val: h.behance, key: "behance" },
    { val: h.dribbble, key: "dribbble" },
    // Personal details
    { val: h.nationality, key: "nationality" },
    { val: h.dateOfBirth, key: "dateOfBirth" },
    { val: h.genderPronoun, key: "genderPronoun" },
    { val: h.maritalStatus, key: "maritalStatus" },
    { val: h.visa, key: "visa" },
    { val: h.passportOrId, key: "passportOrId" },
    { val: h.drivingLicense, key: "drivingLicense" },
    { val: h.availability, key: "availability" },
    { val: h.workMode, key: "workMode" },
    { val: h.relocation, key: "relocation" },
    { val: h.expectedSalary, key: "expectedSalary" },
    { val: h.securityClearance, key: "securityClearance" },
    { val: h.militaryService, key: "militaryService" },
    { val: h.disability, key: "disability" },
  ].filter((p) => p.val && p.val.trim());

  if (!parts.length) return null;

  const arrangement = s.detailsArrangement || "wrap";
  const gapSize = s.detailsSpacing === "comfortable" ? 10 : 6;
  const align = s.headerAlignment;
  const textAlign = alignOverride || s.detailsTextAlignment || align;
  const isCenter = textAlign === "center";
  const isRight = textAlign === "right";
  const delimiter = s.headerArrangement;

  if (arrangement === 'grid') {
    const rows: typeof parts[] = []
    for (let i = 0; i < parts.length; i += 2) {
      rows.push(parts.slice(i, i + 2))
    }
    return (
      <View style={{ 
        alignItems: isCenter ? 'center' : (isRight ? 'flex-end' : 'flex-start'),
        width: '100%'
      }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ 
            flexDirection: 'row', 
            marginBottom: ri < rows.length - 1 ? 4 : 0,
            justifyContent: isCenter ? 'center' : (isRight ? 'flex-end' : 'flex-start'),
            width: isCenter ? 'auto' : '100%'
          }}>
            {row.map((p, ci) => (
              <ContactItemPDF 
                key={ci} 
                value={p.val!} 
                iconName={DEFAULT_CONTACT_ICONS[p.key]} 
                ctx={ctx} 
                itemStyleOverrides={{ 
                   width: isCenter ? 'auto' : '50%',
                   marginRight: (isCenter && ci === 0) ? 20 : 0 
                }}
                textColorOverride={textColorOverride}
              />
            ))}
          </View>
        ))}
      </View>
    )
  }

  const sep = delimiter === 'bullet' ? '•' : delimiter === 'verticalBar' ? '|' : ''
  const hasVisibleDelimiter = !!sep;
  const horizontalGap = s.detailsSpacing === "comfortable" ? 12 : 8;
  
  return (
    <View
      style={{
        flexDirection: arrangement === "column" ? "column" : "row",
        flexWrap: arrangement === "column" ? "nowrap" : "wrap",
        width: "100%",
        justifyContent: isCenter
          ? "center"
          : isRight
            ? "flex-end"
            : "flex-start",
        alignItems: isCenter ? "center" : isRight ? "flex-end" : "flex-start",
      }}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              ...(arrangement === "column" ? {
                width: "100%",
                justifyContent: isCenter
                  ? "center"
                  : isRight
                    ? "flex-end"
                    : "flex-start",
              } : {
                marginRight: (!hasVisibleDelimiter && i < parts.length - 1) ? horizontalGap : 0
              }),
            }}
          >
            <ContactItemPDF
              value={p.val!}
              iconName={DEFAULT_CONTACT_ICONS[p.key]}
              ctx={ctx}
              itemStyleOverrides={{
                marginBottom:
                  arrangement === "column" && i < parts.length - 1 ? 4 : 2,
              }}
              textColorOverride={textColorOverride}
            />
          </View>
          {arrangement === "wrap" && i < parts.length - 1 && hasVisibleDelimiter && (
            <View
              style={{
                width: s.detailsSpacing === "comfortable" ? 24 : 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: pt(base * 0.8), color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text, opacity: 0.3 }}>
                {sep}
              </Text>
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
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

function SummarySectionPDF({ section, ctx, renderHeading }: { section: ResumeSection; ctx: TemplateCtx; renderHeading: HeadingFn; isSidebar?: boolean }) {
  const text = (section.items as { text: string })?.text || ''
  if (!text) return null
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ marginTop: 2 }}>{renderMd(text, ctx)}</View>
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
            subtitle={sub || undefined}
            location={item.location}
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
            location={item.location}
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
              backgroundColor: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text,
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
              color: s.linkBlue ? '#0066cc' : (s.applyAccentLinkIcons ? colors.accent : colors.text),
              textDecoration: s.linkUnderline ? 'underline' : 'none',
            }}>{item.url}</Text>
          ) : undefined}          date={item.date ? formatDateRange(item.date, '', false, s.dateFormat) : undefined}
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
  const { base, colors, lh, pt, s } = ctx
  return (
    <View>
      {renderHeading(section.title)}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8pt 24pt' }}>
        {items.map(item => (
          <View key={item.id} style={{ minWidth: 140 }}>
            <Text style={{ fontWeight: 'bold', fontSize: pt(base * 0.9), lineHeight: 1.4 }}>{item.name}</Text>
            {item.position && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.position}</Text>}
            {item.company  && <Text style={{ fontSize: pt(base * 0.85), color: colors.subtitle, lineHeight: lh }}>{item.company}</Text>}
            {item.email    && <Text style={{ fontSize: pt(base * 0.82), color: s.applyAccentLinkIcons ? colors.accent : colors.text,   lineHeight: lh }}>{item.email}</Text>}
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
