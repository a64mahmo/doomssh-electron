# Interview Prep — Design Document

The Interview Prep feature is DoomSSH's interview preparation suite, integrated into the Job Tracker. It provides AI-powered question generation, structured answer drafting, company research storage, and post-interview reflection logging.

## Architecture

```
JobApplication (jobTypes.ts)
  └── interviewPrep?: InterviewPrep
        ├── questions: InterviewQuestion[]
        ├── companyNotes: string
        ├── cheatSheet: string[]
        └── reflections: PostInterviewReflection[]
```

### Design Decisions

**Optional field on JobApplication.** `interviewPrep` is an optional property, not a separate entity. This avoids a vault migration — existing jobs without prep data load fine. The field is lazily initialized when the user first interacts with any prep section.

**Two entry points, shared data.** Interview prep is accessible from:
1. **Job Detail Dialog** — an "Interview Prep" tab alongside Details, Contacts, and Timeline
2. **Dedicated full page** (`/builder/interview-prep`) — accessible from the main sidebar navigation

Both entry points read/write the same `interviewPrep` field on `JobApplication`. The dialog tab operates on the draft pattern (changes commit on Save), while the full page writes directly to the store (auto-persisted via the existing 500ms debounce).

**AI integration reuses the existing pipeline.** The `useAI` hook was extended with `generateInterviewQuestions()`, which streams through the same Electron IPC channel as resume AI features. The prompt is defined in `prompts.ts` alongside the other prompt templates.

## Data Model

### InterviewQuestion

```typescript
interface InterviewQuestion {
  id: string
  question: string
  category: 'technical' | 'behavioral' | 'situational' | 'general'
  answer: string  // plain text or JSON-serialized STAR structure
}
```

- **Category** determines the answer editor: behavioral questions get the STAR method editor (Situation/Task/Action/Result), all other categories get a plain textarea.
- **Answer storage**: Plain text for non-behavioral questions. For behavioral questions, the answer is a JSON string `{"situation":"...","task":"...","action":"...","result":"..."}` parsed/serialized by the STAR editor. Legacy plain text is handled gracefully (placed into the "situation" field on first edit).

### PostInterviewReflection

```typescript
interface PostInterviewReflection {
  id: string
  date: string       // ISO date
  wentWell: string
  wasDifficult: string
  followUp: string   // e.g. thank-you notes, next steps
}
```

Reflections are stored newest-first. Each reflection captures three dimensions: what went well, what was difficult, and follow-up tasks.

### CheatSheet

A simple `string[]` — numbered talking points designed for at-a-glance reference during remote interviews. Inline editable, reorderable by index.

## AI Question Generation

### Prompt Design

The `interviewQuestionsPrompt()` function generates 8 role-specific questions:
- 3 technical (specific to the role and company)
- 3 behavioral (STAR-method framing)
- 2 situational/general

Input context:
- Job title and company name
- Job description (from the job's `notes` field)
- Optional resume context for personalized questions

The AI responds in JSON array format, parsed client-side. The response is scanned for a JSON array pattern (`[...]`) to handle any preamble text the model may include.

### API Key Guard

The `useAI` hook exposes a `hasApiKey` boolean, checked on mount via `electron.getApiKey()`. When no API key is configured:
- The AI Generate button is disabled
- A tooltip appears on hover: "Add your Anthropic API key in Settings to use AI features"
- Error messages fall back to a descriptive message if the IPC error string is empty

## UI Components

### Full Page (`/builder/interview-prep`)

```
┌──────────────┬─────────────────────────────────────┐
│  Job List    │  Section Tabs                       │
│  (sidebar)   │  [Questions] [Company] [Cheat] [Ref]│
│              ├─────────────────────────────────────┤
│  - Company A │                                     │
│  - Company B │  Section Content                    │
│  - Company C │  (max-w-3xl centered)               │
│              │                                     │
└──────────────┴─────────────────────────────────────┘
```

- **Left sidebar**: All non-archived jobs, sorted with interview-stage jobs (`phone-screen`, `technical`, `onsite`) first, then by most recent update. A dot indicator shows which jobs have existing prep data.
- **Section tabs**: Underline-style tabs matching the app's design language.
- **Content area**: Scrollable, max-width constrained for readability.

### Dialog Tab

Same four sections (Questions, Company Notes, Cheat Sheet, Reflections) rendered inside the existing `JobDetailDialog` as a fourth tab. Operates on the draft pattern — all changes are local until the user clicks Save.

## File Map

| File | Purpose |
|------|---------|
| `frontend/lib/store/jobTypes.ts` | Type definitions (`InterviewPrep`, `InterviewQuestion`, `PostInterviewReflection`, `QuestionCategory`) |
| `frontend/lib/store/jobStore.ts` | `updateInterviewPrep()` store method |
| `frontend/lib/ai/prompts.ts` | `SYSTEM_INTERVIEW_COACH`, `interviewQuestionsPrompt()` |
| `frontend/hooks/useAI.ts` | `generateInterviewQuestions()`, `hasApiKey` state |
| `frontend/components/jobs/InterviewPrepTab.tsx` | Dialog tab component (used inside JobDetailDialog) |
| `frontend/components/jobs/JobDetailDialog.tsx` | Wired Interview Prep as 4th tab |
| `frontend/app/builder/interview-prep/page.tsx` | Route entry point |
| `frontend/app/builder/interview-prep/InterviewPrepClient.tsx` | Full-page Interview Prep client |
| `frontend/app/builder/page.tsx` | Sidebar nav — removed "Coming Soon" from Interview Prep |

## Performance Notes

- **Kanban drag-and-drop** was optimized alongside this feature: replaced `useSortable` (heavy, bidirectional) with `useDraggable` (lightweight, unidirectional) on cards, removed `SortableContext` overhead, and switched collision detection from `closestCorners` to `closestCenter`.
- **Text selection** is disabled (`select-none`) on the Job Tracker, Interview Prep, and Job Detail Dialog to prevent accidental selection during drag and click interactions. Inputs and textareas remain selectable.
