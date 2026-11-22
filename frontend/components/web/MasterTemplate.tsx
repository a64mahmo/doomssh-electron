import React from "react";
import type { Resume, ResumeSection, ResumeSettings, SectionType, HeaderData } from "@/lib/store/types";
import { buildCtx, sidebarCtx, isSolidSidebar } from "@/lib/pdf/templateCtx";
import { SectionRenderer, ContactLine } from "./sections";
import { SECTION_ICONS } from "@/lib/icons/sectionIcons";
import { cn } from "@/lib/utils";
import { isLight } from "@/lib/pdf/styleUtils";
import { contentWidth, fitNameSize } from "@/lib/pdf/layoutFit";

// Abstract geometric symbols for a minimalist look
const ABSTRACT_ICONS: Record<SectionType, React.ReactNode> = {
  header: (
    <div
      style={{
        width: "60%",
        height: "60%",
        borderRadius: "50%",
        border: "1.5pt solid currentColor",
      }}
    />
  ),
  summary: (
    <div
      style={{
        width: "50%",
        height: "2pt",
        backgroundColor: "currentColor",
        boxShadow: "0 4pt 0 0 currentColor, 0 -4pt 0 0 currentColor",
      }}
    />
  ),
  experience: (
    <div
      style={{
        width: "60%",
        height: "40%",
        border: "1.5pt solid currentColor",
        borderRadius: "1pt",
      }}
    />
  ),
  education: (
    <div
      style={{
        width: "0",
        height: "0",
        borderLeft: "5pt solid transparent",
        borderRight: "5pt solid transparent",
        borderBottom: "8pt solid currentColor",
      }}
    />
  ),
  skills: (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "2pt",
      }}
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            width: "3pt",
            height: "3pt",
            backgroundColor: "currentColor",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  ),
  projects: (
    <div
      style={{
        width: "50%",
        height: "50%",
        transform: "rotate(45deg)",
        border: "1.5pt solid currentColor",
      }}
    />
  ),
  certifications: (
    <div
      style={{
        width: "50%",
        height: "50%",
        borderRadius: "1pt",
        border: "1.5pt solid currentColor",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-2pt",
          right: "-2pt",
          width: "4pt",
          height: "4pt",
          backgroundColor: "currentColor",
          borderRadius: "50%",
        }}
      />
    </div>
  ),
  languages: (
    <div
      style={{
        width: "60%",
        height: "60%",
        border: "1.5pt solid currentColor",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "1pt",
          backgroundColor: "currentColor",
        }}
      />
    </div>
  ),
  awards: (
    <div
      style={{
        width: "0",
        height: "0",
        borderLeft: "5pt solid transparent",
        borderRight: "5pt solid transparent",
        borderTop: "8pt solid currentColor",
        borderRadius: "1pt",
      }}
    />
  ),
  volunteering: (
    <div
      style={{
        width: "50%",
        height: "50%",
        backgroundColor: "currentColor",
        borderRadius: "1pt",
        transform: "rotate(45deg)",
      }}
    />
  ),
  publications: (
    <div
      style={{
        width: "60%",
        height: "60%",
        borderLeft: "2pt solid currentColor",
        borderBottom: "2pt solid currentColor",
      }}
    />
  ),
  references: (
    <div
      style={{
        width: "40%",
        height: "40%",
        border: "2pt solid currentColor",
        borderRight: "none",
        borderBottom: "none",
        borderRadius: "1pt",
      }}
    />
  ),
  custom: (
    <div
      style={{
        width: "50%",
        height: "5pt",
        border: "1.5pt solid currentColor",
        borderRadius: "1pt",
      }}
    />
  ),
};

interface Props {
  /** Live preview only: show a faded "Your Name" when the name is empty. Never in print/PDF. */
  showPlaceholders?: boolean;
  resume: Resume;
  pads?: number[];
  hideFooter?: boolean;
  hideHeader?: boolean;
  isMeasurement?: boolean;
  sectionsOverride?: ResumeSection[];
  /**
   * Rendered as the content of PagedResume's page windows: no page height, no
   * background, sidebar panel, border or footer. The page frames paint those
   * per page instead. The border keeps its width, transparent, so the content
   * sits where it would on a real page.
   */
  paged?: boolean;
}

const SIDEBAR_TYPES = ["skills", "education", "languages", "certifications", "awards", "references"];
const MIX_MAIN_TYPES = ["summary", "experience", "projects", "volunteering", "publications", "custom"];

/** Which visible sections go in the main column and which in the sidebar. */
function splitColumns(resume: Resume, sectionsOverride?: ResumeSection[]) {
  const s = resume.settings;
  const visibleSections =
    sectionsOverride ||
    resume.sections.filter((sec) => sec.visible !== false && sec.type !== "header");
  const mainSections: ResumeSection[] = [];
  const sidebarSections: ResumeSection[] = [];
  if (s.columnLayout === "one") {
    mainSections.push(...visibleSections);
    return { mainSections, sidebarSections };
  }
  visibleSections.forEach((sec) => {
    const assigned = s.sectionColumns?.[sec.id];
    if (assigned === "sidebar") sidebarSections.push(sec);
    else if (assigned === "main") mainSections.push(sec);
    else if (s.sidebarSectionTypes) {
      if (s.sidebarSectionTypes.includes(sec.type)) sidebarSections.push(sec);
      else mainSections.push(sec);
    } else if (s.columnLayout === "mix") {
      if (MIX_MAIN_TYPES.includes(sec.type)) mainSections.push(sec);
      else sidebarSections.push(sec);
    } else if (SIDEBAR_TYPES.includes(sec.type)) sidebarSections.push(sec);
    else mainSections.push(sec);
  });
  return { mainSections, sidebarSections };
}

/**
 * Where the header goes. One column (or no sidebar content): across the top.
 * Two columns: at the head of one column, never across both, so the columns
 * and the sidebar panel run the full height of the page. A saved "top" from
 * before this rule reads as the main column.
 */
export function resolveHeaderPlacement(
  s: Pick<ResumeSettings, "columnLayout" | "headerLayout">,
  hasSidebar: boolean,
): "top" | "main" | "sidebar" {
  if (s.columnLayout === "one" || !hasSidebar) return "top";
  return s.headerLayout === "sidebar" ? "sidebar" : "main";
}

/** The fill behind the sidebar column: a solid colour, a tint, or "transparent". */
function sidebarFillFor(ctx: ReturnType<typeof buildCtx>) {
  const { s, colors } = ctx;
  const sidebarThemed =
    s.sidebarTheme === "accent" ||
    (s.sidebarTheme === "custom" && !!s.sidebarBackgroundColor);
  return isSolidSidebar(s)
    ? colors.sidebarBg
    : sidebarThemed
    ? (isLight(colors.sidebarBg) ? colors.sidebarBg : `${colors.sidebarBg}1a`)
    : (s.applyAccentDotsBarsBubbles ? `${colors.accent}0a` : "transparent");
}

function pageBackground(ctx: ReturnType<typeof buildCtx>) {
  const { s, colors } = ctx;
  return s.themeColorStyle === 'advanced' && s.backgroundColor === '#ffffff' ? `${colors.accent}05` : colors.background;
}

/**
 * What every printed page paints regardless of its content: the background,
 * the sidebar panel reaching the paper edges, and the border theme's frame.
 */
export function getPageChrome(resume: Resume) {
  const ctx = buildCtx(resume.settings);
  const { s, colors } = ctx;
  const padH = `${s.marginHorizontal}mm`;
  let sidebarPanel: React.CSSProperties | null = null;
  if (resume.kind !== 'coverLetter' && s.columnLayout !== "one") {
    const { sidebarSections } = splitColumns(resume);
    const fill = sidebarFillFor(ctx);
    const sidebarWidth = s.columnWidthMode === "manual" ? s.columnWidth : 32;
    if (sidebarSections.length > 0 && fill !== "transparent") {
      sidebarPanel = {
        position: "absolute",
        top: 0,
        bottom: 0,
        [s.columnReverse ? "left" : "right"]: 0,
        // The template's width (216mm Letter) is a touch wider than the paper,
        // so the panel is sized against it, as the in-flow panel is.
        width: `calc((${s.paperSize === "a4" ? "210mm" : "216mm"} - ${padH} - ${padH}) * ${sidebarWidth / 100} + ${padH})`,
        backgroundColor: fill,
      };
    }
  }
  return {
    background: pageBackground(ctx),
    sidebarPanel,
    borderColor: s.themeColorStyle === 'border' ? colors.accent : null,
  };
}

function SectionHeading({
  title,
  type,
  ctx,
  isSidebar = false,
  isFirst = false,
}: {
  title: string;
  type: SectionType;
  ctx: ReturnType<typeof buildCtx>;
  isSidebar?: boolean;
  isFirst?: boolean;
}) {
  const { colors, hSize, hCap, gap, pt, s } = ctx;
  if (!s.showSectionLabels)
    return <div style={{ marginTop: isFirst ? 0 : gap }} />;

  const style = s.sectionHeadingStyle || "underline";
  const thickness = `${s.sectionHeadingLineThickness || 1.5}pt`;
  const sectionMarginTop = isFirst
    ? 0
    : pt(Number(gap.replace("pt", "")) * (s.sectionSpacing ?? 1.0));

  const headingColor = s.applyAccentHeadings ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);
  const lineColor = s.applyAccentHeadingLine ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);

  const containerStyle: React.CSSProperties = {
    fontSize: pt(hSize),
    fontWeight: "bold",
    color: headingColor,
    textTransform: hCap ?? "uppercase",
    letterSpacing: "0.06em",
    lineHeight: 1.1,
    marginTop: sectionMarginTop,
    marginBottom: "8pt",
    display: "flex",
    alignItems: "center",
    gap: "8pt",
    justifyContent: s.sectionHeadingAlign === "center" ? "center" : undefined,
    position: "relative",
  };

  if (style === "underline") {
    containerStyle.borderBottom = `${thickness} solid ${lineColor}`;
    containerStyle.paddingBottom = "3pt";
  } else if (style === "overline") {
    containerStyle.borderTop = `${thickness} solid ${lineColor}`;
    containerStyle.paddingTop = "3pt";
  } else if (style === "top-bottom") {
    containerStyle.borderTop = `${thickness} solid ${lineColor}`;
    containerStyle.borderBottom = `${thickness} solid ${lineColor}`;
    containerStyle.paddingTop = "3pt";
    containerStyle.paddingBottom = "3pt";
  } else if (style === "box") {
    containerStyle.border = `${thickness} solid ${lineColor}`;
    containerStyle.padding = "4pt 8pt";
    containerStyle.borderRadius = "2pt";
  } else if (style === "background") {
    containerStyle.backgroundColor = lineColor + "10";
    containerStyle.padding = "4pt 8pt";
    containerStyle.borderRadius = "2pt";
    containerStyle.color = headingColor;
  } else if (style === "left-bar") {
    containerStyle.borderLeft = `3pt solid ${lineColor}`;
    containerStyle.paddingLeft = "8pt";
  }

  const showIcon = s.sectionHeadingIcon !== "none";
  const iconStyle = s.sectionHeadingIconStyle || "lucide";
  const iconSizeMultiplier = s.sectionHeadingIconSize || 1.0;

  return (
    <div data-section-heading style={containerStyle}>
      {showIcon &&
        (() => {
          const mode = s.sectionHeadingIcon;
          const isKnockout = mode === "knockout";
          // Knockout renders the glyph at 75% inside a filled chip, so it needs a
          // bigger floor than the inline styles or it turns into a dark smudge.
          const boxSize = Math.max(isKnockout ? 9 : 7, hSize * 1.1 * iconSizeMultiplier);
          const knockoutText = isLight(headingColor) ? '#1a1a1a' : colors.background;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: pt(isKnockout ? boxSize * 1.4 : boxSize),
                height: pt(isKnockout ? boxSize * 1.4 : boxSize),
                borderRadius: isKnockout ? "4pt" : 0,
                backgroundColor: isKnockout ? headingColor : "transparent",
                color: isKnockout ? knockoutText : headingColor,
                border: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconStyle === "lucide"
                  ? React.createElement(
                      SECTION_ICONS[type].lucide,
                      {
                        size: pt(boxSize * 0.68),
                        strokeWidth: mode === "filled" ? 1.2 : 1.5,
                        fill: mode === "filled" ? "currentColor" : "none",
                        stroke:
                          mode === "filled"
                            ? knockoutText
                            : "currentColor",
                      },
                    )
                  : ABSTRACT_ICONS[type] || null}
              </div>
            </div>
          );
        })()}
      <span>{title}</span>
    </div>
  );
}

function CoverLetterBody({ resume, ctx }: { resume: Resume; ctx: ReturnType<typeof buildCtx> }) {
  const { colors, base, lh, pt, s } = ctx;
  const cl = resume.coverLetter;
  // Skip the automatic sign-off when the
  // letter already closes with one.
  const hasSignOff = /(^|\n)\s*(sincerely|best regards|kind regards|warm regards|regards|best|respectfully|yours (truly|sincerely|faithfully)),?\s*$/i.test(cl?.body || '');
  if (!cl || !cl.body) return null;

  const paraSpacing = s.clParagraphSpacing ?? 1.0;
  const paragraphMargin = `${(4 * paraSpacing).toFixed(2)}mm`;
  const bodyAlign = (s.clBodyAlign ?? 'left') as 'left' | 'justify';
  const indent = s.clFirstLineIndent ? '1.5em' : 0;

  const blocks = cl.body.split(/\n{2,}/);

  return (
    <div style={{ color: colors.text, display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Date */}
      {(s.clShowDate ?? true) && cl.date && (
        <div style={{
          marginBottom: '20pt',
          textAlign: s.clDatePosition === 'right' ? 'right' : 'left',
          color: s.applyAccentDates ? colors.accent : colors.text,
          opacity: s.applyAccentDates ? 1 : 0.7,
          fontWeight: 500,
        }}>
          {new Date(cl.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}

      {/* Recipient */}
      {(s.clShowRecipient ?? true) && (cl.recipient.hrName || cl.recipient.company || cl.recipient.address) && (
        <div style={{ marginBottom: '30pt' }}>
          {cl.recipient.hrName && (
            <div style={{
              fontWeight: 'bold',
              color: s.applyAccentName ? colors.accent : colors.text,
            }}>
              {cl.recipient.hrName}
            </div>
          )}
          {cl.recipient.company && (
            <div style={{
              fontWeight: 'bold',
              color: s.applyAccentEntrySubtitle ? colors.accent : colors.text,
              opacity: s.applyAccentEntrySubtitle ? 1 : 0.9,
            }}>
              {cl.recipient.company}
            </div>
          )}
          {cl.recipient.address && (
            <div style={{ 
              color: colors.subtitle, 
              opacity: 0.95,
              whiteSpace: 'pre-line'
            }}>
              {cl.recipient.address}
            </div>
          )}
        </div>
      )}

      {/* Body Content */}
      <div style={{ textAlign: bodyAlign }}>
        {blocks.map((block, i) => {
          const lines = block.split('\n');
          const isList = lines.every(l => l.trim().startsWith('•') || l.trim().startsWith('- '));

          if (isList) {
            return (
              <ul key={i} style={{ 
                marginBottom: paragraphMargin, 
                paddingLeft: '1.2em',
                listStyleType: 'disc'
              }}>
                {lines.map((line, j) => (
                  <li key={j} style={{ marginBottom: '2pt' }}>
                    {line.replace(/^[•-]\s*/, '')}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={i} style={{ 
              marginBottom: paragraphMargin,
              textIndent: indent,
              lineHeight: lh,
            }}>
              {block}
            </p>
          );
        })}
      </div>

      {/* Signature */}
      <div style={{
        marginTop: '40pt',
        textAlign: s.clSignaturePosition === 'right' ? 'right' : 'left',
      }}>
        {(s.clShowAutoSignOff ?? true) && !hasSignOff && (
          <div style={{ color: colors.text, opacity: 0.8, marginBottom: '30pt' }}>Sincerely,</div>
        )}

        {s.clShowSignatureLine && (
          <div style={{
            width: '150pt',
            borderTop: `0.5pt solid ${s.applyAccentHeadingLine ? colors.accent : colors.text}`,
            opacity: s.applyAccentHeadingLine ? 1 : 0.2,
            marginLeft: s.clSignaturePosition === 'right' ? 'auto' : 0,
            marginBottom: '8pt',
          }} />
        )}

        <div style={{ marginTop: s.clShowSignatureLine ? '8pt' : '20pt' }}>
          {cl.signature.image && (
            <div style={{ 
              marginBottom: '10pt',
              textAlign: s.clSignaturePosition === 'right' ? 'right' : 'left' 
            }}>
              <img 
                src={cl.signature.image} 
                alt="Signature" 
                style={{ 
                  height: s.clSignatureSize === 'sm' ? '30pt' : s.clSignatureSize === 'lg' ? '70pt' : '50pt',
                  maxWidth: '200pt',
                  objectFit: 'contain'
                }} 
              />
            </div>
          )}
          {cl.signature.fullName && (
            <div style={{
              fontWeight: 'bold',
              fontSize: pt(12),
              color: s.applyAccentName ? colors.accent : colors.text,
            }}>
              {cl.signature.fullName}
            </div>
          )}
          {(cl.signature.place || cl.signature.date) && (
            <div style={{ fontSize: pt(9), color: colors.subtitle, opacity: 0.8, marginTop: '2pt' }}>
              {cl.signature.place}{cl.signature.place && cl.signature.date ? ', ' : ''}
              {cl.signature.date && new Date(cl.signature.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MasterTemplate({
  resume,
  pads,
  hideFooter,
  hideHeader,
  isMeasurement,
  sectionsOverride,
  showPlaceholders,
  paged,
}: Props) {
  const ctx = buildCtx(resume.settings);
  const {
    colors,
    base,
    lh,
    gap,
    hSize,
    hCap,
    nameSize,
    font,
    fontHref,
    s,
    pt,
  } = ctx;

  const header = resume.sections.find((sec) => sec.type === "header");
  const h = header?.items as HeaderData | undefined;
  const nameText = h?.fullName || (showPlaceholders ? <span style={{ opacity: 0.35 }}>Your Name</span> : null);

  const { mainSections, sidebarSections } = splitColumns(resume, sectionsOverride);
  // Paged content: the page frames own the page height, fill, panel, border and footer.
  if (paged) hideFooter = true;
  const pageMinHeight = isMeasurement || paged ? "auto" : s.paperSize === "a4" ? "297mm" : "279mm";
  const rootBackground = paged ? "transparent" : pageBackground(ctx);
  const rootBorder = s.themeColorStyle === 'border' ? `12pt solid ${paged ? 'transparent' : colors.accent}` : 'none';

  const padH = `${s.marginHorizontal}mm`;
  const padV = `${s.marginVertical}mm`;

  const sidebarWidth = s.columnWidthMode === "manual" ? s.columnWidth : 32;
  const mainWidth = 100 - sidebarWidth;

  // Honour sidebarTheme, tinting a dark
  // pick instead of filling it so the sidebar text stays legible. Must resolve
  // to a real colour or the literal "transparent": the old `${tint}05` form
  // produced "transparent05", which only worked because it was invalid CSS.
  // With two columns the header never spans both: it heads one column, so
  // both columns (and the sidebar panel) run the full height of the page.
  // Details always stack in the sidebar.
  const hasSidebarColumn = s.columnLayout !== "one" && sidebarSections.length > 0;
  const headerPlacement = resolveHeaderPlacement(s, sidebarSections.length > 0);
  const headerInSidebar = headerPlacement === "sidebar";
  const headerInMain = headerPlacement === "main";

  // Contact details always stack in the narrow sidebar column.
  const sCtx = sidebarCtx(ctx);
  const sidebarHeaderCtx = { ...sCtx, s: { ...s, detailsArrangement: "column" as const, detailsPosition: "below" as const } };

  const sidebarFill = sidebarFillFor(ctx);
  // Only a header across a one-column page bleeds to both edges.
  const bleedHeader = !headerInMain && s.themeColorStyle === "advanced";
  const headerBand = s.themeColorStyle === "advanced";
  // Shrink a name whose longest word
  // would otherwise run past its column.
  const headerColumnWidth = headerInMain ? contentWidth(s) * (mainWidth / 100) - 20 : contentWidth(s);
  const headerNameWidth = headerColumnWidth * (s.detailsPosition === "beside" && s.headerAlignment !== "center" ? 0.5 : 1);
  // The photo shares the name's row unless it sits above or below a centred name.
  const photoReserve = s.photoEnabled && h?.photo &&
    (s.headerAlignment !== "center" || s.photoPosition === "beside")
    ? ({ XS: 28, S: 36, M: 48, L: 64, XL: 80 }[s.photoSize] || 48) + (s.photoGap || 12)
    : 0;
  const fittedNameSize = fitNameSize(h?.fullName || "Your Name", nameSize, headerNameWidth - photoReserve);
  const sidebarNameSize = fitNameSize(h?.fullName || "Your Name", Math.min(nameSize, 17), contentWidth(s) * (sidebarWidth / 100) - 20);

  if (resume.kind === 'coverLetter') {
    return (
      <div
        data-resume-page
        style={{
          width: s.paperSize === "a4" ? "210mm" : "216mm",
          minHeight: pageMinHeight,
          fontFamily: font,
          fontSize: pt(base),
          lineHeight: lh,
          boxSizing: "border-box",
          backgroundColor: rootBackground,
          color: colors.text,
          display: "flex",
          flexDirection: "column",
          paddingLeft: padH,
          paddingRight: padH,
          paddingTop: padV,
          paddingBottom: padV,
          border: rootBorder,
          position: 'relative',
        }}
      >
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        {!hideHeader && (s.clShowLetterhead ?? true) && (
          <div style={{ marginBottom: '30pt' }}>
            {/* Header logic reused from MasterTemplate's main block */}
            {(() => {
              const align = s.headerAlignment;
              const showPhoto = s.photoEnabled && h?.photo;
              const sizeMap = { XS: 28, S: 36, M: 48, L: 64, XL: 80 };
              const photoPx = sizeMap[s.photoSize] || 48;
              const photoBr = s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? "6pt" : "0";
              const photoPos = s.photoPosition;
              const isRight = align === "right";
              const isCenter = align === "center";
              const photoGap = s.photoGap || 12;

              const isLightBg = s.themeColorStyle === 'advanced' && isLight(colors.accent);
              const advancedTextColor = isLightBg ? '#1a1a1a' : '#ffffff';

              const borderWidth = s.photoBorderStyle === 'none' ? 0 
                : s.photoBorderStyle === 'thin' ? 0.5 
                : s.photoBorderStyle === 'medium' ? 1 
                : 1.5;

              const photoEl = showPhoto ? (
                <img
                  src={h!.photo}
                  alt={h?.fullName || "Profile"}
                  style={{
                    width: `${photoPx}pt`,
                    height: `${photoPx}pt`,
                    borderRadius: photoBr,
                    objectFit: "cover",
                    flexShrink: 0,
                    borderWidth: `${borderWidth}pt`,
                    borderColor: s.photoBorderColor || '#e5e7eb',
                    borderStyle: 'solid',
                  }}
                />
              ) : null;

              const nameEl = (
                <div className={cn("flex flex-col", isCenter ? "items-center text-center" : isRight ? "items-end text-right" : "items-start text-left", s.jobTitlePlacement === "inline" && cn("flex-row flex-wrap items-baseline gap-x-[0.5em]", isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"))}>
                  <h1 className="m-0 font-bold tracking-tight print:text-black" style={{ fontSize: pt(fittedNameSize), color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text), lineHeight: 1.1 }}>
                    {nameText}
                  </h1>
                  {h?.jobTitle && (
                    <div className={cn("font-medium print:text-black print:opacity-100", s.jobTitlePlacement !== "inline" && "mt-1", !s.jobTitleStyle || s.jobTitleStyle === "caps" ? "uppercase tracking-[0.2em] opacity-70" : "opacity-90", s.jobTitleStyle === "italic" && "italic")} style={{ fontSize: pt(base * (!s.jobTitleStyle || s.jobTitleStyle === "caps" ? 1.1 : s.jobTitlePlacement === "inline" ? 1.9 : 1.3)), color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentJobTitle ? colors.accent : colors.text) }}>
                      {h.jobTitle}
                    </div>
                  )}
                </div>
              );

              const contactTextColor = s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text);
              if (isCenter) {
                return (
                  <div className="flex flex-col items-center text-center pb-1 mb-1 w-full" style={{ color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text }}>
                    <div className="flex items-center justify-center max-w-full" style={{ gap: photoPos === "beside" && photoEl ? `${photoGap}pt` : 0 }}>
                      {photoPos === "beside" && photoEl}
                      <div className={cn("flex flex-col min-w-0", photoPos === "beside" && photoEl ? "items-start text-left [&>div]:items-start [&>div]:text-left" : "items-center")}>
                        {photoPos === "top" && photoEl && <div style={{ marginBottom: `${photoGap / 2}pt` }}>{photoEl}</div>}
                        {nameEl}
                        {photoPos === "bottom" && photoEl && <div style={{ marginTop: `${photoGap / 2}pt` }}>{photoEl}</div>}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-center w-full">
                      <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                    </div>
                  </div>
                );
              }
              const isBeside = s.detailsPosition === "beside";
              const photoAlignment = s.photoAlignment || 'left';
              const photoVAlign = s.photoVerticalAlign || 'center';
              const vAlignClass = photoVAlign === 'top' ? 'items-start' : photoVAlign === 'bottom' ? 'items-end' : 'items-center';
              if (isBeside) {
                const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
                return (
                  <div className="grid grid-cols-2 pb-1 mb-1 gap-x-6 w-full" style={{ color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text }}>
                    <div className={cn("flex min-w-0 gap-x-6", vAlignClass, isRight ? "justify-end" : "justify-start", photoOnRight ? "flex-row-reverse" : "flex-row")}>
                      {!photoOnRight && photoEl}
                      <div className={cn("flex flex-col", isRight ? "items-end text-right" : "items-start text-left")}>{nameEl}</div>
                      {photoOnRight && photoEl}
                    </div>
                    <div className={cn("flex min-w-0", vAlignClass, s.detailsTextAlignment === "left" ? "justify-start" : s.detailsTextAlignment === "right" ? "justify-end" : "justify-center")}>
                      <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                    </div>
                  </div>
                );
              }
              const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
              return (
                <div className={cn("flex pb-1 mb-1 w-full", photoOnRight ? "flex-row-reverse" : "flex-row", vAlignClass)} style={{ color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text }}>
                  {photoEl && <div style={{ marginRight: !photoOnRight ? `${photoGap}pt` : 0, marginLeft: photoOnRight ? `${photoGap}pt` : 0 }}>{photoEl}</div>}
                  <div className={cn("flex flex-col flex-1 min-w-0 gap-y-2", isRight ? "items-end text-right" : "items-start text-left")}>
                    {nameEl}
                    <div className={cn("w-full", s.detailsTextAlignment === "right" ? "text-right flex justify-end" : s.detailsTextAlignment === "center" ? "text-center flex justify-center" : "text-left flex justify-start")}>
                      <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        <CoverLetterBody resume={resume} ctx={ctx} />
        {!hideFooter && <TemplateFooter resume={resume} />}
      </div>
    );
  }

  // A band header (themeColorStyle "advanced") reaches the paper edges: both
  // sides and the top across a one-column page; heading the main column, the
  // outer side and the top, and inward to the column divider.
  const mainOnLeft = !s.columnReverse;
  const headerBleed: React.CSSProperties = !headerBand
    ? {}
    : headerInMain
      ? {
          marginTop: `calc(-${padV} - 5pt)`,
          paddingTop: padV,
          [mainOnLeft ? "marginLeft" : "marginRight"]: `-${padH}`,
          [mainOnLeft ? "paddingLeft" : "paddingRight"]: padH,
          [mainOnLeft ? "marginRight" : "marginLeft"]: "-20pt",
          [mainOnLeft ? "paddingRight" : "paddingLeft"]: "20pt",
        }
      : bleedHeader
        ? { marginLeft: `-${padH}`, marginRight: `-${padH}`, marginTop: `-${padV}`, paddingLeft: padH, paddingRight: padH, paddingTop: padV }
        : {};

  const headerEl = !hideHeader && !headerInSidebar ? (
      <div
        style={{
          backgroundColor: headerBand ? colors.accent : 'transparent',
          color: headerBand ? (isLight(colors.accent) ? '#1a1a1a' : '#ffffff') : 'inherit',
          ...headerBleed,
          paddingBottom: headerBand ? "15pt" : 0,
          marginBottom: headerBand ? "15pt" : headerInMain ? "5pt" : 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {(() => {
          const align = s.headerAlignment;
          const showPhoto = s.photoEnabled && h?.photo;
          const sizeMap = { XS: 28, S: 36, M: 48, L: 64, XL: 80 };
          const photoPx = sizeMap[s.photoSize] || 48;
          const photoBr = s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? "6pt" : "0";
          const photoPos = s.photoPosition;
          const isRight = align === "right";
          const isCenter = align === "center";
          const photoGap = s.photoGap || 12;

          const isLightBg = s.themeColorStyle === 'advanced' && isLight(colors.accent);
          const advancedTextColor = isLightBg ? '#1a1a1a' : '#ffffff';

          const borderWidth = s.photoBorderStyle === 'none' ? 0 
            : s.photoBorderStyle === 'thin' ? 0.5 
            : s.photoBorderStyle === 'medium' ? 1 
            : 1.5;

          const photoEl = showPhoto ? (
            <img
              src={h!.photo}
              alt={h?.fullName || "Profile"}
              style={{
                width: `${photoPx}pt`,
                height: `${photoPx}pt`,
                borderRadius: photoBr,
                objectFit: "cover",
                flexShrink: 0,
                borderWidth: `${borderWidth}pt`,
                borderColor: s.photoBorderColor || '#e5e7eb',
                borderStyle: 'solid',
              }}
            />
          ) : null;

          const nameEl = (
            <div
              className={cn(
                "flex flex-col",
                isCenter
                  ? "items-center text-center"
                  : isRight
                    ? "items-end text-right"
                    : "items-start text-left",
                // Job title on the name's line, sharing its baseline.
                s.jobTitlePlacement === "inline" &&
                  cn("flex-row flex-wrap items-baseline gap-x-[0.5em]", isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"),
              )}
            >
              <h1
                className="m-0 font-bold tracking-tight print:text-black"
                style={{
                  fontSize: pt(fittedNameSize),
                  color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text),
                  lineHeight: 1.1,
                }}
              >
                {nameText}
              </h1>
              {h?.jobTitle && (
                <div
                  className={cn("font-medium print:text-black print:opacity-100", s.jobTitlePlacement !== "inline" && "mt-1", !s.jobTitleStyle || s.jobTitleStyle === "caps" ? "uppercase tracking-[0.2em] opacity-70" : "opacity-90", s.jobTitleStyle === "italic" && "italic")}
                  style={{ 
                    fontSize: pt(base * (!s.jobTitleStyle || s.jobTitleStyle === "caps" ? 1.1 : s.jobTitlePlacement === "inline" ? 1.9 : 1.3)),
                    color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentJobTitle ? colors.accent : colors.text),
                  }}
                >
                  {h.jobTitle}
                </div>
              )}
            </div>
          );

          const contactTextColor = s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text);
          const contactEl = h ? <ContactLine h={h} ctx={ctx} textColorOverride={contactTextColor} /> : null;

          // Center Alignment (Absolute centering for Name)
          if (isCenter) {
            return (
              <div
                data-header
                className="flex flex-col items-center text-center pb-1 mb-1 w-full"
                style={{
                  color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text,
                }}
              >
                {/* Identity Unit (Photo + Name) */}
                {/* Beside a centred name the
                    photo and name form one centred group, in flow so a long name
                    never runs underneath the photo. */}
                <div className="flex items-center justify-center max-w-full" style={{ gap: photoPos === "beside" && photoEl ? `${photoGap}pt` : 0 }}>
                  {photoPos === "beside" && photoEl}

                  <div className={cn("flex flex-col min-w-0", photoPos === "beside" && photoEl ? "items-start text-left [&>div]:items-start [&>div]:text-left" : "items-center")}>
                    {photoPos === "top" && photoEl && (
                      <div style={{ marginBottom: `${photoGap / 2}pt` }}>{photoEl}</div>
                    )}
                    {nameEl}
                    {photoPos === "bottom" && photoEl && (
                      <div style={{ marginTop: `${photoGap / 2}pt` }}>{photoEl}</div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex justify-center w-full">
                  <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                </div>
              </div>
            );
          }

          // Left / Right Alignment (Structural Split)
          const isBeside = s.detailsPosition === "beside";

          const photoAlignment = s.photoAlignment || 'left';
          const photoVAlign = s.photoVerticalAlign || 'center';
          const vAlignClass = photoVAlign === 'top' ? 'items-start' : photoVAlign === 'bottom' ? 'items-end' : 'items-center';

          if (isBeside) {
            const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
            return (
              <div
                data-header
                className={cn(
                  "grid grid-cols-2 pb-1 mb-1 gap-x-6 w-full",
                )}
                style={{
                  color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text,
                }}
              >
                {/* Side A: Identity (Left-aligned if on left, Right-aligned if on right) */}
                <div
                  className={cn(
                    "flex min-w-0 gap-x-6",
                    vAlignClass,
                    isRight ? "justify-end" : "justify-start",
                    photoOnRight ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {!photoOnRight && photoEl}
                  <div className={cn(
                    "flex flex-col",
                    isRight ? "items-end text-right" : "items-start text-left",
                  )}>
                    {nameEl}
                  </div>
                  {photoOnRight && photoEl}
                </div>

                {/* Side B: Contacts (Respects detailsTextAlignment) */}
                <div
                  className={cn(
                    "flex min-w-0",
                    vAlignClass,
                    s.detailsTextAlignment === "left"
                      ? "justify-start"
                      : s.detailsTextAlignment === "right"
                        ? "justify-end"
                        : "justify-center",
                  )}
                >
                  <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                </div>
              </div>
            );
          }

          // Below Arrangement
          const photoOnRight = photoAlignment === 'right' || (photoAlignment === 'center' && isRight);
          return (
            <div
              data-header
              className={cn(
                "flex pb-1 mb-1 w-full",
                photoOnRight ? "flex-row-reverse" : "flex-row",
                vAlignClass,
              )}
              style={{
                color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text,
              }}
            >
              {/* Photo Side */}
              {photoEl && (
                <div style={{ 
                  marginRight: !photoOnRight ? `${photoGap}pt` : 0,
                  marginLeft: photoOnRight ? `${photoGap}pt` : 0,
                }}>{photoEl}</div>
              )}

              {/* Text Side (Identity + Contacts Stack) */}
              <div
                className={cn(
                  "flex flex-col flex-1 min-w-0 gap-y-2",
                  isRight ? "items-end text-right" : "items-start text-left",
                )}
              >
                {nameEl}
                <div
                  className={cn(
                    "w-full",
                    s.detailsTextAlignment === "right"
                      ? "text-right flex justify-end"
                      : s.detailsTextAlignment === "center"
                        ? "text-center flex justify-center"
                        : "text-left flex justify-start",
                  )}
                >
                  <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} availableWidth={headerNameWidth - (photoEl ? photoPx + photoGap : 0)} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
  ) : null;

  return (
    <div
      data-resume-page
      style={{
        width: s.paperSize === "a4" ? "210mm" : "216mm",
        minHeight: pageMinHeight,
        fontFamily: font,
        fontSize: pt(base),
        lineHeight: lh,
        // A token longer than its column (a URL, a long compound name) would
        // otherwise escape the page. CSS can break it without inserting a
        // hyphen.
        overflowWrap: "anywhere",
        boxSizing: "border-box",
        backgroundColor: rootBackground,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        paddingLeft: padH,
        paddingRight: padH,
        paddingTop: padV,
        paddingBottom: padV,
        border: rootBorder,
        position: 'relative',
      }}
    >
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      {/* Painted as a page-level layer so
          it reaches the page edges without changing what columnWidth means. */}
      {!paged && s.columnLayout !== "one" && sidebarSections.length > 0 && sidebarFill !== "transparent" && (
        <div
          aria-hidden
          data-sidebar-panel
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [s.columnReverse ? "left" : "right"]: 0,
            width: `calc((100% - ${padH} - ${padH}) * ${sidebarWidth / 100} + ${padH})`,
            backgroundColor: sidebarFill,
            zIndex: 0,
          }}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      {/* Across the page with one column; otherwise it heads the main column. */}
      {!headerInMain && headerEl}

      {/* Body Content */}
      <div
        style={{
          display: "flex",
          flexDirection: s.columnReverse ? "row-reverse" : "row",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Main Column */}
        {/* data-column: with a sidebar, each column is paginated on its own. */}
        <div
          data-column={hasSidebarColumn ? "main" : undefined}
          style={{
            flex: 1,
            paddingLeft: s.columnReverse ? "20pt" : 0,
            paddingRight: s.columnReverse
              ? 0
              : s.columnLayout !== "one"
                ? "20pt"
                : 0,
            paddingTop: "5pt",
            paddingBottom: 0,
          }}
        >
          {headerInMain && headerEl}
          {mainSections.map((section, i) => (
            <React.Fragment key={section.id}>
              {(pads?.[i] ?? 0) > 0 && <div style={{ height: pads![i] }} />}
              <div data-section>
                <SectionRenderer
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => (
                    <SectionHeading
                      title={title}
                      type={section.type}
                      ctx={ctx}
                      isFirst={i === 0}
                    />
                  )}
                />
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Sidebar Column */}
        {hasSidebarColumn && (
          <div
            data-column="sidebar"
            style={{
              width: `${sidebarWidth}%`,
              paddingLeft: s.columnReverse ? 0 : "20pt",
              paddingRight: s.columnReverse ? "20pt" : 0,
              paddingTop: "5pt",
              paddingBottom: 0,
            }}
          >
            {headerInSidebar && !hideHeader && (() => {
              // In the sidebar everything stacks: photo, name, job title, then
              // the details in one column.
              const sc = sCtx.colors;
              const px = ({ XS: 28, S: 36, M: 48, L: 64, XL: 80 } as const)[s.photoSize] || 48;
              const bw = s.photoBorderStyle === "none" ? 0 : s.photoBorderStyle === "thin" ? 0.5 : s.photoBorderStyle === "medium" ? 1 : 1.5;
              const textAlign = s.headerAlignment === "center" ? "center" : s.headerAlignment === "right" ? "right" : "left";
              return (
                <div
                  data-header
                  style={{
                    marginBottom: "12pt",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start",
                    textAlign,
                  }}
                >
                  {s.photoEnabled && h?.photo && s.photoPosition !== "bottom" && (
                    <img
                      src={h.photo}
                      alt={h.fullName || "Profile"}
                      style={{
                        width: `${px}pt`,
                        height: `${px}pt`,
                        borderRadius: s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? "6pt" : 0,
                        objectFit: "cover",
                        border: `${bw}pt solid ${s.photoBorderColor || "#e5e7eb"}`,
                        marginBottom: `${(s.photoGap || 12) / 2}pt`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: pt(sidebarNameSize),
                      fontWeight: "bold",
                      lineHeight: 1.1,
                      color: s.applyAccentName ? sc.accent : sc.text,
                    }}
                  >
                    {nameText}
                  </div>
                  {h?.jobTitle && (
                    <div
                      style={{
                        fontSize: pt(base * (!s.jobTitleStyle || s.jobTitleStyle === "caps" ? 1.1 : s.jobTitlePlacement === "inline" ? 1.9 : 1.3)),
                        marginTop: "4pt",
                        textTransform: s.jobTitleStyle && s.jobTitleStyle !== "caps" ? "none" : "uppercase",
                        letterSpacing: s.jobTitleStyle && s.jobTitleStyle !== "caps" ? 0 : "1.5px",
                        fontStyle: s.jobTitleStyle === "italic" ? "italic" : "normal",
                        color: s.applyAccentJobTitle ? `${sc.accent}b3` : `${sc.text}b3`,
                      }}
                    >
                      {h.jobTitle}
                    </div>
                  )}
                  {s.photoEnabled && h?.photo && s.photoPosition === "bottom" && (
                    <img
                      src={h.photo}
                      alt={h.fullName || "Profile"}
                      style={{
                        width: `${px}pt`,
                        height: `${px}pt`,
                        borderRadius: s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? "6pt" : 0,
                        objectFit: "cover",
                        border: `${bw}pt solid ${s.photoBorderColor || "#e5e7eb"}`,
                        marginTop: `${s.photoGap || 12}pt`,
                        marginBottom: "4pt",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {h && (
                    <div style={{ marginTop: "8pt", width: "100%" }}>
                      <ContactLine h={h} ctx={sidebarHeaderCtx} alignOverride={s.headerAlignment} />
                    </div>
                  )}
                </div>
              );
            })()}
            {sidebarSections.map((section, i) => (
              <div key={section.id} data-section>
                <SectionRenderer
                  section={section}
                  ctx={sCtx}
                  renderHeading={(title) => (
                    <SectionHeading
                      title={title}
                      type={section.type}
                      ctx={sCtx}
                      isSidebar={true}
                      isFirst={i === 0 && !headerInSidebar}
                    />
                  )}
                  isSidebar={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {!hideFooter && <TemplateFooter resume={resume} />}
    </div>
  );
}

export function TemplateFooter({
  resume,
  pageNumber,
  paged,
}: {
  resume: Resume;
  pageNumber?: number;
  /** Placed by a page frame: nothing scrolls under it, so no fill over the sidebar panel. */
  paged?: boolean;
}) {
  const ctx = buildCtx(resume.settings);
  const { colors, base, pt, s } = ctx;
  const header = resume.sections.find((sec) => sec.type === "header");
  const h = header?.items as HeaderData | undefined;
  const padH = `${s.marginHorizontal}mm`;

  if (!s.footerPageNumbers && !s.footerEmail && !s.footerName) return null;


  return (
    <div
      data-footer-fixed
      style={{
        marginTop: "auto",
        paddingTop: "4pt",
        paddingBottom: "4pt",
        display: "flex",        justifyContent: "space-between",
        alignItems: "center",
        fontSize: pt(base * 0.75),
        color: colors.subtitle,
        backgroundColor: paged ? "transparent" : colors.background,
      }}
    >
      <div>
        {s.footerName && (
          <span style={{ marginRight: "12pt" }}>{h?.fullName}</span>
        )}
        {s.footerEmail && <span>{h?.email}</span>}
      </div>
      {s.footerPageNumbers && (
        <div style={{ fontVariantNumeric: "tabular-nums" }}>
          {pageNumber !== undefined ? pageNumber : ""}
        </div>
      )}
    </div>
  );
}
