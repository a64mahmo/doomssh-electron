import React from "react";
import type { SkillItem } from "@/lib/store/types";
import type { SectionProps } from "./shared";

export function SkillsSection({ section, ctx, renderHeading }: SectionProps) {
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
