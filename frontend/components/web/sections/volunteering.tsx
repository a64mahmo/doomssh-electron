import React from "react";
import type { VolunteeringItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function VolunteeringSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as VolunteeringItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.role}
          subtitle={item.organization || undefined}
          date={formatDateRange(item.startDate, item.endDate, item.present, s.dateFormat)}
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}
