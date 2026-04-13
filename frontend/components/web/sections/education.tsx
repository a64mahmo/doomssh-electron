import React from "react";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";
import { getSectionViewModel } from "@/lib/renderers";

export function EducationSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const viewModel = getSectionViewModel(section, {
    settings: ctx.s,
    helpers: {
      formatDate: formatDateRange,
      pt: (size: number | string) => `${size}pt`,
    },
  });

  if (!viewModel.isVisible) return null;

  const { base, colors } = ctx;

  return (
    <div>
      {renderHeading(viewModel.title)}
      {viewModel.items.map((item, index) => (
        <Entry
          key={item.id || index}
          title={item.primaryText}
          subtitle={item.secondaryText || undefined}
          location={item.location}
          date={item.dateRange}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
          extraLine={
            item.gpa ? (
              <div
                style={{
                  fontSize: `calc(${base} * 0.85)`,
                  color: colors.subtitle,
                  marginBottom: "2pt",
                }}
              >
                GPA: {item.gpa}
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
