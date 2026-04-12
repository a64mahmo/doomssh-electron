import React from "react";
import type { ExperienceItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function ExperienceSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as ExperienceItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => {
        const title =
          s.experienceOrder === "employer-title" ? item.company : item.position;
        const sub =
          s.experienceOrder === "employer-title" ? item.position : item.company;
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
          />
        );
      })}
    </div>
  );
}
