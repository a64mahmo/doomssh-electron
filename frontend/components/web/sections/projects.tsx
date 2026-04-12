import React from "react";
import type { ProjectItem } from "@/lib/store/types";
import { formatDateRange } from "@/lib/utils/dates";
import type { SectionProps } from "./shared";
import { Entry } from "./shared";

export function ProjectsSection({ section, ctx, renderHeading, isSidebar }: SectionProps) {
  const items = (section.items as ProjectItem[]) || [];
  if (!items.length) return null;
  const { base, colors, s, pt } = ctx;
  return (
    <div>
      {renderHeading(section.title)}
      {items.map((item) => (
        <Entry
          key={item.id}
          title={item.name}
          subtitle={
            item.url ? (
              <div
                style={{
                  fontSize: pt(base * 0.85),
                  color: s.linkBlue ? "#0066cc" : (s.applyAccentLinkIcons ? colors.accent : colors.text),
                  textDecoration: s.linkUnderline ? "underline" : "none",
                }}
              >
                {item.url}
              </div>
            ) : undefined
          }
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
