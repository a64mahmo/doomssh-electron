'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import {
  ResumeSettings, HeaderAlignment, NameSize, DetailsArrangement,
  DetailsTextAlignment, HeaderArrangement, ContactIconStyle,
  PhotoSize, PhotoShape, PhotoPosition, PhotoAlignment, PhotoVerticalAlign,
  PhotoBorderStyle
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
  SegmentGroup,
  ToggleRow,
} from '@/components/editor/EditorPrimitives'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Circle,
  Square,
  SquareDot,
  Minus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { VisualSegmentGroup } from '../CustomizePrimitives'
import { SliderRow } from '@/components/editor/EditorPrimitives'

interface HeaderSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

export function HeaderSection({ s, upd }: HeaderSectionProps) {
  return (
    <>
      <ControlGroup title="Header Layout">
        <div>
          <FieldLabel>Text Alignment</FieldLabel>
          <VisualSegmentGroup
            columns={3}
            value={s.headerAlignment}
            onChange={(v) => {
              const align = v as HeaderAlignment
              const updates: Partial<ResumeSettings> = { 
                headerAlignment: align,
                detailsTextAlignment: align // Default text align to match header align
              }
              // Structural Rules:
              if (align === 'center') {
                if (s.detailsArrangement === 'grid') updates.detailsArrangement = 'column'
                if (s.photoPosition === 'beside') updates.photoPosition = 'top'
                updates.detailsPosition = 'below'
              } else {
                updates.photoPosition = 'beside'
              }
              upd(updates)
            }}
            options={[
              { 
                value: 'left',   
                label: 'Left',   
                render: () => (
                  <div className="flex flex-col gap-1.5 w-10">
                    <div className="h-1.5 w-full bg-current rounded-sm" />
                    <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                  </div>
                ) 
              },
              { 
                value: 'center', 
                label: 'Center', 
                render: () => (
                  <div className="flex flex-col items-center gap-1.5 w-10">
                    <div className="h-1.5 w-full bg-current rounded-sm" />
                    <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                  </div>
                ) 
              },
              { 
                value: 'right', 
                label: 'Right', 
                render: () => (
                  <div className="flex flex-col items-end gap-1.5 w-10">
                    <div className="h-1.5 w-full bg-current rounded-sm" />
                    <div className="h-1 w-2/3 bg-current opacity-40 rounded-sm" />
                  </div>
                ) 
              },
            ]}
          />
        </div>

        {s.headerAlignment !== 'center' && (
          <ToggleRow 
            id="details-pos" 
            label="Details beside name" 
            description="Put contact info next to your name instead of below it"
            checked={s.detailsPosition === 'beside'} 
            onCheckedChange={(v) => {
              const pos = v ? 'beside' : 'below'
              const updates: Partial<ResumeSettings> = { detailsPosition: pos }
              if (pos === 'beside' && s.detailsArrangement === 'wrap') {
                updates.detailsArrangement = 'column'
              }
              upd(updates)
            }}
          />
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <FieldLabel>Name Size</FieldLabel>
            <Select value={s.nameSize} onValueChange={(v) => upd({ nameSize: v as NameSize })}>
              <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="XS">Executive (XS)</SelectItem>
                <SelectItem value="S">Small (S)</SelectItem>
                <SelectItem value="M">Medium (M)</SelectItem>
                <SelectItem value="L">Large (L)</SelectItem>
                <SelectItem value="XL">Extra Large (XL)</SelectItem>
                <SelectItem value="XXL">Hero (XXL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <ToggleRow id="name-bold" label="Bold Name" checked={s.nameBold} onCheckedChange={(v) => upd({ nameBold: v })} />
          </div>
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Contact Details">
        <div>
          <FieldLabel>Details Arrangement</FieldLabel>
          <VisualSegmentGroup
            columns={s.detailsPosition === 'beside' ? 2 : 3}
            value={s.detailsArrangement}
            onChange={(v) => upd({ detailsArrangement: v as DetailsArrangement })}
            options={[
              { 
                value: 'column', 
                label: 'Stack', 
                render: () => (
                  <div className="flex flex-col gap-1 w-8">
                    <div className="h-1 w-full bg-current opacity-60 rounded-full" />
                    <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                    <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                  </div>
                ) 
              },
              ...(s.detailsPosition !== 'beside' ? [
                { 
                  value: 'wrap' as DetailsArrangement, 
                  label: 'Wrap', 
                  render: () => (
                    <div className="flex flex-col gap-1 w-10 px-1">
                      <div className="flex gap-1">
                        <div className="h-1 w-1/2 bg-current opacity-60 rounded-full" />
                        <div className="h-1 w-1/2 bg-current opacity-40 rounded-full" />
                      </div>
                      <div className="h-1 w-1/3 bg-current opacity-20 rounded-full" />
                    </div>
                  ) 
                }
              ] : []),
              { 
                value: 'grid', 
                label: 'Grid', 
                render: () => (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-10 px-1">
                    <div className="h-1 w-full bg-current opacity-60 rounded-full" />
                    <div className="h-1 w-full bg-current opacity-40 rounded-full" />
                    <div className="h-1 w-full bg-current opacity-30 rounded-full" />
                    <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                  </div>
                ) 
              },
            ]}
          />
        </div>

        <div>
          <FieldLabel>Details Text Alignment</FieldLabel>
          <SegmentGroup
            value={s.detailsTextAlignment}
            onChange={(v) => upd({ detailsTextAlignment: v as DetailsTextAlignment })}
            options={[
              { value: 'left',   label: 'Left',   render: () => <AlignLeft   size={14} /> },
              { value: 'center', label: 'Center', render: () => <AlignCenter size={14} /> },
              { value: 'right',  label: 'Right',  render: () => <AlignRight  size={14} /> },
            ]}
          />
        </div>

        <div>
          <FieldLabel>Delimiter</FieldLabel>
          <VisualSegmentGroup
            columns={4}
            value={s.headerArrangement}
            onChange={(v) => {
              const arr = v as HeaderArrangement
              const updates: Partial<ResumeSettings> = { headerArrangement: arr }
              if (arr === 'icon') updates.contactIcons = true
              upd(updates)
            }}
            options={[
              { 
                value: 'icon', 
                label: 'Icon', 
                render: () => (
                  <div className="flex flex-col items-center gap-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 opacity-70"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg>
                    <span className="text-[9px] font-bold">Icon</span>
                  </div>
                ) 
              },
              { 
                value: 'bullet', 
                label: 'Bullet', 
                render: () => (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="size-1.5 rounded-full bg-current opacity-70" />
                    <span className="text-[9px] font-bold">Bullet</span>
                  </div>
                ) 
              },
              { 
                value: 'verticalBar', 
                label: 'Bar', 
                render: () => (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold opacity-70">|</span>
                    <span className="text-[9px] font-bold">Bar</span>
                  </div>
                ) 
              },
              { 
                value: 'none', 
                label: 'None', 
                render: () => (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold opacity-30">Off</span>
                    <span className="text-[9px] font-bold">None</span>
                  </div>
                ) 
              },
            ]}
            showLabel={false}
          />
        </div>

        <div className="space-y-3 pt-2">
          <ToggleRow
            id="contact-icons"
            label="Show Icons"
            checked={s.contactIcons}
            onCheckedChange={(v) => upd({ contactIcons: v })}
          />

          {s.contactIcons && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <FieldLabel>Icon Style</FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'none',             label: 'None' },
                  { id: 'circle-filled',    label: 'Circle', frame: 'circle' },
                  { id: 'rounded-filled',   label: 'Round',  frame: 'rounded' },
                  { id: 'square-filled',    label: 'Square', frame: 'square' },
                  { id: 'circle-outline',   label: 'C-Out',  frame: 'circle', outline: true },
                  { id: 'rounded-outline',  label: 'R-Out',  frame: 'rounded', outline: true },
                  { id: 'square-outline',   label: 'S-Out',  frame: 'square', outline: true },
                ].map((style) => {
                  const active = s.contactIconStyle === style.id
                  const baseIcon = (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
                      <path d="M11.767 3.166a6.411 6.411 0 019.067 9.067l-.001.001-1.716 1.717a1.558 1.558 0 11-2.204-2.204l1.717-1.717a3.295 3.295 0 10-4.659-4.66l-.002.002-1.716 1.716a1.558 1.558 0 01-2.204-2.204l1.717-1.717z" />
                    </svg>
                  )

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => upd({ contactIconStyle: style.id as ContactIconStyle })}
                      className="group flex flex-col items-center gap-1 cursor-pointer outline-none"
                    >
                      <div className={cn(
                        "w-full h-10 flex items-center justify-center rounded-xl border transition-all duration-200 relative overflow-hidden",
                        active 
                          ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_1px_inset_rgba(var(--primary),0.1)]" 
                          : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:border-border hover:bg-muted/40"
                      )}>
                        {style.id === 'none' ? (
                          baseIcon
                        ) : (
                          <div className={cn(
                            "size-5 flex items-center justify-center",
                            style.frame === 'circle' && "rounded-full",
                            style.frame === 'rounded' && "rounded-[3px]",
                            style.frame === 'square' && "rounded-none",
                            style.outline 
                              ? "border border-current bg-transparent" 
                              : "bg-current"
                          )}>
                            <div className={cn("scale-75", !style.outline && (active ? "text-primary-foreground" : "text-background"))}>
                              {baseIcon}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-tight transition-colors",
                        active ? "text-primary" : "text-muted-foreground/40"
                      )}>
                        {style.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Photo">
        <ToggleRow 
          id="show-photo" 
          label="Show Photo" 
          description="Display your profile photo in the header"
          checked={s.photoEnabled} 
          onCheckedChange={(v) => upd({ photoEnabled: v })}
        />

        {s.photoEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Size</FieldLabel>
                <SegmentGroup
                  value={s.photoSize}
                  onChange={(v) => upd({ photoSize: v as PhotoSize })}
                  options={[
                    { value: 'XS', label: 'XS', render: () => <span className="text-[9px] font-bold">XS</span> },
                    { value: 'S',  label: 'S',  render: () => <span className="text-[10px] font-bold">S</span> },
                    { value: 'M',  label: 'M',  render: () => <span className="text-[10px] font-bold">M</span> },
                    { value: 'L',  label: 'L',  render: () => <span className="text-[11px] font-bold">L</span> },
                    { value: 'XL', label: 'XL', render: () => <span className="text-[11px] font-bold">XL</span> },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Shape</FieldLabel>
                <SegmentGroup
                  value={s.photoShape}
                  onChange={(v) => upd({ photoShape: v as PhotoShape })}
                  options={[
                    { value: 'circle',  label: 'Circle',  render: () => <Circle size={12} className="opacity-50" /> },
                    { value: 'rounded', label: 'Round',   render: () => <SquareDot size={12} className="opacity-50" /> },
                    { value: 'square',  label: 'Square',  render: () => <Square size={12} className="opacity-50" /> },
                  ]}
                />
              </div>
            </div>

            {s.headerAlignment === 'center' && (
              <div>
                <FieldLabel>Position</FieldLabel>
                <SegmentGroup
                  value={s.photoPosition === 'beside' ? 'top' : s.photoPosition}
                  onChange={(v) => upd({ photoPosition: v as PhotoPosition })}
                  options={[
                    { value: 'top',    label: 'Above', render: () => <span className="text-[10px] font-bold">Above</span> },
                    { value: 'bottom', label: 'Below', render: () => <span className="text-[10px] font-bold">Below</span> },
                  ]}
                />
              </div>
            )}

            {s.headerAlignment !== 'center' && (
              <>
                <div>
                  <FieldLabel>Horizontal Alignment</FieldLabel>
                  <SegmentGroup
                    value={s.photoAlignment}
                    onChange={(v) => upd({ photoAlignment: v as PhotoAlignment })}
                    options={[
                      { value: 'left',   label: 'Left',   render: () => <AlignLeft size={14} /> },
                      { value: 'center', label: 'Center', render: () => <AlignCenter size={14} /> },
                      { value: 'right',  label: 'Right',  render: () => <AlignRight size={14} /> },
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel>Vertical Alignment</FieldLabel>
                  <SegmentGroup
                    value={s.photoVerticalAlign}
                    onChange={(v) => upd({ photoVerticalAlign: v as PhotoVerticalAlign })}
                    options={[
                      { value: 'top',    label: 'Top',    render: () => <AlignVerticalJustifyStart size={14} /> },
                      { value: 'center', label: 'Center', render: () => <AlignVerticalJustifyCenter size={14} /> },
                      { value: 'bottom', label: 'Bottom', render: () => <AlignVerticalJustifyEnd size={14} /> },
                    ]}
                  />
                </div>
              </>
            )}

            <SliderRow
              id="photo-gap"
              label="Gap"
              description="Space between photo and text"
              value={s.photoGap}
              min={0}
              max={32}
              step={2}
              unit="pt"
              onChange={(v) => upd({ photoGap: v })}
            />

            <div>
              <FieldLabel>Border Style</FieldLabel>
              <SegmentGroup
                value={s.photoBorderStyle}
                onChange={(v) => upd({ photoBorderStyle: v as PhotoBorderStyle })}
                options={[
                  { value: 'none',   label: 'None',   render: () => <Minus size={12} className="opacity-40" /> },
                  { value: 'thin',   label: 'Thin',   render: () => <div className="w-4 h-4 border border-current opacity-40 rounded-[2px]" /> },
                  { value: 'medium', label: 'Medium', render: () => <div className="w-4 h-4 border-2 border-current opacity-40 rounded-[2px]" /> },
                  { value: 'thick',  label: 'Thick',  render: () => <div className="w-4 h-4 border-[3px] border-current opacity-40 rounded-[2px]" /> },
                ]}
              />
            </div>
          </motion.div>
        )}
      </ControlGroup>

      <Separator className="opacity-30" />

      <ControlGroup title="Footer">
        <div className="space-y-0.5">
          <ToggleRow id="footer-pages" label="Page numbers"   checked={s.footerPageNumbers} onCheckedChange={(v) => upd({ footerPageNumbers: v })} />
          <ToggleRow id="footer-name"  label="Name in footer" checked={s.footerName}        onCheckedChange={(v) => upd({ footerName: v })} />
          <ToggleRow id="footer-email" label="Email in footer" checked={s.footerEmail}      onCheckedChange={(v) => upd({ footerEmail: v })} />
        </div>
      </ControlGroup>
    </>
  )
}
