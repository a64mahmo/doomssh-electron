import React from "react";
import type { SectionProps } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";

export function ReferencesSection({ section, ctx, renderHeading }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors, lh, s } = ctx;

  return (
    <div>
      {renderHeading(viewModel.title)}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {viewModel.items.map((item: any, index) => (
          <div key={item.id || index} className="min-w-0">
            <div
              style={{
                fontWeight: "bold",
                fontSize: `${base * 0.9}pt`,
                lineHeight: 1.4,
              }}
            >
              {item.primaryText}
            </div>
            {item.secondaryText && (
              <div
                style={{
                  fontSize: `${base * 0.85}pt`,
                  color: colors.subtitle,
                  lineHeight: lh,
                }}
              >
                {item.secondaryText}
              </div>
            )}
            {item.company && (
              <div
                style={{
                  fontSize: `${base * 0.85}pt`,
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
                  fontSize: `${base * 0.82}pt`,
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
                  fontSize: `${base * 0.82}pt`,
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
