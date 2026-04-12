import React from "react";
import type { ReferenceItem } from "@/lib/store/types";
import type { SectionProps } from "./shared";

export function ReferencesSection({ section, ctx, renderHeading }: SectionProps) {
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
