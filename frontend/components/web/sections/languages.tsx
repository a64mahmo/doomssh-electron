import React from "react";
import type { LanguageItem } from "@/lib/store/types";
import type { SectionProps } from "./shared";

export function LanguagesSection({ section, ctx, renderHeading }: SectionProps) {
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
