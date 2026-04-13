'use client'
import React from 'react'
import type {
  ResumeSettings, SectionHeadingSize, SectionHeadingCapitalization,
  SectionHeadingIcon, SkillDisplayOption, ExperienceOrder, EducationOrder
} from '@/lib/store/types'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ControlGroup,
  FieldLabel,
  SliderRow,
  SegmentGroup,
  ToggleRow,
} from '@/components/editor/EditorPrimitives'
import { HEADING_STYLES, HeadingStyleButton } from '../CustomizePrimitives'

interface SectionsSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

export function SectionsSection({ s, upd }: SectionsSectionProps) {
  const headingHasLine = ['underline', 'overline', 'top-bottom', 'box'].includes(s.sectionHeadingStyle || 'underline')

  return (
    <>
      <ControlGroup title="Section Headings">
        <ToggleRow
          id="show-labels"
          label="Show section labels"
          checked={s.showSectionLabels}
          onCheckedChange={(v) => upd({ showSectionLabels: v })}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Size</FieldLabel>
            <Select value={s.sectionHeadingSize} onValueChange={(v) => upd({ sectionHeadingSize: v as SectionHeadingSize })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="S">Small</SelectItem>
                <SelectItem value="M">Medium</SelectItem>
                <SelectItem value="L">Large</SelectItem>
                <SelectItem value="XL">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Capitalization</FieldLabel>
            <Select value={s.sectionHeadingCapitalization} onValueChange={(v) => upd({ sectionHeadingCapitalization: v as SectionHeadingCapitalization })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uppercase">Uppercase</SelectItem>
                <SelectItem value="capitalize">Capitalize</SelectItem>
                <SelectItem value="none">As typed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <FieldLabel>Decoration Style</FieldLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {HEADING_STYLES.map((style) => (
              <HeadingStyleButton
                key={style.id}
                style={style}
                active={s.sectionHeadingStyle === style.id}
                onClick={() => upd({ sectionHeadingStyle: style.id })}
                accentColor={s.accentColor}
              />
            ))}
          </div>
        </div>

        {headingHasLine && (
          <SliderRow
            label="Line Thickness"
            value={s.sectionHeadingLineThickness}
            unit="pt"
            min={0.5} max={4} step={0.5}
            onChange={(v) => upd({ sectionHeadingLineThickness: v })}
          />
        )}

        <div>
          <FieldLabel>Icon</FieldLabel>
          <SegmentGroup
            value={s.sectionHeadingIcon || 'none'}
            onChange={(v) => upd({ sectionHeadingIcon: v as SectionHeadingIcon })}
            options={[
              { value: 'none',   label: 'None',   render: () => <span className="text-[10px] font-semibold leading-none">Off</span> },
              { value: 'simple', label: 'Simple', render: () => <span className="text-[10px] font-semibold leading-none">Stroke</span> },
              { value: 'filled', label: 'Filled', render: () => <span className="text-[10px] font-semibold leading-none">Fill</span> },
              { value: 'knockout', label: 'Knockout', render: () => <span className="text-[10px] font-semibold leading-none">Box</span> },
            ]}
          />
        </div>

        {(s.sectionHeadingIcon && s.sectionHeadingIcon !== 'none') && (
          <SliderRow
            label="Icon Size"
            value={s.sectionHeadingIconSize || 1.0}
            min={0.6} max={1.8} step={0.1}
            onChange={(v) => upd({ sectionHeadingIconSize: v })}
          />
        )}
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Skills">
        <div>
          <FieldLabel>Display Style</FieldLabel>
          <Select value={s.skillDisplay} onValueChange={(v) => upd({ skillDisplay: v as SkillDisplayOption })}>
            <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact (inline list)</SelectItem>
              <SelectItem value="grid">Grid (columns)</SelectItem>
              <SelectItem value="level">With Levels</SelectItem>
              <SelectItem value="bubble">Bubbles / Tags</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {s.skillDisplay === 'grid' && (
          <div>
            <FieldLabel>Grid Columns</FieldLabel>
            <SegmentGroup
              value={String(s.skillColumns ?? 3) as '2' | '3' | '4'}
              onChange={(v) => upd({ skillColumns: Number(v) as 2 | 3 | 4 })}
              options={[
                { value: '2', label: '2 cols', render: () => <span className="text-xs font-bold leading-none">2</span> },
                { value: '3', label: '3 cols', render: () => <span className="text-xs font-bold leading-none">3</span> },
                { value: '4', label: '4 cols', render: () => <span className="text-xs font-bold leading-none">4</span> },
              ]}
            />
          </div>
        )}
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Entry Order">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Experience</FieldLabel>
            <Select value={s.experienceOrder} onValueChange={(v) => upd({ experienceOrder: v as ExperienceOrder })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="title-employer">Title first</SelectItem>
                <SelectItem value="employer-title">Company first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Education</FieldLabel>
            <Select value={s.educationOrder} onValueChange={(v) => upd({ educationOrder: v as EducationOrder })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="degree-school">Degree first</SelectItem>
                <SelectItem value="school-degree">School first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Links & Misc">
        <div className="space-y-0.5">
          <ToggleRow id="link-underline"  label="Underline links"     checked={s.linkUnderline}  onCheckedChange={(v) => upd({ linkUnderline: v })} />
          <ToggleRow id="link-blue"       label="Blue links"          checked={s.linkBlue}       onCheckedChange={(v) => upd({ linkBlue: v })} />
          <ToggleRow id="group-promo"     label="Group promotions"    checked={s.groupPromotions} onCheckedChange={(v) => upd({ groupPromotions: v })}
            description="Stack same-company jobs under one heading"
          />
        </div>
      </ControlGroup>
    </>
  )
}
