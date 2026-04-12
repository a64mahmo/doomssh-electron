"use client";
import { useRef } from "react";
import { toast } from "sonner";
import { useSection } from "@/hooks/useResume";
import { Input } from "@/components/ui/input";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
  Code2,
  Plus,
  X,
  Image as ImageIcon,
  BadgeCheck,
  Flag,
  Calendar,
  FileText,
  Smartphone,
  Car,
  Shield,
  Heart,
  Zap,
  AlertCircle,
  BarChart3,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { HeaderData } from "@/lib/store/types";
import { FieldLabel, ControlGroup } from "../EditorPrimitives";

interface Props {
  sectionId: string;
}

function Field({
  label,
  icon: Icon,
  children,
  onRemove,
}: {
  label: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-muted-foreground/50" />
          <FieldLabel className="mb-0">{label}</FieldLabel>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-destructive/10 rounded transition-colors group/del"
          >
            <X
              size={12}
              className="text-muted-foreground/30 group-hover/del:text-destructive transition-colors"
            />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

const PERSONAL_DETAILS = [
  { key: "passportOrId", label: "Passport or ID", icon: BadgeCheck },
  { key: "nationality", label: "Nationality", icon: Flag },
  { key: "dateOfBirth", label: "Date of Birth", icon: Calendar },
  { key: "visa", label: "Visa", icon: FileText },
  { key: "availability", label: "Availability", icon: Zap },
  { key: "genderPronoun", label: "Gender/Pronoun", icon: User },
  { key: "disability", label: "Disability", icon: Heart },
  { key: "workMode", label: "Work Mode", icon: Briefcase },
  { key: "relocation", label: "Relocation", icon: MapPin },
  { key: "expectedSalary", label: "Expected Salary", icon: Globe },
  { key: "secondPhone", label: "Second Phone", icon: Smartphone },
  { key: "drivingLicense", label: "Driving License", icon: Car },
  { key: "securityClearance", label: "Security Clearance", icon: Shield },
  { key: "maritalStatus", label: "Marital Status", icon: Heart },
  { key: "militaryService", label: "Military Service", icon: Shield },
  { key: "smoking", label: "Smoking", icon: AlertCircle },
  { key: "height", label: "Height", icon: BarChart3 },
  { key: "weight", label: "Weight", icon: Scale },
];

const SOCIAL_PROFILES = [
  { key: "twitter", label: "Twitter", icon: Link },
  { key: "instagram", label: "Instagram", icon: Link },
  { key: "facebook", label: "Facebook", icon: Link },
  { key: "youtube", label: "YouTube", icon: Link },
  { key: "tiktok", label: "TikTok", icon: Link },
  { key: "pinterest", label: "Pinterest", icon: Link },
  { key: "medium", label: "Medium", icon: Link },
  { key: "behance", label: "Behance", icon: Link },
  { key: "dribbble", label: "Dribbble", icon: Link },
  { key: "stackoverflow", label: "Stack Overflow", icon: Code2 },
  { key: "gitlab", label: "GitLab", icon: Code2 },
  { key: "bitbucket", label: "Bitbucket", icon: Code2 },
  { key: "discord", label: "Link", icon: Link },
  { key: "reddit", label: "Link", icon: Link },
  { key: "bluesky", label: "Link", icon: Link },
  { key: "threads", label: "Link", icon: Link },
  { key: "mastodon", label: "Link", icon: Link },
];

export function HeaderSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId);
  const item = (section?.items as HeaderData) || {};
  const photoInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof HeaderData, value: string) {
    updateItems({ ...item, [field]: value });
  }

  function toggleField(field: keyof HeaderData) {
    const currentValue = item[field];
    if (currentValue !== undefined) {
      removeField(field);
    } else {
      update(field, "");
    }
  }

  function removeField(field: keyof HeaderData) {
    const next = { ...item };
    delete next[field];
    updateItems(next);
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - browsers might not support HEIC base64 rendering easily
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid format. Please use JPEG, PNG, or WEBP.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => update("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const activePersonalDetails = PERSONAL_DETAILS.filter(
    (d) => item[d.key as keyof HeaderData] !== undefined,
  );
  const activeSocialProfiles = SOCIAL_PROFILES.filter(
    (d) => item[d.key as keyof HeaderData] !== undefined,
  );

  return (
    <div className="space-y-10">
      {/* Basics */}
      <ControlGroup title="Profile Image & Identity">
        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-5">
            <Field label="Full Name" icon={User}>
              <Input
                placeholder="John Doe"
                className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
                value={item.fullName || ""}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>
            <Field label="Job Title" icon={Briefcase}>
              <Input
                placeholder="Senior Product Designer"
                className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
                value={item.jobTitle || ""}
                onChange={(e) => update("jobTitle", e.target.value)}
              />
            </Field>
          </div>
          <div className="shrink-0 space-y-3 pt-1 text-center">
            <FieldLabel className="mb-0">Photo</FieldLabel>
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-28 h-28 rounded-3xl bg-muted/50 border-2 border-dashed border-border hover:border-foreground/20 hover:bg-muted transition-all flex items-center justify-center overflow-hidden group shadow-sm"
            >
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.fullName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  size={28}
                  className="text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors"
                />
              )}
            </button>
          </div>
        </div>
      </ControlGroup>

      {/* Contact */}
      <ControlGroup title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <Field label="Email" icon={Mail}>
            <Input
              placeholder="john@example.com"
              className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
              value={item.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Phone" icon={Phone}>
            <Input
              placeholder="+1 555 000 0000"
              className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
              value={item.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Location" icon={MapPin}>
            <Input
              placeholder="New York, NY"
              className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
              value={item.location || ""}
              onChange={(e) => update("location", e.target.value)}
            />
          </Field>
          <Field label="Website" icon={Globe}>
            <Input
              placeholder="portfolio.com"
              className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
              value={item.website || ""}
              onChange={(e) => update("website", e.target.value)}
            />
          </Field>
        </div>
      </ControlGroup>

      {/* Socials & More */}
      <ControlGroup title="Social Profiles & Additional Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Active Custom Fields */}
          {[...activePersonalDetails, ...activeSocialProfiles].map((f) => (
            <Field
              key={f.key}
              label={f.label}
              icon={f.icon || Link}
              onRemove={() => removeField(f.key as keyof HeaderData)}
            >
              <Input
                className="h-10 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20 w-full"
                placeholder={`Enter ${f.label.toLowerCase()}`}
                value={item[f.key as keyof HeaderData] || ""}
                onChange={(e) =>
                  update(f.key as keyof HeaderData, e.target.value)
                }
              />
            </Field>
          ))}
        </div>

        {/* Add more buttons */}
        <div className="pt-8 border-t border-border/30 mt-6">
          <FieldLabel className="mb-4 text-muted-foreground/50 uppercase tracking-widest text-[9px]">
            Add Additional Fields
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[...PERSONAL_DETAILS, ...SOCIAL_PROFILES].map((f) => {
              const isActive =
                item[f.key as keyof HeaderData] !== undefined;
              if (isActive) return null;
              return (
                <button
                  key={f.key}
                  onClick={() => toggleField(f.key as keyof HeaderData)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[10px] font-bold uppercase tracking-wider hover:bg-muted hover:border-border transition-all text-muted-foreground/70 hover:text-foreground"
                >
                  <Plus size={11} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </ControlGroup>
    </div>
  );
}
