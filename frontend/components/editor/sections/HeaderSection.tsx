'use client'
import { useSection } from '@/hooks/useResume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HeaderItem } from '@/lib/store/types'

interface Props { sectionId: string }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function HeaderSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const item = (section?.items as HeaderItem) || {}

  function update(field: keyof HeaderItem, value: string) {
    updateItems({ ...item, [field]: value })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Full Name">
          <Input className="h-8 text-xs" value={item.fullName || ''} onChange={(e) => update('fullName', e.target.value)} />
        </Field>
        <Field label="Job Title">
          <Input className="h-8 text-xs" value={item.jobTitle || ''} onChange={(e) => update('jobTitle', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Email">
          <Input className="h-8 text-xs" type="email" value={item.email || ''} onChange={(e) => update('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input className="h-8 text-xs" value={item.phone || ''} onChange={(e) => update('phone', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Location">
          <Input className="h-8 text-xs" value={item.location || ''} onChange={(e) => update('location', e.target.value)} />
        </Field>
        <Field label="Website">
          <Input className="h-8 text-xs" value={item.website || ''} onChange={(e) => update('website', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="LinkedIn">
          <Input className="h-8 text-xs" value={item.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} />
        </Field>
        <Field label="GitHub">
          <Input className="h-8 text-xs" value={item.github || ''} onChange={(e) => update('github', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}
