import React from "react";
import type { SectionProps } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";
import { isLight, LEVEL_ORDER, LEVEL_LABELS, levelScore } from "@/lib/pdf/styleUtils";
import type { ProficiencyLevel } from "@/lib/store/types";

export function SkillsSection({ section, ctx, renderHeading, isSidebar = false }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, lh, colors, s } = ctx;
  const display = s.skillDisplay;
  
  const bubbleBg = s.applyAccentDotsBarsBubbles ? colors.accent : colors.text;
  const bubbleText = isLight(bubbleBg) ? '#1a1a1a' : colors.background;
  const dotColor = s.applyAccentDotsBarsBubbles ? colors.accent : colors.text;
  const dotSize = Math.max(3, base * 0.42);

  // data-keep: printed as one block so the heading is never stranded (app/print).
  return (
    <div data-keep>
      {renderHeading(viewModel.title)}
      {display === "compact" &&
        (() => {
          const items = viewModel.items as any[];
          // Categorised skills get a
          // line each so the groups stay legible instead of collapsing into a
          // single · -joined run-on.
          const hasCategories = items.some((sk) => sk.category);
          if (!hasCategories) {
            return (
              <div style={{ fontSize: `${base}pt`, lineHeight: lh, color: colors.text }}>
                {items.map((sk) => sk.name).join(" · ")}
              </div>
            );
          }
          return items.map((sk) => (
            <div
              key={sk.id}
              style={{ fontSize: `${base * 0.95}pt`, lineHeight: lh, color: colors.text, marginBottom: "2pt" }}
            >
              {sk.category && (
                <span style={{ fontWeight: 700, color: s.applyAccentEntrySubtitle ? colors.accent : colors.text }}>
                  {sk.category}:{" "}
                </span>
              )}
              {sk.name}
            </div>
          ));
        })()}
      {display === "grid" &&
        (() => {
          // The sidebar is ~32% of the page — multi-column skills wrap to garbage there.
          const cols = isSidebar ? 1 : (s.skillColumns ?? 3);
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "4pt",
              }}
            >
              {viewModel.items.map((sk: any) => (
                <div
                  key={sk.id}
                  style={{ fontSize: `${base * 0.9}pt`, lineHeight: lh }}
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
          {viewModel.items.map((sk: any) => (
            <div
              key={sk.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2pt",
              }}
            >
              <div style={{ fontSize: `${base * 0.9}pt`, lineHeight: lh, flex: 1, minWidth: 0, marginRight: "8pt", color: colors.text }}>
                {sk.category ? `${sk.category}: ` : ""}
                {sk.name}
              </div>
              {sk.level && (
                <div
                  style={{
                    fontSize: `${base * 0.9}pt`,
                    lineHeight: lh,
                    color: colors.subtitle,
                  }}
                >
                  {LEVEL_LABELS[sk.level as ProficiencyLevel] ?? sk.level}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {display === "dots" && (
        <div>
          {viewModel.items.map((sk: any) => (
            <div
              key={sk.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2pt",
              }}
            >
              <div style={{ fontSize: `${base * 0.9}pt`, lineHeight: lh, color: colors.text, marginRight: "8pt" }}>
                {sk.category ? `${sk.category}: ` : ""}
                {sk.name}
              </div>
              <div style={{ display: "flex", flexShrink: 0, gap: "2pt" }}>
                {LEVEL_ORDER.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: `${dotSize}pt`,
                      height: `${dotSize}pt`,
                      borderRadius: "50%",
                      backgroundColor: dotColor,
                      opacity: i < levelScore(sk.level) ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {display === "bubble" && (
        // Rounded-rectangle pills
        // sized from the base font, so wrapped skills stay inside their pill.
        <div className="flex flex-wrap" style={{ gap: "4pt" }}>
          {viewModel.items.map((sk: any) => (
            <span
              key={sk.id}
              style={{
                backgroundColor: bubbleBg,
                color: bubbleText,
                fontSize: `${base * 0.85}pt`,
                fontWeight: 500,
                lineHeight: 1.35,
                padding: "2pt 7pt",
                borderRadius: "6pt",
                maxWidth: "100%",
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
