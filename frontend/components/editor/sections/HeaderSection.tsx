"use client";
import { useState, useRef } from "react";
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
  Plus,
  ChevronDown,
  X,
  Image as ImageIcon,
  BadgeCheck,
  Flag,
  Calendar,
  FileText,
  Users,
  Zap as WorkIcon,
  MapPin as RelocationIcon,
  DollarSign,
  Smartphone,
  Car,
  Shield,
  Heart,
  Zap,
  AlertCircle,
  BarChart3,
  Scale,
} from "lucide-react";
import type { HeaderItem } from "@/lib/store/types";

interface Props {
  sectionId: string;
}

function Field({
  label,
  icon: Icon,
  children,
  onRemove,
  type = "text",
}: {
  label: string;
  icon: any;
  children?: React.ReactNode;
  onRemove?: () => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5 justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-muted-foreground/70" />
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </Label>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-destructive/10 rounded transition-colors"
            title="Remove field"
          >
            <X size={14} className="text-muted-foreground/50" />
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
  { key: "workMode", label: "Work Mode", icon: WorkIcon },
  { key: "relocation", label: "Relocation", icon: MapPin },
  { key: "expectedSalary", label: "Expected Salary", icon: DollarSign },
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
  { key: "stackoverflow", label: "Stack Overflow", icon: Link },
  { key: "gitlab", label: "GitLab", icon: Link },
  { key: "bitbucket", label: "Bitbucket", icon: Link },
  { key: "discord", label: "Discord", icon: Link },
  { key: "reddit", label: "Reddit", icon: Link },
  { key: "bluesky", label: "Bluesky", icon: Link },
  { key: "threads", label: "Threads", icon: Link },
  { key: "mastodon", label: "Mastodon", icon: Link },
];

interface DetailOption {
  key: string;
  label: string;
  icon?: any;
  inputType?: string;
  placeholder?: string;
}

function DetailsButton({
  option,
  isActive,
  onClick,
}: {
  option: DetailOption;
  isActive: boolean;
  onClick: () => void;
}) {
  const IconComponent = option.icon || Plus;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all duration-200 ${
        isActive
          ? "bg-foreground text-background"
          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
      }`}
    >
      {isActive ? <X size={14} /> : <Plus size={14} />}
      <span>{option.label}</span>
    </button>
  );
}

function getInputType(key: string): string {
  const typeMap: Record<string, string> = {
    dateOfBirth: "date",
    email: "email",
    phone: "tel",
    secondPhone: "tel",
    expectedSalary: "number",
  };
  return typeMap[key] || "text";
}

function getPlaceholder(label: string, key: string): string {
  const placeholders: Record<string, string> = {
    dateOfBirth: "YYYY-MM-DD",
    expectedSalary: "50000",
    secondPhone: "+1 (555) 000-0000",
  };
  return placeholders[key] || `Enter ${label.toLowerCase()}`;
}

export function HeaderSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId);
  const item = (section?.items as HeaderItem) || {};
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof HeaderItem, value: string) {
    updateItems({ ...item, [field]: value });
  }

  function toggleField(field: keyof HeaderItem) {
    const currentValue = item[field as keyof HeaderItem];
    if (currentValue) {
      removeField(field);
    } else {
      update(field, "");
    }
  }

  function removeField(field: keyof HeaderItem) {
    const updated = { ...item, [field]: "" };
    updateItems(updated);
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      update("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const visiblePersonalDetails = PERSONAL_DETAILS.slice(0, 4);
  const allPersonalDetails = PERSONAL_DETAILS;

  const activePersonalDetails = allPersonalDetails.filter((d) => item[d.key as keyof HeaderItem]);
  const activeSocialProfiles = SOCIAL_PROFILES.filter((d) => item[d.key as keyof HeaderItem]);

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header with Name, Title, and Photo */}
      <div className="flex flex-col gap-3 md:gap-6 md:flex-row md:items-start">
        {/* Left side - Name and Title */}
        <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
          <Field label="Full Name" icon={User}>
            <Input
              placeholder="e.g. John Doe"
              className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
              value={item.fullName || ""}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </Field>
          <Field label="Professional Title" icon={Briefcase}>
            <Input
              placeholder="Senior Product Designer"
              className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
              value={item.jobTitle || ""}
              onChange={(e) => update("jobTitle", e.target.value)}
            />
          </Field>
        </div>

        {/* Right side - Photo */}
        <div className="w-24 md:w-32 space-y-2 flex-shrink-0">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Photo
          </Label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full aspect-square rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer overflow-hidden flex-shrink-0"
          >
            {item.photo ? (
              <img src={item.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-muted-foreground md:w-8 md:h-8" />
            )}
          </button>
        </div>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
        <Field label="Email" icon={Mail} type="email">
          <Input
            placeholder="john@example.com"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            type="email"
            value={item.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone" icon={Phone} type="tel">
          <Input
            placeholder="+1 (555) 000-0000"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            type="tel"
            value={item.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Location" icon={MapPin}>
          <Input
            placeholder="New York, NY"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            value={item.location || ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </Field>
        <Field label="Website / Portfolio" icon={Globe} type="url">
          <Input
            placeholder="portfolio.com"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            type="url"
            value={item.website || ""}
            onChange={(e) => update("website", e.target.value)}
          />
        </Field>
        <Field label="LinkedIn" icon={Link} type="url">
          <Input
            placeholder="linkedin.com/in/username"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            type="url"
            value={item.linkedin || ""}
            onChange={(e) => update("linkedin", e.target.value)}
          />
        </Field>
        <Field label="GitHub" icon={Code2} type="url">
          <Input
            placeholder="github.com/username"
            className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
            type="url"
            value={item.github || ""}
            onChange={(e) => update("github", e.target.value)}
          />
        </Field>
      </div>

      {/* Add details section */}
      <div className="pt-4 md:pt-6 border-t space-y-3 md:space-y-4">
        <h3 className="text-sm font-semibold">Add details</h3>

        {/* Initial detail buttons */}
        <div className="flex flex-wrap gap-2 md:gap-2">
          {visiblePersonalDetails.map((detail) => {
            const isActive = !!item[detail.key as keyof HeaderItem];
            return (
              <DetailsButton
                key={detail.key}
                option={detail}
                isActive={isActive}
                onClick={() => toggleField(detail.key as keyof HeaderItem)}
              />
            );
          })}

          {!showMoreDetails && (
            <button
              onClick={() => setShowMoreDetails(true)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              Show More
            </button>
          )}
        </div>

        {/* Expanded details */}
        {showMoreDetails && (
          <div className="space-y-3 md:space-y-4 py-3 md:py-4 animate-in fade-in duration-300 border-t pt-3 md:pt-4">
            {/* Personal details section */}
            <div className="space-y-2 md:space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Personal details</p>
              <div className="flex flex-wrap gap-2">
                {allPersonalDetails.map((detail) => {
                  const isActive = !!item[detail.key as keyof HeaderItem];
                  return (
                    <DetailsButton
                      key={detail.key}
                      option={detail}
                      isActive={isActive}
                      onClick={() => toggleField(detail.key as keyof HeaderItem)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Social profiles section */}
            <div className="space-y-2 md:space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Links / Social profiles</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PROFILES.map((profile) => {
                  const isActive = !!item[profile.key as keyof HeaderItem];
                  return (
                    <DetailsButton
                      key={profile.key}
                      option={profile}
                      isActive={isActive}
                      onClick={() => toggleField(profile.key as keyof HeaderItem)}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowMoreDetails(false)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              Show Less
            </button>
          </div>
        )}

        {/* Active fields grid */}
        {(activePersonalDetails.length > 0 || activeSocialProfiles.length > 0) && (
          <div className="pt-4 md:pt-6 border-t space-y-4 md:space-y-6">
            {/* Personal details fields */}
            {activePersonalDetails.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Personal details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                  {activePersonalDetails.map((detail) => {
                    const inputType = getInputType(detail.key);
                    const placeholder = getPlaceholder(detail.label, detail.key);
                    return (
                      <Field
                        key={detail.key}
                        label={detail.label}
                        icon={detail.icon || User}
                        onRemove={() => removeField(detail.key as keyof HeaderItem)}
                        type={inputType}
                      >
                        <Input
                          type={inputType}
                          placeholder={placeholder}
                          className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
                          value={item[detail.key as keyof HeaderItem] || ""}
                          onChange={(e) => update(detail.key as keyof HeaderItem, e.target.value)}
                        />
                      </Field>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social profiles fields */}
            {activeSocialProfiles.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase">Links / Social profiles</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                  {activeSocialProfiles.map((profile) => (
                    <Field
                      key={profile.key}
                      label={profile.label}
                      icon={profile.icon || Link}
                      onRemove={() => removeField(profile.key as keyof HeaderItem)}
                      type="url"
                    >
                      <Input
                        type="url"
                        placeholder={`${profile.label} URL or username`}
                        className="h-8 md:h-9 text-xs focus-visible:ring-1 w-full"
                        value={item[profile.key as keyof HeaderItem] || ""}
                        onChange={(e) => update(profile.key as keyof HeaderItem, e.target.value)}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
