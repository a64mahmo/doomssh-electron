import React from "react";
import type { ResumeSection } from "@/lib/store/types";
import type { TemplateCtx } from "@/lib/pdf/templateCtx";
import { parseMdLines, tokenizeMd } from "@/lib/utils/text";

export type HeadingFn = (title: string) => React.ReactNode;

export interface SectionProps {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}

export function renderMd(text: string, ctx: TemplateCtx) {
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
            marginBottom: pt(base * 0.15),
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

export function Entry({
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
  const isCompact = isSidebar || (s.entrySpacing ?? 1.0) < 0.9;

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
    <div style={{ marginBottom: pt(base * (s.entrySpacing ?? 1.0) * 1.2) }} className="w-full">
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

import { BsIcon } from "@/lib/icons/BsIcon";
