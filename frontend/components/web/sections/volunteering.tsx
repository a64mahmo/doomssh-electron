import React from "react";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";

export function VolunteeringSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: formatDateRange,
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  return (
    <div>
      {renderHeading(viewModel.title)}
      {viewModel.items.map((item, index) => (
        <Entry
          key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText || undefined}
          date={item.dateRange}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}
