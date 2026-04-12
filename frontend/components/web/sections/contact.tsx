import React from "react";
import { cn } from "@/lib/utils";
import type { HeaderData } from "@/lib/store/types";
import type { TemplateCtx } from "@/lib/pdf/templateCtx";
import { BsIcon } from "@/lib/icons/BsIcon";
import { DEFAULT_CONTACT_ICONS } from "@/lib/icons/bootstrapIcons";

function ContactItem({
  iconName,
  value,
  ctx,
  textColorOverride,
}: {
  iconName?: string;
  value: string;
  ctx: TemplateCtx;
  textColorOverride?: string;
}) {
  const { colors, s, pt } = ctx;
  const isBlue = s.linkBlue;
  const isUnderline = s.linkUnderline;
  const showIcons = s.contactIcons;
  const iconStyle = s.contactIconStyle || "none";

  const defaultText = s.themeColorStyle === "advanced" ? colors.background : colors.text;
  const finalTextColor = isBlue ? "#2563eb" : (textColorOverride || defaultText);
  const finalIconColor = isBlue ? "#2563eb" : (s.applyAccentHeaderIcons ? (s.themeColorStyle === "advanced" ? colors.background : colors.accent) : finalTextColor);

  return (
    <div className="flex items-center whitespace-nowrap group gap-[6px]">
      {showIcons && iconName && (
        <div
          className={cn(
            "flex items-center justify-center shrink-0",
            iconStyle === "circle-filled" && "rounded-full",
            iconStyle === "rounded-filled" && "rounded-[3px]",
            iconStyle === "square-filled" && "rounded-none",
            iconStyle === "circle-outline" &&
              "rounded-full border border-current",
            iconStyle === "rounded-outline" &&
              "rounded-[3px] border border-current",
            iconStyle === "square-outline" &&
              "rounded-none border border-current",
            iconStyle.includes("filled")
              ? "size-[18px]"
              : iconStyle.includes("outline")
                ? "size-[18px]"
                : "",
          )}
          style={{
            color: finalIconColor,
            backgroundColor: iconStyle.includes("filled")
              ? finalIconColor
              : "transparent",
          }}
        >
          <BsIcon
            name={iconName}
            size={iconStyle === "none" ? 12 : 10}
            className={cn(
              "shrink-0",
              iconStyle.includes("filled") ? "text-white" : "",
            )}
          />
        </div>
      )}
      <span
        className={cn(
          "text-muted-foreground print:text-black transition-all",
          isBlue && "text-blue-600",
          isUnderline && "border-b border-current/30 hover:border-current",
        )}
        style={{
          fontSize: pt(ctx.base * 0.85),
          color: finalTextColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ContactLine({
  h,
  ctx,
  alignOverride,
  textColorOverride,
}: {
  h: HeaderData;
  ctx: TemplateCtx;
  alignOverride?: "left" | "center" | "right";
  textColorOverride?: string;
}) {
  const { s, pt, base, colors } = ctx;
  const parts = [
    { val: h.email, key: "email" },
    { val: h.phone, key: "phone" },
    { val: h.secondPhone, key: "secondPhone" },
    { val: h.location, key: "location" },
    { val: h.website, key: "website" },
    { val: h.linkedin, key: "linkedin" },
    { val: h.github, key: "github" },
    { val: h.gitlab, key: "gitlab" },
    { val: h.bitbucket, key: "bitbucket" },
    { val: h.stackoverflow, key: "stackoverflow" },
    { val: h.twitter, key: "twitter" },
    { val: h.bluesky, key: "bluesky" },
    { val: h.threads, key: "threads" },
    { val: h.mastodon, key: "mastodon" },
    { val: h.instagram, key: "instagram" },
    { val: h.facebook, key: "facebook" },
    { val: h.youtube, key: "youtube" },
    { val: h.tiktok, key: "tiktok" },
    { val: h.pinterest, key: "pinterest" },
    { val: h.reddit, key: "reddit" },
    { val: h.discord, key: "discord" },
    { val: h.medium, key: "medium" },
    { val: h.behance, key: "behance" },
    { val: h.dribbble, key: "dribbble" },
    { val: h.nationality, key: "nationality" },
    { val: h.dateOfBirth, key: "dateOfBirth" },
    { val: h.genderPronoun, key: "genderPronoun" },
    { val: h.maritalStatus, key: "maritalStatus" },
    { val: h.visa, key: "visa" },
    { val: h.passportOrId, key: "passportOrId" },
    { val: h.drivingLicense, key: "drivingLicense" },
    { val: h.availability, key: "availability" },
    { val: h.workMode, key: "workMode" },
    { val: h.relocation, key: "relocation" },
    { val: h.expectedSalary, key: "expectedSalary" },
    { val: h.securityClearance, key: "securityClearance" },
    { val: h.militaryService, key: "militaryService" },
    { val: h.disability, key: "disability" },
  ].filter((p) => p.val && p.val.trim());

  if (!parts.length) return null;

  const arrangement = s.detailsArrangement || "wrap";
  const align = s.headerAlignment;
  const textAlign = alignOverride || s.detailsTextAlignment || align;
  const isCenter = textAlign === "center";
  const isRight = textAlign === "right";
  const delimiter = s.headerArrangement;

  if (arrangement === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-y-2 w-full",
          isCenter
            ? "mx-auto w-fit gap-x-10"
            : isRight
              ? "gap-x-10 justify-items-end"
              : "gap-x-10 justify-items-start",
        )}
      >
        {parts.map((p, i) => (
          <ContactItem
            key={i}
            value={p.val!}
            iconName={DEFAULT_CONTACT_ICONS[p.key]}
            ctx={ctx}
            textColorOverride={textColorOverride}
          />
        ))}
      </div>
    );
  }

  const hasVisibleDelimiter = delimiter === "bullet" || delimiter === "verticalBar";
  const horizontalGap = s.detailsSpacing === "comfortable" ? "12pt" : "8pt";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-y-1 w-full",
        arrangement === "column" ? "flex-col" : "flex-row items-center",
        arrangement === "wrap" &&
          (isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"),
        arrangement === "column" &&
          (isCenter ? "items-center" : isRight ? "items-end" : "items-start"),
      )}
      style={{
        columnGap: !hasVisibleDelimiter ? horizontalGap : 0,
      }}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              "flex items-center",
              arrangement === "column" && "w-full",
              arrangement === "column" && (isCenter ? "justify-center" : isRight ? "justify-end" : "justify-start"),
            )}
          >
            <ContactItem
              value={p.val!}
              iconName={DEFAULT_CONTACT_ICONS[p.key]}
              ctx={ctx}
              textColorOverride={textColorOverride}
            />
          </div>
          {arrangement === "wrap" && i < parts.length - 1 && hasVisibleDelimiter && (
            <span
              className="self-center flex items-center justify-center shrink-0"
              style={{
                fontSize: pt(base * 0.8),
                width: s.detailsSpacing === "comfortable" ? "24pt" : "16pt",
                color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text,
                opacity: 0.3,
              }}
            >
              {delimiter === "bullet" ? "•" : "|"}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
