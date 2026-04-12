import React from "react";
import type { CertificationItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function CertificationsSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as CertificationItem[]) || [];
  if (!items.length) return null;
  const { s } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.name}
          subtitle={item.issuer || undefined}
          date={
            item.date
              ? formatDateRange(item.date, "", false, s.dateFormat)
              : undefined
          }
          ctx={ctx}
          isSidebar={isSidebar}
        />
      ))}
    </div>
  );
}
