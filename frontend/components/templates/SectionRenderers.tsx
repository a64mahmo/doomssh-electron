import React from "react";
import { cn } from "@/lib/utils";
import type {
  ResumeSection,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  AwardItem,
  VolunteeringItem,
  PublicationItem,
  ReferenceItem,
  CustomItem,
  HeaderData,
} from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import { parseMdLines, tokenizeMd } from "@/lib/utils/text";
import { TemplateCtx } from "@/lib/pdf/templateCtx";
import { BsIcon } from "@/lib/icons/BsIcon";
import { DEFAULT_CONTACT_ICONS } from "@/lib/icons/bootstrapIcons";

function ContactItem({
  iconName,
  value,
  ctx,
  textColorOverride,
}: {
  iconName?: string;
  value: string;
  ctx: TemplateCtx;
  textColorOverride?: string;
}) {
  const { colors, s, pt } = ctx;
  const isBlue = s.linkBlue;
  const isUnderline = s.linkUnderline;
  const showIcons = s.contactIcons;
  const iconStyle = s.contactIconStyle || "none";

  const defaultText = s.themeColorStyle === "advanced" ? colors.background : colors.text;
  const finalTextColor = isBlue ? "#2563eb" : (textColorOverride || defaultText);
  const finalIconColor = isBlue ? "#2563eb" : (s.applyAccentHeaderIcons ? (s.themeColorStyle === "advanced" ? colors.background : colors.accent) : finalTextColor);

  return (
    <div className="flex items-center whitespace-nowrap group gap-[6px]">
      {showIcons && iconName && (
        <div
          className={cn(
            "flex items-center justify-center shrink-0",
            iconStyle === "circle-filled" && "rounded-full",
            iconStyle === "rounded-filled" && "rounded-[3px]",
            iconStyle === "square-filled" && "rounded-none",
            iconStyle === "circle-outline" &&
              "rounded-full border border-current",
            iconStyle === "rounded-outline" &&
              "rounded-[3px] border border-current",
            iconStyle === "square-outline" &&
              "rounded-none border border-current",
            iconStyle.includes("filled")
              ? "size-[18px]"
              : iconStyle.includes("outline")
                ? "size-[18px]"
                : "",
          )}
          style={{
            color: finalIconColor,
            backgroundColor: iconStyle.includes("filled")
              ? finalIconColor
              : "transparent",
          }}
        >
          <BsIcon
            name={iconName}
            size={iconStyle === "none" ? 12 : 10}
            className={cn(
              "shrink-0",
              iconStyle.includes("filled") ? "text-white" : "",
            )}
          />
        </div>
      )}
      <span
        className={cn(
          "text-muted-foreground print:text-black transition-all",
          isBlue && "text-blue-600",
          isUnderline && "border-b border-current/30 hover:border-current",
        )}
        style={{
          fontSize: pt(ctx.base * 0.85),
          color: finalTextColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ContactLine({
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
  const align = s.headerAlignment;
  const textAlign = alignOverride || s.detailsTextAlignment || align;
  const isCenter = textAlign === "center";
  const isRight = textAlign === "right";
  const gapX = s.detailsSpacing === "comfortable" ? "gap-x-5" : "gap-x-3";
  const delimiter = s.headerArrangement;

  // Grid Layout
  if (arrangement === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-y-2 w-full",
          isCenter
            ? "mx-auto w-fit gap-x-10"
            : isRight
              ? "gap-x-10 justify-items-end"
              : "gap-x-10 justify-items-start",
        )}
      >
        {parts.map((p, i) => (
          <ContactItem
            key={i}
            value={p.val!}
            iconName={DEFAULT_CONTACT_ICONS[p.key]}
            ctx={ctx}
            textColorOverride={textColorOverride}
          />

        ))}
      </div>
    );
  }

  // Floating Row / Stack
  const hasVisibleDelimiter = delimiter === "bullet" || delimiter === "verticalBar";
  const horizontalGap = s.detailsSpacing === "comfortable" ? "12pt" : "8pt";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-y-1 w-full",
        arrangement === "column" ? "flex-col" : "flex-row items-center",
        arrangement === "wrap" &&
          (isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"),
        arrangement === "column" &&
          (isCenter ? "items-center" : isRight ? "items-end" : "items-start"),
      )}
      style={{
        columnGap: !hasVisibleDelimiter ? horizontalGap : 0
      }}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              "flex items-center",
              arrangement === "column" && "w-full",
              arrangement === "column" && (isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"),
            )}
          >
            <ContactItem
              value={p.val!}
              iconName={DEFAULT_CONTACT_ICONS[p.key]}
              ctx={ctx}
              textColorOverride={textColorOverride}
            />
          </div>
          {arrangement === "wrap" && i < parts.length - 1 && hasVisibleDelimiter && (
            <span
              className="self-center flex items-center justify-center shrink-0"
              style={{
                fontSize: pt(base * 0.8),
                width: s.detailsSpacing === "comfortable" ? "24pt" : "16pt",
                color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text,
                opacity: 0.3,
              }}
            >
              {delimiter === "bullet" ? "•" : "|"}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
  }


// ─── Section dispatchers ──────────────────────────────────────────────────────

type HeadingFn = (title: string) => React.ReactNode;

export function SectionRenderer({
  section,
  ctx,
  renderHeading,
  isSidebar = false,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  if (!section.visible) return null;
  const props = { section, ctx, renderHeading, isSidebar };
  switch (section.type) {
    case "summary":
      return <SummarySection {...props} />;
    case "experience":
      return <ExperienceSection {...props} />;
    case "education":
      return <EducationSection {...props} />;
    case "skills":
      return <SkillsSection {...props} />;
    case "projects":
      return <ProjectsSection {...props} />;
    case "certifications":
      return <CertificationsSection {...props} />;
    case "languages":
      return <LanguagesSection {...props} />;
    case "awards":
      return <AwardsSection {...props} />;
    case "volunteering":
      return <VolunteeringSection {...props} />;
    case "publications":
      return <PublicationsSection {...props} />;
    case "references":
      return <ReferencesSection {...props} />;
    case "custom":
      return <CustomSection {...props} />;
    default:
      return null;
  }
}

// ─── Entry Component (Shared) ─────────────────────────────────────────────────

function Entry({
  title,
  subtitle,
  location,
  date,
  description,
  ctx,
  isSidebar,
  extraLine,
}: {
  title: string;
  subtitle?: string | React.ReactNode;
  location?: string;
  date?: string;
  description?: string;
  ctx: TemplateCtx;
  isSidebar?: boolean;
  extraLine?: React.ReactNode;
}) {
  const { base, colors, lh, pt, s } = ctx;
  const isCompact = isSidebar || s.entrySpacing < 0.9;

  const titleSizes = { S: 1.0, M: 1.05, L: 1.15 };
  const currentTitleSize = titleSizes[s.titleSize || "M"];

  const layout = isSidebar
    ? "full-width"
    : s.entryLayout || "date-location-right";

  const DateElement = date ? (
    <div className="flex items-center gap-1.5 opacity-80 shrink-0">
      <BsIcon name="calendar" size={10} className="shrink-0" />
      <span style={{ fontSize: pt(base * 0.85), color: s.applyAccentDates ? colors.accent : colors.date, whiteSpace: "nowrap", fontWeight: 500 }}>
        {date}
      </span>
    </div>
  ) : null;

  const LocationElement = location ? (
    <div className="flex items-center gap-1.5 opacity-80 shrink-0">
      <BsIcon name="geo-alt" size={10} className="shrink-0" />
      <span style={{ fontSize: pt(base * 0.85), color: colors.subtitle, whiteSpace: "nowrap", fontWeight: 500 }}>
        {location}
      </span>
    </div>
  ) : null;

  const subStyle: React.CSSProperties = {
    fontSize: pt(base * 0.9),
    color: s.applyAccentEntrySubtitle ? colors.accent : colors.subtitle,
    fontStyle: s.subtitleStyle === "italic" ? "italic" : "normal",
    fontWeight: s.subtitleStyle === "bold" ? "bold" : "normal",
    display: "inline-block",
  };

  const isSameLine = s.subtitlePlacement === "same-line";

  return (
    <div style={{ marginBottom: pt(base * s.entrySpacing * 1.2) }} className="w-full">
      {layout === "date-location-right" && (
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div style={{ fontWeight: s.titleBold ? "bold" : "normal", fontSize: pt(base * currentTitleSize), lineHeight: 1.2, color: colors.text }}>
              {title}
              {subtitle && isSameLine && (
                <span style={{ ...subStyle, marginLeft: "8pt" }}>{subtitle}</span>
              )}
            </div>
            {subtitle && !isSameLine && (
              <div style={{ ...subStyle, marginTop: "1pt" }}>
                {subtitle}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
            {DateElement}
            {LocationElement}
          </div>
        </div>
      )}

      {layout === "date-location-left" && (
        <div className="flex justify-between items-start gap-4 flex-row-reverse">
          <div className="flex-1 min-w-0 text-right">
            <div style={{ fontWeight: s.titleBold ? "bold" : "normal", fontSize: pt(base * currentTitleSize), lineHeight: 1.2, color: colors.text }}>
              {title}
              {subtitle && isSameLine && (
                <span style={{ ...subStyle, marginLeft: "8pt" }}>{subtitle}</span>
              )}
            </div>
            {subtitle && !isSameLine && (
              <div style={{ ...subStyle, marginTop: "1pt" }}>
                {subtitle}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-1 shrink-0 pt-1">
            {DateElement}
            {LocationElement}
          </div>
        </div>
      )}

      {layout === "date-content-location" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4 flex-wrap">
            <div style={{ fontWeight: s.titleBold ? "bold" : "normal", fontSize: pt(base * currentTitleSize), lineHeight: 1.2, color: colors.text }}>
              {title}
              {subtitle && isSameLine && (
                <span style={{ ...subStyle, marginLeft: "8pt" }}>{subtitle}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {DateElement}
              {LocationElement}
            </div>
          </div>
          {subtitle && !isSameLine && (
            <div style={{ ...subStyle }}>
              {subtitle}
            </div>
          )}
        </div>
      )}

      {layout === "full-width" && (
        <div className="flex flex-col gap-1">
          <div style={{ fontWeight: s.titleBold ? "bold" : "normal", fontSize: pt(base * currentTitleSize), lineHeight: 1.2, color: colors.text }}>
            {title}
            {subtitle && isSameLine && (
              <span style={{ ...subStyle, marginLeft: "8pt" }}>{subtitle}</span>
            )}
          </div>
          {subtitle && !isSameLine && (
            <div style={{ ...subStyle }}>
              {subtitle}
            </div>
          )}
          {!isSidebar && (
            <div className="flex items-center gap-4 mt-0.5">
              {DateElement}
              {LocationElement}
            </div>
          )}
        </div>
      )}

      {extraLine}
      {description && (
        <div
          style={{
            fontSize: pt(base * 0.92),
            lineHeight: lh,
            marginTop: pt(base * (isCompact ? 0.2 : 0.4)),
            color: colors.text,
            marginLeft: s.indentBody ? "12pt" : 0,
          }}
        >
          {renderMd(description, ctx)}
        </div>
      )}
      {isSidebar && (
        <div className="flex items-center gap-4 mt-1">
          {DateElement}
          {LocationElement}
        </div>
      )}
    </div>
  );
}

// ─── MD Renderer ─────────────────────────────────────────────────────────────

function renderMd(text: string, ctx: TemplateCtx) {
  if (!text) return null;
  const { base, pt } = ctx;
  const lines = parseMdLines(text);

  return lines.map((line, i) => {
    const renderedContent = tokenizeMd(line.content).map((tok, j) => {
      if (tok.bold) return <strong key={j}>{tok.text}</strong>;
      if (tok.italic) return <em key={j}>{tok.text}</em>;
      return <span key={j}>{tok.text}</span>;
    });

    if (line.type === "bullet") {
      return (
        <div
          key={i}
          style={{ 
            display: "flex", 
            gap: "6pt", 
            marginBottom: pt(base * 0.15)
          }}
        >
          <span style={{ flexShrink: 0, color: ctx.s.applyAccentDotsBarsBubbles ? ctx.colors.accent : ctx.colors.text }}>{ctx.bullet}</span>
          <span className="flex-1">{renderedContent}</span>
        </div>
      );
    }
    return (
      <div key={i} style={{ marginBottom: pt(base * 0.35) }}>
        {renderedContent}
      </div>
    );
  });
}


// ─── Individual Renderers ─────────────────────────────────────────────────────

function SummarySection({
  section,
  ctx,
  renderHeading,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
}) {
  const text = (section.items as { text: string })?.text || "";
  if (!text) return null;
  return (
    <div>
      {renderHeading(section.title)}
      <div className="print:text-black">{renderMd(text, ctx)}</div>
    </div>
  );
}

function ExperienceSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as ExperienceItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => {
        const title =
          s.experienceOrder === "employer-title" ? item.company : item.position;
        const sub =
          s.experienceOrder === "employer-title" ? item.position : item.company;
        return (
          <Entry
            key={item.id}
            title={title}
            subtitle={sub || undefined}
            location={item.location}
            date={formatDateRange(
              item.startDate,
              item.endDate,
              item.present,
              s.dateFormat,
            )}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
          />
        );
      })}
    </div>
  );
}

function EducationSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as EducationItem[]) || [];
  if (!items.length) return null;
  const { s, base, colors, pt } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => {
        const degreeStr = [item.degree, item.field].filter(Boolean).join(", ");
        const title =
          s.educationOrder === "school-degree"
            ? item.institution
            : degreeStr || item.institution;
        const sub =
          s.educationOrder === "school-degree" ? degreeStr : item.institution;
        return (
          <Entry
            key={item.id}
            title={title}
            subtitle={sub || undefined}
            location={item.location}
            date={formatDateRange(
              item.startDate,
              item.endDate,
              item.present,
              s.dateFormat,
            )}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
            extraLine={
              item.gpa ? (
                <div
                  style={{
                    fontSize: pt(base * 0.85),
                    color: colors.subtitle,
                    marginBottom: "2pt",
                  }}
                >
                  GPA: {item.gpa}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}

function SkillsSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as SkillItem[]) || [];
  if (!items.length) return null;
  const { base, lh, colors, s, pt } = ctx;
  const display = s.skillDisplay;

  return (
    <div>
      {renderHeading(section.title)}
      {display === "compact" && (
        <div style={{ fontSize: pt(base), lineHeight: lh, color: colors.text }}>
          {items.map((sk) => sk.name).join(" · ")}
        </div>
      )}
      {display === "grid" &&
        (() => {
          const cols = s.skillColumns ?? 3;
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "4pt",
              }}
            >
              {items.map((sk) => (
                <div
                  key={sk.id}
                  style={{ fontSize: pt(base * 0.9), lineHeight: lh }}
                >
                  • {sk.category ? `${sk.category}: ` : ""}
                  {sk.name}
                </div>
              ))}
            </div>
          );
        })()}
      {display === "level" && (
        <div>
          {items.map((sk) => (
            <div
              key={sk.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2pt",
              }}
            >
              <div style={{ fontSize: pt(base * 0.9), lineHeight: lh }}>
                {sk.category ? `${sk.category}: ` : ""}
                {sk.name}
              </div>
              {sk.level && (
                <div
                  style={{
                    fontSize: pt(base * 0.9),
                    lineHeight: lh,
                    color: colors.subtitle,
                  }}
                >
                  {sk.level}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {display === "bubble" && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((sk) => (
            <span
              key={sk.id}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                backgroundColor: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text,
                color: colors.background,
              }}
            >
              {sk.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as ProjectItem[]) || [];
  if (!items.length) return null;
  const { base, colors, s, pt } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.name}
          subtitle={
            item.url ? (
              <div
                style={{
                  fontSize: pt(base * 0.85),
                  color: s.linkBlue ? "#0066cc" : (s.applyAccentLinkIcons ? colors.accent : colors.text),
                  textDecoration: s.linkUnderline ? "underline" : "none",
                }}
              >                {item.url}
              </div>
            ) : undefined
          }
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}

function CertificationsSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as CertificationItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.name}
          subtitle={item.issuer || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}

function LanguagesSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as LanguageItem[]) || [];
  if (!items.length) return null;
  const { base, colors, lh, pt } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            style={{ fontSize: pt(base * 0.9), lineHeight: lh }}
          >
            {item.language}
            {item.level && (
              <span style={{ color: colors.subtitle }}> · {item.level}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardsSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as AwardItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.title}
          subtitle={item.issuer || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}

function VolunteeringSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as VolunteeringItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.role}
          subtitle={item.organization || undefined}
          date={formatDateRange(
            item.startDate,
            item.endDate,
            item.present,
            s.dateFormat,
          )}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}

function PublicationsSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as PublicationItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.title}
          subtitle={item.publisher || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}

function ReferencesSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as ReferenceItem[]) || [];
  if (!items.length) return null;
  const { base, colors, lh, pt, s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item) => (
          <div key={item.id} className="min-w-0">
            <div
              style={{
                fontWeight: "bold",
                fontSize: pt(base * 0.9),
                lineHeight: 1.4,
              }}
            >
              {item.name}
            </div>
            {item.position && (
              <div
                style={{
                  fontSize: pt(base * 0.85),
                  color: colors.subtitle,
                  lineHeight: lh,
                }}
              >
                {item.position}
              </div>
            )}
            {item.company && (
              <div
                style={{
                  fontSize: pt(base * 0.85),
                  color: colors.subtitle,
                  lineHeight: lh,
                }}
              >
                {item.company}
              </div>
            )}
            {item.email && (
              <div
                style={{
                  fontSize: pt(base * 0.82),
                  color: s.applyAccentLinkIcons ? colors.accent : colors.text,
                  lineHeight: lh,
                }}
              >
                {item.email}
              </div>
            )}
            {item.phone && (
              <div
                style={{
                  fontSize: pt(base * 0.82),
                  color: colors.subtitle,
                  lineHeight: lh,
                }}
              >
                {item.phone}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomSection({
  section,
  ctx,
  renderHeading,
  isSidebar,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  const items = (section.items as CustomItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.title}
          subtitle={item.subtitle || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}
