import React from "react";
import type { Resume, ResumeSection, SectionType, HeaderData } from "@/lib/store/types";
import { buildCtx } from "@/lib/pdf/templateCtx";
import { SectionRenderer, ContactLine } from "./sections";
import { SECTION_ICONS } from "@/lib/icons/sectionIcons";
import { cn } from "@/lib/utils";
import { isLight } from "@/lib/pdf/styleUtils";

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
  resume: Resume;
  pads?: number[];
  hideFooter?: boolean;
  hideHeader?: boolean;
  isMeasurement?: boolean;
  sectionsOverride?: ResumeSection[];
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
    <div style={containerStyle}>
      {showIcon &&
        (() => {
          const mode = s.sectionHeadingIcon;
          const isKnockout = mode === "knockout";
          const boxSize = hSize * 1.1 * iconSizeMultiplier;
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
                        size: pt(hSize * 0.75 * iconSizeMultiplier),
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
        {(s.clShowAutoSignOff ?? true) && (
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

  const visibleSections =
    sectionsOverride ||
    resume.sections.filter(
      (sec) => sec.visible !== false && sec.type !== "header",
    );

  const sidebarTypes = [
    "skills",
    "education",
    "languages",
    "certifications",
    "awards",
    "references",
  ];
  const mixMainTypes = [
    "summary",
    "experience",
    "projects",
    "volunteering",
    "publications",
    "custom",
  ];

  const mainSections: ResumeSection[] = [];
  const sidebarSections: ResumeSection[] = [];

  if (s.columnLayout === "one") {
    mainSections.push(...visibleSections);
  } else {
    visibleSections.forEach((sec) => {
      const assigned = s.sectionColumns?.[sec.id];
      if (assigned === "sidebar") {
        sidebarSections.push(sec);
      } else if (assigned === "main") {
        mainSections.push(sec);
      } else {
        if (s.columnLayout === "mix") {
          if (mixMainTypes.includes(sec.type)) mainSections.push(sec);
          else sidebarSections.push(sec);
        } else {
          if (sidebarTypes.includes(sec.type)) sidebarSections.push(sec);
          else mainSections.push(sec);
        }
      }
    });
  }

  const padH = `${s.marginHorizontal}mm`;
  const padV = `${s.marginVertical}mm`;

  const sidebarWidth = s.columnWidthMode === "manual" ? s.columnWidth : 32;
  const mainWidth = 100 - sidebarWidth;

  const dividerColor = s.applyAccentDotsBarsBubbles ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);
  const sidebarTint = s.applyAccentDotsBarsBubbles ? colors.accent : "transparent";

  if (resume.kind === 'coverLetter') {
    return (
      <div
        style={{
          width: s.paperSize === "a4" ? "210mm" : "216mm",
          minHeight: isMeasurement ? "auto" : (s.paperSize === "a4" ? "297mm" : "279mm"),
          fontFamily: font,
          fontSize: pt(base),
          lineHeight: lh,
          boxSizing: "border-box",
          backgroundColor: (s.themeColorStyle === 'advanced' && s.backgroundColor === '#ffffff') ? `${colors.accent}05` : colors.background,
          color: colors.text,
          display: "flex",
          flexDirection: "column",
          paddingLeft: padH,
          paddingRight: padH,
          paddingTop: padV,
          paddingBottom: padV,
          border: s.themeColorStyle === 'border' ? `12pt solid ${colors.accent}` : 'none',
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
                <div className={cn("flex flex-col", isCenter ? "items-center text-center" : isRight ? "items-end text-right" : "items-start text-left")}>
                  <h1 className="m-0 font-bold tracking-tight print:text-black" style={{ fontSize: pt(nameSize), color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text), lineHeight: 1.1 }}>
                    {h?.fullName || "Your Name"}
                  </h1>
                  {h?.jobTitle && (
                    <div className="mt-1 font-medium uppercase tracking-[0.2em] opacity-70 print:text-black print:opacity-100" style={{ fontSize: pt(base * 1.1), color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentJobTitle ? colors.accent : colors.text) }}>
                      {h.jobTitle}
                    </div>
                  )}
                </div>
              );

              const contactTextColor = s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text);
              if (isCenter) {
                return (
                  <div className="flex flex-col items-center text-center pb-1 mb-1 w-full" style={{ color: s.themeColorStyle === 'advanced' ? advancedTextColor : colors.text }}>
                    <div className="flex items-center justify-center w-full relative">
                      {photoPos === "beside" && photoEl && <div className="absolute left-0 top-1/2 -translate-y-1/2">{photoEl}</div>}
                      <div className="flex flex-col items-center">
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

  return (
    <div
      style={{
        width: s.paperSize === "a4" ? "210mm" : "216mm",
        minHeight: isMeasurement
          ? "auto"
          : s.paperSize === "a4"
            ? "297mm"
            : "279mm",
        fontFamily: font,
        fontSize: pt(base),
        lineHeight: lh,
        boxSizing: "border-box",
        backgroundColor: (s.themeColorStyle === 'advanced' && s.backgroundColor === '#ffffff') ? `${colors.accent}05` : colors.background,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        paddingLeft: padH,
        paddingRight: padH,
        paddingTop: padV,
        paddingBottom: padV,
        border: s.themeColorStyle === 'border' ? `12pt solid ${colors.accent}` : 'none',
        position: 'relative',
      }}
    >
      {fontHref && <link rel="stylesheet" href={fontHref} />}

      {/* ── Header ───────────────────────────────────────────────── */}
      {!hideHeader && (
        <div
          style={{
            backgroundColor: s.themeColorStyle === 'advanced' ? colors.accent : 'transparent',
            color: s.themeColorStyle === 'advanced' ? (isLight(colors.accent) ? '#1a1a1a' : '#ffffff') : 'inherit',
            marginLeft: s.themeColorStyle === 'advanced' ? `-${padH}` : 0,
            marginRight: s.themeColorStyle === 'advanced' ? `-${padH}` : 0,
            marginTop: s.themeColorStyle === 'advanced' ? `-${padV}` : 0,
            paddingLeft: s.themeColorStyle === 'advanced' ? padH : 0,
            paddingRight: s.themeColorStyle === 'advanced' ? padH : 0,
            paddingTop: s.themeColorStyle === 'advanced' ? padV : 0,
            paddingBottom: s.themeColorStyle === 'advanced' ? "15pt" : 0,
            marginBottom: s.themeColorStyle === 'advanced' ? "15pt" : 0,
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
                )}
              >
                <h1
                  className="m-0 font-bold tracking-tight print:text-black"
                  style={{
                    fontSize: pt(nameSize),
                    color: s.themeColorStyle === 'advanced' ? advancedTextColor : (s.applyAccentName ? colors.accent : colors.text),
                    lineHeight: 1.1,
                  }}
                >
                  {h?.fullName || "Your Name"}
                </h1>
                {h?.jobTitle && (
                  <div
                    className="mt-1 font-medium uppercase tracking-[0.2em] opacity-70 print:text-black print:opacity-100"
                    style={{ 
                      fontSize: pt(base * 1.1),
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
                  <div className="flex items-center justify-center w-full relative">
                    {/* Photo on the side if specified */}
                    {photoPos === "beside" && photoEl && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        {photoEl}
                      </div>
                    )}

                    <div className="flex flex-col items-center">
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
                    <ContactLine h={h!} ctx={ctx} textColorOverride={contactTextColor} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Body Content */}
      <div
        style={{
          display: "flex",
          flexDirection: s.columnReverse ? "row-reverse" : "row",
          flex: 1,
          background:
            s.columnLayout !== "one"
              ? s.columnReverse
                ? `linear-gradient(to left, transparent ${mainWidth}%, ${sidebarTint}05 ${mainWidth}%)`
                : `linear-gradient(to right, transparent ${mainWidth}%, ${sidebarTint}05 ${mainWidth}%)`
              : "transparent",
        }}
      >
        {/* Main Column */}
        <div
          style={{
            flex: 1,
            paddingLeft: s.columnReverse ? "20pt" : 0,
            paddingRight: s.columnReverse
              ? 0
              : s.columnLayout !== "one"
                ? "20pt"
                : 0,
            paddingTop: "5pt",
            paddingBottom: isMeasurement ? "0" : "20pt",
            borderRight:
              !s.columnReverse &&
              s.columnLayout !== "one" &&
              sidebarSections.length > 0
                ? `0.5pt solid ${dividerColor}`
                : "none",
            borderLeft:
              s.columnReverse &&
              s.columnLayout !== "one" &&
              sidebarSections.length > 0
                ? `0.5pt solid ${dividerColor}`
                : "none",
          }}
        >
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
        {s.columnLayout !== "one" && sidebarSections.length > 0 && (
          <div
            style={{
              width: `${sidebarWidth}%`,
              paddingLeft: s.columnReverse ? 0 : "20pt",
              paddingRight: s.columnReverse ? "20pt" : 0,
              paddingTop: "5pt",
              paddingBottom: isMeasurement ? "0" : "20pt",
            }}
          >
            {sidebarSections.map((section, i) => (
              <div key={section.id} data-section>
                <SectionRenderer
                  section={section}
                  ctx={ctx}
                  renderHeading={(title) => (
                    <SectionHeading
                      title={title}
                      type={section.type}
                      ctx={ctx}
                      isSidebar={true}
                      isFirst={i === 0}
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
}: {
  resume: Resume;
  pageNumber?: number;
}) {
  const ctx = buildCtx(resume.settings);
  const { colors, base, pt, s } = ctx;
  const header = resume.sections.find((sec) => sec.type === "header");
  const h = header?.items as HeaderData | undefined;
  const padH = `${s.marginHorizontal}mm`;

  if (!s.footerPageNumbers && !s.footerEmail && !s.footerName) return null;

  const dividerColor = s.applyAccentDotsBarsBubbles ? colors.accent : (s.colorMode === 'basic' ? colors.text : colors.heading);

  return (
    <div
      data-footer-fixed
      style={{
        marginTop: "auto",
        paddingTop: "10pt",
        paddingBottom: "4pt",
        borderTop: `0.5pt solid ${dividerColor}`,
        display: "flex",        justifyContent: "space-between",
        alignItems: "center",
        fontSize: pt(base * 0.75),
        color: colors.subtitle,
        backgroundColor: colors.background,
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
