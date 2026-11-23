'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, AtSign, Hash } from 'lucide-react'
import type { ResumeSettings } from '@/lib/store/types'
import { ControlGroup, FieldLabel } from '@/components/editor/EditorPrimitives'
import { Separator } from '@/components/ui/separator'
import { VisualSegmentGroup } from '../CustomizePrimitives'
import { CustomFooterEditor, customFooterUpdates } from './CustomFooterEditor'
import { FooterSketch, DividerSketch, FooterChip } from './FooterVisuals'
import { detectFooterPreset, footerPresetUpdates, type FooterPreset } from '@/lib/utils/footer'

/** Same open as the other settings that appear on demand, plus a matching close. */
const REVEAL = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
} as const

interface FooterSectionProps {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}

/** Style → Footer: what the bottom of every page shows, and how it looks. */
export function FooterSection({ s, upd }: FooterSectionProps) {
  const preset = detectFooterPreset(s)
  const showPageNumbers = s.footerPageNumbers && !s.footerCustom

  return (
    <>
      <ControlGroup title="Footer Layout">
        <VisualSegmentGroup
          columns={3}
          showLabel={true}
          value={preset ?? ('' as FooterPreset)}
          onChange={(v) => upd(v === 'custom' ? customFooterUpdates(s, true) : footerPresetUpdates(v as Exclude<FooterPreset, 'custom'>))}
          options={[
            { value: 'off',       label: 'Off',      render: () => <FooterSketch off /> },
            { value: 'page',      label: 'Page',     render: () => <FooterSketch right="page" /> },
            { value: 'name-page', label: 'Name',     render: () => <FooterSketch left="name" right="page" /> },
            { value: 'full',      label: 'Full',     render: () => <FooterSketch left="name" center="email" right="page" /> },
            { value: 'centered',  label: 'Centered', render: () => <FooterSketch center="page" /> },
            { value: 'custom',    label: 'Custom',   render: () => <FooterSketch left="pen" center="pen" right="pen" /> },
          ]}
        />

        <AnimatePresence initial={false}>
          {!s.footerCustom && (
            <motion.div key="footer-items" {...REVEAL} className="overflow-hidden">
              <FieldLabel>Show in Footer</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                <FooterChip label="Show Name in Footer"  text="Name"  icon={UserRound} checked={s.footerName}        onChange={(v) => upd({ footerName: v })} />
                <FooterChip label="Show Email in Footer" text="Email" icon={AtSign}    checked={s.footerEmail}       onChange={(v) => upd({ footerEmail: v })} />
                <FooterChip label="Show Page Numbers"    text="Pages" icon={Hash}      checked={s.footerPageNumbers} onChange={(v) => upd({ footerPageNumbers: v })} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {s.footerCustom && (
            <motion.div key="custom-footer" {...REVEAL} className="overflow-hidden">
              <CustomFooterEditor s={s} upd={upd} />
            </motion.div>
          )}
        </AnimatePresence>
      </ControlGroup>

      <AnimatePresence initial={false}>
        {showPageNumbers && (
          <motion.div key="page-numbers" {...REVEAL} className="overflow-hidden space-y-8">
            <Separator className="opacity-30" />
            <ControlGroup title="Page Numbers">
              <div>
                <FieldLabel>Page Number Style</FieldLabel>
                <VisualSegmentGroup
                  columns={3}
                  showLabel={true}
                  value={s.footerPageFormat ?? 'number'}
                  onChange={(v) => upd({ footerPageFormat: v as 'number' | 'of-total' | 'page-of' })}
                  options={[
                    { value: 'number',   label: 'Number',   render: () => <span className="text-xs font-black tabular-nums">2</span> },
                    { value: 'of-total', label: 'Of Total', render: () => <span className="text-xs font-black tabular-nums">2 / 3</span> },
                    { value: 'page-of',  label: 'Words',    render: () => <span className="text-[10px] font-black tabular-nums">Page 2 of 3</span> },
                  ]}
                />
              </div>
            </ControlGroup>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {preset !== 'off' && (
          <motion.div key="footer-style" {...REVEAL} className="overflow-hidden space-y-8">
            <Separator className="opacity-30" />
            <ControlGroup title="Footer Style">
              <div>
                <FieldLabel>Footer Divider</FieldLabel>
                <VisualSegmentGroup
                  columns={2}
                  showLabel={true}
                  value={s.footerDivider ? 'line' : 'none'}
                  onChange={(v) => upd({ footerDivider: v === 'line' })}
                  options={[
                    { value: 'none', label: 'None', render: () => <DividerSketch line={false} /> },
                    { value: 'line', label: 'Line', render: () => <DividerSketch line /> },
                  ]}
                />
              </div>
            </ControlGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
