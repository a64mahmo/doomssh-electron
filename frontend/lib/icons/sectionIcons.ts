import { 
  User, FileText, Briefcase, GraduationCap, Wrench, FolderCode, 
  Award, Languages, Trophy, Heart, BookOpen, Users, Settings,
  type LucideIcon 
} from "lucide-react";
import { SectionType } from "@/lib/store/types";

export type SvgElement = { 
  tag: string; 
  [key: string]: string | number | undefined;
};

export interface SectionIconDefinition {
  lucide: LucideIcon;
  pdf: SvgElement[];
}

export const SECTION_ICONS: Record<SectionType, SectionIconDefinition> = {
  header: {
    lucide: User,
    pdf: [
      { tag: 'path', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
      { tag: 'circle', cx: 12, cy: 7, r: 4 }
    ]
  },
  summary: {
    lucide: FileText,
    pdf: [
      { tag: 'path', d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' },
      { tag: 'path', d: 'M14 2v6h6' } 
    ]
  },
  experience: {
    lucide: Briefcase,
    pdf: [
      { tag: 'rect', x: 2, y: 7, width: 20, height: 14, rx: 2, ry: 2 },
      { tag: 'path', d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }
    ]
  },
  education: {
    lucide: GraduationCap,
    pdf: [
      { tag: 'path', d: 'M22 10v6M2 10l10-5 10 5-10 5z' },
      { tag: 'path', d: 'M6 12v5c3 3 9 3 12 0v-5' }
    ]
  },
  skills: {
    lucide: Wrench,
    pdf: [
      { tag: 'path', d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' }
    ]
  },
  projects: {
    lucide: FolderCode,
    pdf: [
      { tag: 'path', d: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93l-1-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z' },
      { tag: 'path', d: 'm10 11-2 2 2 2' },
      { tag: 'path', d: 'm14 11 2 2-2 2' }
    ]
  },
  certifications: {
    lucide: Award,
    pdf: [
      { tag: 'circle', cx: 12, cy: 8, r: 7 },
      { tag: 'polyline', points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' }
    ]
  },
  languages: {
    lucide: Languages,
    pdf: [
      { tag: 'path', d: 'm5 8 6 6' },
      { tag: 'path', d: 'm4 14 6-6 2-3' },
      { tag: 'path', d: 'M2 5h12' },
      { tag: 'path', d: 'M7 2h1' },
      { tag: 'path', d: 'm22 22-5-10-5 10' },
      { tag: 'path', d: 'M14 18h6' }
    ]
  },
  awards: {
    lucide: Trophy,
    pdf: [
      { tag: 'path', d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' },
      { tag: 'path', d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' },
      { tag: 'path', d: 'M4 22h16' },
      { tag: 'path', d: 'M10 14.66V17c0 .55.47.98.97 1.21C11.47 18.44 12 19 12 19s.53-.56 1.03-.79c.5-.23.97-.66.97-1.21v-2.34' },
      { tag: 'path', d: 'M12 14.66V3' }
    ]
  },
  volunteering: {
    lucide: Heart,
    pdf: [
      { tag: 'path', d: 'M20.84 4.61a5.5 5.3 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z' }
    ]
  },
  publications: {
    lucide: BookOpen,
    pdf: [
      { tag: 'path', d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' },
      { tag: 'path', d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }
    ]
  },
  references: {
    lucide: Users,
    pdf: [
      { tag: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
      { tag: 'circle', cx: 9, cy: 7, r: 4 },
      { tag: 'path', d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
      { tag: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' }
    ]
  },
  custom: {
    lucide: Settings,
    pdf: [
      { tag: 'path', d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' },
      { tag: 'circle', cx: 12, cy: 12, r: 3 }
    ]
  }
};
