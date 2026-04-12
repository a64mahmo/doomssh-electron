import React from "react";
import type { AwardItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function AwardsSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as AwardItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.title}
          subtitle={item.issuer || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          description={item.description}
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}
