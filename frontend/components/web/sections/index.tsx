import React from "react";
import type { ResumeSection } from "@/lib/store/types";
import type { TemplateCtx } from "@/lib/pdf/templateCtx";
import type { HeadingFn } from "./shared";

import { SummarySection } from "./summary";
import { ExperienceSection } from "./experience";
import { EducationSection } from "./education";
import { SkillsSection } from "./skills";
import { ProjectsSection } from "./projects";
import { CertificationsSection } from "./certifications";
import { LanguagesSection } from "./languages";
import { AwardsSection } from "./awards";
import { VolunteeringSection } from "./volunteering";
import { PublicationsSection } from "./publications";
import { ReferencesSection } from "./references";
import { CustomSection } from "./custom";

export { ContactLine } from "./contact";
export type { HeadingFn, SectionProps } from "./shared";

export function SectionRenderer({
  section,
  ctx,
  renderHeading,
  isSidebar = false,
}: {
  section: ResumeSection;
  ctx: TemplateCtx;
  renderHeading: HeadingFn;
  isSidebar?: boolean;
}) {
  if (!section.visible) return null;
  const props = { section, ctx, renderHeading, isSidebar };
  switch (section.type) {
    case "summary":
      return <SummarySection {...props} />;
    case "experience":
      return <ExperienceSection {...props} />;
    case "education":
      return <EducationSection {...props} />;
    case "skills":
      return <SkillsSection {...props} />;
    case "projects":
      return <ProjectsSection {...props} />;
    case "certifications":
      return <CertificationsSection {...props} />;
    case "languages":
      return <LanguagesSection {...props} />;
    case "awards":
      return <AwardsSection {...props} />;
    case "volunteering":
      return <VolunteeringSection {...props} />;
    case "publications":
      return <PublicationsSection {...props} />;
    case "references":
      return <ReferencesSection {...props} />;
    case "custom":
      return <CustomSection {...props} />;
    default:
      return null;
  }
}
