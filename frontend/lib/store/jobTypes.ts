// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Store-specific types for the job tracker
// Core data types are imported from @/lib/shared/types
// ─────────────────────────────────────────────────────────────────────────────

import type {
  JobApplication,
  JobStatus,
  JobContact,
  JobEvent,
  InterviewPrep,
  JobSource,
  JobPriority,
} from '@/lib/shared/types'

export * from '@/lib/shared/types'

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
