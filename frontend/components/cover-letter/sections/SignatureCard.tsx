'use client'
import { useRef } from 'react'
import { PenLine, X, Image as ImageIcon, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FieldLabel, ControlGroup } from '@/components/editor/EditorPrimitives'
import { useResumeStore } from '@/lib/store/resumeStore'
import { toast } from 'sonner'

export function SignatureCard() {
  const cl = useResumeStore(s => s.resume?.coverLetter)
  const updateCoverLetter = useResumeStore(s => s.updateCoverLetter)
  const sigInputRef = useRef<HTMLInputElement>(null)

  if (!cl) return null

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const valid = ['image/png', 'image/jpeg', 'image/webp']
    if (!valid.includes(file.type)) {
      toast.error('Use PNG, JPEG, or WEBP')
      return
    }
    if (file.size > 1024 * 1024) {
      toast.error('Signature image must be under 1 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (cl) {
        updateCoverLetter({
          signature: { ...cl.signature, image: reader.result as string },
        })
      }
    }
    reader.readAsDataURL(file)
  }

  function clearSignatureImage() {
    if (!cl) return
    const { image, ...rest } = cl.signature
    updateCoverLetter({ signature: rest })
    if (sigInputRef.current) sigInputRef.current.value = ''
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      <ControlGroup title="Closing & Details">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2">
            <FieldLabel>Sign-off Name</FieldLabel>
            <Input
              value={cl.signature.fullName}
              onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, fullName: e.target.value } })}
              placeholder="Your Full Name"
              className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
          <div>
            <FieldLabel>Location (Place)</FieldLabel>
            <Input
              value={cl.signature.place}
              onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, place: e.target.value } })}
              placeholder="New York, NY"
              className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
          <div>
            <FieldLabel>Signing Date</FieldLabel>
            <div className="relative">
              <Input
                type="date"
                value={cl.signature.date}
                onChange={(e) => updateCoverLetter({ signature: { ...cl.signature, date: e.target.value } })}
                className="h-10 text-xs bg-muted/20 border-border/50 rounded-xl pl-10"
              />
              <Calendar size={14} className="absolute left-3.5 bottom-3 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      </ControlGroup>

      <ControlGroup title="Visual Signature">
        <div className="space-y-4">
          <input
            ref={sigInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleSignatureUpload}
            className="hidden"
          />
          {cl.signature.image ? (
            <div className="relative flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/10 group/sig shadow-sm">
              <div className="w-24 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner border border-border/50 overflow-hidden">
                <img
                  src={cl.signature.image}
                  alt="Signature preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-bold text-foreground">Signature Image Uploaded</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  This image will be placed above your typed name in the exported PDF.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSignatureImage}
                className="h-8 w-8 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => sigInputRef.current?.click()}
              className="w-full h-28 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ImageIcon size={20} className="text-muted-foreground/40 group-hover:text-primary/60" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary/70 block mb-0.5">Upload Digital Signature</span>
                <span className="text-[9px] text-muted-foreground/40">PNG, JPEG or WEBP (Max 1MB)</span>
              </div>
            </button>
          )}
        </div>
      </ControlGroup>
    </div>
  )
}
