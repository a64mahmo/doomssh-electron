"use client";
import { useState } from "react";
import { useSection } from "@/hooks/useResume";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedRichTextArea } from "@/components/ui/debounced-rich-text-area";

import { useAI } from "@/hooks/useAI";
import { toast } from "sonner";
import { FieldLabel, ToggleRow, EntryCard } from "../EditorPrimitives";
import type { ExperienceItem } from "@/lib/store/types";
import { Plus, Briefcase, MapPin, Calendar, Link as LinkIcon, Building2, Sparkles, type LucideIcon } from "lucide-react";
import { generateId } from "@/lib/utils/ids";
import { MonthYearPicker } from '../MonthYearPicker'

interface Props {
  sectionId: string;
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-0.5">
        {Icon && <Icon size={12} className="text-muted-foreground/50" />}
        <FieldLabel className="mb-0">{label}</FieldLabel>
      </div>
      {children}
    </div>
  );
}

export function ExperienceSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId);
  const items = (section?.items as ExperienceItem[]) || [];
  const { improveText } = useAI();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  function add() {
    const id = generateId();
    updateItems([
      {
        id,
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        present: false,
        description: "",
      },
      ...items,
    ]);
    setOpenId(id);
  }

  function update(id: string, changes: Partial<ExperienceItem>) {
    updateItems(items.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id));
    if (openId === id) setOpenId(null);
  }

  function duplicate(id: string) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const newId = generateId();
    const copy = { ...item, id: newId };
    const idx = items.findIndex((it) => it.id === id);
    const next = [...items];
    next.splice(idx + 1, 0, copy);
    updateItems(next);
    setOpenId(newId);
  }

  async function handleAIImprove(id: string, text: string, jobTitle: string) {
    if (!text.trim()) {
      toast.error("Please enter some description first");
      return;
    }
    try {
      const improved = await improveText(text, `Job Title: ${jobTitle}`);
      update(id, { description: improved });
      toast.success("Description improved!");
    } catch {
      toast.error("Failed to improve text");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <EntryCard
            key={item.id}
            index={index}
            title={item.position || "New Position"}
            subtitle={item.company}
            isOpen={openId === item.id}
            onOpenChange={(open) => setOpenId(open ? item.id : null)}
            onRemove={() => remove(item.id)}
            onDuplicate={() => duplicate(item.id)}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Position" icon={Briefcase}>
                    <DebouncedInput
                      placeholder="e.g. Senior Software Engineer"
                      className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                      value={item.position}
                      onChange={(v) =>
                        update(item.id, { position: v })
                      }
                    />

                </Field>
                <Field label="Company" icon={Building2}>
                    <DebouncedInput
                      placeholder="e.g. Acme Corp"
                      className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                      value={item.company}
                      onChange={(v) =>
                        update(item.id, { company: v })
                      }
                    />

                </Field>
              </div>

              <Field label="Location" icon={MapPin}>
                 <DebouncedInput
                   placeholder="Remote / NYC"
                   className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                   value={item.location}
                   onChange={(v) =>
                     update(item.id, { location: v })
                   }
                 />

              </Field>
              <div className="grid grid-cols-1 gap-2">
                <Field label="Start Date" icon={Calendar}>
                  <MonthYearPicker
                    value={item.startDate}
                    onChange={(v) => update(item.id, { startDate: v })}
                  />
                </Field>
                <Field label="End Date" icon={Calendar}>
                  <MonthYearPicker
                    value={item.endDate}
                    disabled={item.present}
                    onChange={(v) => update(item.id, { endDate: v })}
                  />
                </Field>
              </div>
              <div className="pb-1 border-b border-border flex items-center justify-end">
                <ToggleRow
                  id={`present-${item.id}`}
                  label="I currently work here"
                  checked={item.present}
                  onCheckedChange={(v) => update(item.id, { present: v })}
                />
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <FieldLabel className="mb-0">
                    Description & Achievements
                  </FieldLabel>
                  <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                    <Sparkles size={10} /> AI Enhanced
                  </div>
                </div>
                 <DebouncedRichTextArea
                   placeholder="• Reduced system latency by 40% through query optimization..."
                   value={item.description}
                   onChange={(v) => update(item.id, { description: v })}
                   onAIImprove={() =>
                     handleAIImprove(item.id, item.description, item.position)
                   }
                 />

              </div>
            </div>
          </EntryCard>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={add}
        className="w-full h-12 border-dashed border-2 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
      >
        <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus size={14} className="text-foreground" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          Add Experience
        </span>
      </Button>
    </div>
  );
}
