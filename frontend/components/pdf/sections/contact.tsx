import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import type { HeaderData } from '@/lib/store/types'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'
import { BsIconPDF } from '@/lib/icons/BsIconPDF'
import { DEFAULT_CONTACT_ICONS } from '@/lib/icons/bootstrapIcons'

function ContactItemPDF({
  iconName,
  value,
  ctx,
  itemStyleOverrides,
  textColorOverride,
}: {
  iconName?: string;
  value: string;
  ctx: TemplateCtx;
  itemStyleOverrides?: any;
  textColorOverride?: string;
}) {
  const { colors, s, pt, base, lh } = ctx
  const isBlue = s.linkBlue
  const showIcons = s.contactIcons
  const iconStyle = s.contactIconStyle || 'none'

  const defaultText = s.themeColorStyle === 'advanced' ? colors.background : colors.text;
  const finalTextColor = isBlue ? '#2563eb' : (textColorOverride || defaultText);
  const finalIconColor = isBlue ? "#2563eb" : (s.applyAccentHeaderIcons ? (s.themeColorStyle === 'advanced' ? colors.background : colors.accent) : finalTextColor);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...itemStyleOverrides }}>
      {showIcons && iconName && (
        <View style={{
          marginRight: 6,
          alignItems: 'center',
          justifyContent: 'center',
          ...(iconStyle === 'circle-filled' && { borderRadius: 999 }),
          ...(iconStyle === 'rounded-filled' && { borderRadius: 2 }),
          ...(iconStyle === 'square-filled' && { borderRadius: 0 }),
          ...(iconStyle === 'circle-outline' && { borderRadius: 999, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle === 'rounded-outline' && { borderRadius: 2, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle === 'square-outline' && { borderRadius: 0, borderWidth: 0.5, borderColor: finalIconColor }),
          ...(iconStyle.includes('filled') ? {
            width: 13,
            height: 13,
            backgroundColor: finalIconColor
          } : (iconStyle.includes('outline') ? {
            width: 13,
            height: 13,
            backgroundColor: 'transparent'
          } : {}))
        }}>
          <BsIconPDF
            name={iconName}
            size={iconStyle === 'none' ? 11 : 8}
            color={iconStyle.includes('filled') ? '#ffffff' : finalIconColor}
          />
        </View>
      )}
      <Text
        style={{
          fontSize: pt(base * 0.85),
          color: finalTextColor,
          lineHeight: lh,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

export function ContactLinePDF({
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

  if (arrangement === 'grid') {
    const rows: typeof parts[] = []
    for (let i = 0; i < parts.length; i += 2) {
      rows.push(parts.slice(i, i + 2))
    }
    return (
      <View style={{
        alignItems: isCenter ? 'center' : (isRight ? 'flex-end' : 'flex-start'),
        width: '100%'
      }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{
            flexDirection: 'row',
            marginBottom: ri < rows.length - 1 ? 4 : 0,
            justifyContent: isCenter ? 'center' : (isRight ? 'flex-end' : 'flex-start'),
            width: isCenter ? 'auto' : '100%'
          }}>
            {row.map((p, ci) => (
              <ContactItemPDF
                key={ci}
                value={p.val!}
                iconName={DEFAULT_CONTACT_ICONS[p.key]}
                ctx={ctx}
                itemStyleOverrides={{
                  width: isCenter ? 'auto' : '50%',
                  marginRight: (isCenter && ci === 0) ? 20 : 0
                }}
                textColorOverride={textColorOverride}
              />
            ))}
          </View>
        ))}
      </View>
    )
  }

  const sep = delimiter === 'bullet' ? '•' : delimiter === 'verticalBar' ? '|' : ''
  const hasVisibleDelimiter = !!sep;
  const horizontalGap = s.detailsSpacing === "comfortable" ? 12 : 8;

  return (
    <View
      style={{
        flexDirection: arrangement === "column" ? "column" : "row",
        flexWrap: arrangement === "column" ? "nowrap" : "wrap",
        width: "100%",
        justifyContent: isCenter
          ? "center"
          : isRight
            ? "flex-end"
            : "flex-start",
        alignItems: isCenter ? "center" : isRight ? "flex-end" : "flex-start",
      }}
    >
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              ...(arrangement === "column" ? {
                width: "100%",
                justifyContent: isCenter
                  ? "center"
                  : isRight
                    ? "flex-end"
                    : "flex-start",
              } : {
                marginRight: (!hasVisibleDelimiter && i < parts.length - 1) ? horizontalGap : 0
              }),
            }}
          >
            <ContactItemPDF
              value={p.val!}
              iconName={DEFAULT_CONTACT_ICONS[p.key]}
              ctx={ctx}
              itemStyleOverrides={{
                marginBottom:
                  arrangement === "column" && i < parts.length - 1 ? 4 : 2,
              }}
              textColorOverride={textColorOverride}
            />
          </View>
          {arrangement === "wrap" && i < parts.length - 1 && hasVisibleDelimiter && (
            <View
              style={{
                width: s.detailsSpacing === "comfortable" ? 24 : 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: pt(base * 0.8), color: s.applyAccentDotsBarsBubbles ? colors.accent : colors.text, opacity: 0.3 }}>
                {sep}
              </Text>
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
