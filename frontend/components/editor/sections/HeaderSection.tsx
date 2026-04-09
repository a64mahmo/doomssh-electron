"use client";
import { useSection } from "@/hooks/useResume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Code2,
} from "lucide-react";
import type { HeaderItem } from "@/lib/store/types";

interface Props {
  sectionId: string;
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        <Icon size={12} className="text-muted-foreground/70" />
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </Label>
      </div>
      {children}
    </div>
  );
}

export function HeaderSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId);
  const item = (section?.items as HeaderItem) || {};

  function update(field: keyof HeaderItem, value: string) {
    updateItems({ ...item, [field]: value });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full Name" icon={User}>
          <Input
            placeholder="e.g. John Doe"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.fullName || ""}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </Field>
        <Field label="Job Title" icon={Briefcase}>
          <Input
            placeholder="Senior Product Designer"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.jobTitle || ""}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Email Address" icon={Mail}>
          <Input
            placeholder="john@example.com"
            className="h-9 text-xs focus-visible:ring-1"
            type="email"
            value={item.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone Number" icon={Phone}>
          <Input
            placeholder="+1 (555) 000-0000"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Location" icon={MapPin}>
          <Input
            placeholder="New York, NY"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.location || ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </Field>
        <Field label="Website / Portfolio" icon={Globe}>
          <Input
            placeholder="portfolio.com"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.website || ""}
            onChange={(e) => update("website", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="LinkedIn" icon={Link}>
          <Input
            placeholder="linkedin.com/in/username"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.linkedin || ""}
            onChange={(e) => update("linkedin", e.target.value)}
          />
        </Field>
        <Field label="GitHub" icon={Code2}>
          <Input
            placeholder="github.com/username"
            className="h-9 text-xs focus-visible:ring-1"
            value={item.github || ""}
            onChange={(e) => update("github", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
