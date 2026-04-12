import React from "react";
import type { PublicationItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function PublicationsSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as PublicationItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.title}
          subtitle={item.publisher || undefined}
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
