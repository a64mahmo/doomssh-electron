import React from "react";
import type { SectionProps } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";

export function LanguagesSection({ section, ctx, renderHeading }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors, lh } = ctx;

  return (
    <div>
      {renderHeading(viewModel.title)}
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {viewModel.items.map((item: any, index) => (
          <div
            key={item.id || index}
            style={{ fontSize: `${base * 0.9}pt`, lineHeight: lh }}
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
