import React from "react";
import type { SectionProps } from "./shared";
import { renderMd } from "./shared";

export function SummarySection({ section, ctx, renderHeading }: SectionProps) {
  const text = (section.items as { text: string })?.text || "";
  if (!text) return null;
  return (
    <div>
      {renderHeading(section.title)}
      <div className="print:text-black">{renderMd(text, ctx)}</div>
    </div>
  );
}
