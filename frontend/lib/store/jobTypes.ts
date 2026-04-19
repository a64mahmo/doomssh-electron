// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — all TypeScript types for the job tracker
// Never define job-related types anywhere else. Import from here.
// ─────────────────────────────────────────────────────────────────────────────

export type JobStatus =
  | "wishlist"
  | "applied"
  | "phone-screen"
  | "technical"
  | "onsite"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "ghosted";

export type JobSource =
  | "linkedin"
  | "indeed"
  | "glassdoor"
  | "company-website"
  | "referral"
  | "recruiter"
  | "angellist"
  | "hacker-news"
  | "other";

export type JobPriority = "low" | "medium" | "high";

export type WorkMode = "remote" | "hybrid" | "onsite" | "";

export type JobEventType =
  | "status-change"
  | "note"
  | "interview"
  | "follow-up"
  | "deadline-passed"
  | "deadline-change"
  | "other";

// ─── Interview Prep ─────────────────────────────────────────────────────────

export type QuestionCategory =
  | "technical"
  | "behavioral"
  | "situational"
  | "general";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  answer: string; // user's drafted answer (plain text or STAR format)
}

export interface PostInterviewReflection {
  id: string;
  date: string; // ISO date string
  wentWell: string;
  wasDifficult: string;
  followUp: string; // e.g. thank-you notes, next steps
}

export interface InterviewPrep {
  questions: InterviewQuestion[];
  companyNotes: string;
  cheatSheet: string[];
  reflections: PostInterviewReflection[];
}

// ─── Data Structures ─────────────────────────────────────────────────────────

export interface JobContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  notes: string;
}

export interface JobEvent {
  id: string;
  type: JobEventType;
  date: string; // ISO date string
  title: string;
  description: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  priority: JobPriority;
  url: string;
  source: JobSource;
  location: string;
  workMode: WorkMode;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  resumeId: string | null;
  coverLetter: string;
  notes: string;
  contacts: JobContact[];
  events: JobEvent[];
  appliedDate: string | null;
  responseDate: string | null;
  deadlineDate: string | null;
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
  interviewPrep?: InterviewPrep;
}

// ─── Vault File ──────────────────────────────────────────────────────────────

export interface JobsVaultFile {
  version: 1;
  jobs: JobApplication[];
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

export interface JobStore {
  jobs: JobApplication[];
  isLoaded: boolean;
  isDirty: boolean;

  // Lifecycle
  loadJobs: () => Promise<void>;

  // CRUD
  addJob: (job: Partial<JobApplication>) => void;
  updateJob: (jobId: string, updates: Partial<JobApplication>) => void;
  deleteJob: (jobId: string) => void;
  archiveJob: (jobId: string) => void;

  // Status
  moveJob: (jobId: string, newStatus: JobStatus) => void;

  // Contacts
  addContact: (jobId: string, contact: Omit<JobContact, "id">) => void;
  updateContact: (
    jobId: string,
    contactId: string,
    updates: Partial<JobContact>,
  ) => void;
  removeContact: (jobId: string, contactId: string) => void;

  // Events
  addEvent: (jobId: string, event: Omit<JobEvent, "id">) => void;
  removeEvent: (jobId: string, eventId: string) => void;

  // Interview Prep
  updateInterviewPrep: (jobId: string, prep: Partial<InterviewPrep>) => void;

  // Persistence
  markSaved: () => void;
}

// ─── Status Config ───────────────────────────────────────────────────────────

export interface StatusConfig {
  status: JobStatus;
  label: string;
  color: string;
}

export const JOB_STATUS_CONFIG: StatusConfig[] = [
  { status: "wishlist", label: "Wishlist", color: "oklch(0.7 0.1 250)" },
  { status: "applied", label: "Applied", color: "oklch(0.7 0.15 200)" },
  {
    status: "phone-screen",
    label: "Phone Screen",
    color: "oklch(0.7 0.15 170)",
  },
  { status: "technical", label: "Technical", color: "oklch(0.65 0.15 140)" },
  { status: "onsite", label: "Onsite", color: "oklch(0.65 0.18 100)" },
  { status: "offer", label: "Offer", color: "oklch(0.7 0.18 130)" },
  { status: "accepted", label: "Accepted", color: "oklch(0.75 0.2 145)" },
  { status: "rejected", label: "Rejected", color: "oklch(0.6 0.15 25)" },
  { status: "withdrawn", label: "Withdrawn", color: "oklch(0.6 0.05 250)" },
  { status: "ghosted", label: "Ghosted", color: "oklch(0.5 0.02 250)" },
];

export const ACTIVE_STATUSES: JobStatus[] = [
  "wishlist",
  "applied",
  "phone-screen",
  "technical",
  "onsite",
  "offer",
];

export const TERMINAL_STATUSES: JobStatus[] = [
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
];

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  "company-website": "Company Website",
  referral: "Referral",
  recruiter: "Recruiter",
  angellist: "AngelList",
  "hacker-news": "Hacker News",
  other: "Other",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = Object.fromEntries(
  JOB_STATUS_CONFIG.map((c) => [c.status, c.label]),
) as Record<JobStatus, string>;

export const JOB_PRIORITY_LABELS: Record<JobPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  "": "Not specified",
};
