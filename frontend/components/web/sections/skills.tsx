import React from "react";
import type { SectionProps } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";
import { isLight } from "@/lib/pdf/styleUtils";

export function SkillsSection({ section, ctx, renderHeading }: SectionProps) {
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

  return (
    <div>
      {renderHeading(viewModel.title)}
      {display === "compact" && (
        <div style={{ fontSize: `${base}pt`, lineHeight: lh, color: colors.text }}>
          {viewModel.items.map((sk: any) => sk.name).join(" · ")}
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
              <div style={{ fontSize: `${base * 0.9}pt`, lineHeight: lh }}>
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
                  {sk.level}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {display === "bubble" && (
        <div className="flex flex-wrap gap-1.5">
          {viewModel.items.map((sk: any) => (
            <span
              key={sk.id}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                backgroundColor: bubbleBg,
                color: bubbleText,
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
