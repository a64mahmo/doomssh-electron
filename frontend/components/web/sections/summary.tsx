import React from "react";
import type { SectionProps } from "./shared";
import { renderMd } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";

export function SummarySection({ section, ctx, renderHeading }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: () => "",
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  const text = (viewModel.items[0] as any)?.text || "";

  return (
    <div>
      {renderHeading(viewModel.title)}
      <div className="print:text-black">{renderMd(text, ctx)}</div>
    </div>
  );
}
