'use client'
import { Building, Calendar, Mail, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel, ControlGroup } from '@/components/editor/EditorPrimitives'
import { useResumeStore } from '@/lib/store/resumeStore'

export function RecipientCard() {
  const cl = useResumeStore(s => s.resume?.coverLetter)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)

  if (!cl) return null

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ControlGroup title="Date & Timing">
        <div className="max-w-[240px]">
          <FieldLabel>Letter Date</FieldLabel>
          <div className="relative">
            <Input
              type="date"
              value={cl.date}
              onChange={(e) => updateCoverLetter({ date: e.target.value })}
              className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl pl-10"
            />
            <Calendar size={14} className="absolute left-3.5 bottom-3 text-muted-foreground/40" />
          </div>
        </div>
      </ControlGroup>

      <ControlGroup title="Target Recipient">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2 md:col-span-1">
            <FieldLabel>Contact Person</FieldLabel>
            <div className="relative">
              <Input
                value={cl.recipient.hrName}
                onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, hrName: e.target.value } })}
                placeholder="Hiring Manager"
                className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl pl-10"
              />
              <Mail size={14} className="absolute left-3.5 bottom-3 text-muted-foreground/40" />
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <FieldLabel>Company Name</FieldLabel>
            <div className="relative">
              <Input
                value={cl.recipient.company}
                onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, company: e.target.value } })}
                placeholder="Target Company"
                className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl pl-10"
              />
              <Building size={14} className="absolute left-3.5 bottom-3 text-muted-foreground/40" />
            </div>
          </div>
          <div className="col-span-2">
            <FieldLabel>Office Address</FieldLabel>
            <div className="relative">
              <Textarea
                rows={3}
                value={cl.recipient.address}
                onChange={(e) => updateCoverLetter({ recipient: { ...cl.recipient, address: e.target.value } })}
                placeholder="123 Corporate Blvd, City, State"
                className="text-xs bg-muted/20 border-border/50 rounded-xl pl-10 min-h-[80px] pt-3 resize-none"
              />
              <MapPin size={14} className="absolute left-3.5 top-3.5 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      </ControlGroup>
    </div>
  )
}
