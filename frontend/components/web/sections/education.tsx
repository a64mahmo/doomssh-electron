import React from "react";
import type { EducationItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function EducationSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as EducationItem[]) || [];
  if (!items.length) return null;
  const { s, base, colors, pt } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => {
        const degreeStr = [item.degree, item.field].filter(Boolean).join(", ");
        const title =
          s.educationOrder === "school-degree"
            ? item.institution
            : degreeStr || item.institution;
        const sub =
          s.educationOrder === "school-degree" ? degreeStr : item.institution;
        return (
          <Entry
            key={item.id}
            title={title}
            subtitle={sub || undefined}
            location={item.location}
            date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
            description={item.description}
            ctx={ctx}
            isSidebar={isSidebar}
            extraLine={
              item.gpa ? (
                <div
                  style={{
                    fontSize: pt(base * 0.85),
                    color: colors.subtitle,
                    marginBottom: "2pt",
                  }}
                >
                  GPA: {item.gpa}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}
