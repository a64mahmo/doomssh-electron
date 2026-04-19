✦ I'm using the brainstorming skill to explore the best way to implement an Interview Prep feature within DoomSSH.

To design an effective Interview Preparation feature, we should leverage DoomSSH's existing Job Tracker and AI capabilities. Here is a proposed set of features and an implementation plan:

1. Proposed "Interview Suite" Features

- AI Mock Interviewer: Use the existing AI integration to generate job-specific interview questions based on the job description and the user's resume.
- STAR Method Builder: A structured editor for drafting behavioral answers (Situation, Task, Action, Result) that are linked to specific resume experiences.
- Company Research Vault: A space to store key facts about the company, their values, and the people the user will be meeting.
- Post-Interview Reflection: A quick form to log what went well, what was difficult, and follow-up tasks (like thank-you notes).
- Cheat Sheet Mode: A condensed, "at-a-glance" view of key talking points intended for use during remote interviews.

2. Implementation Strategy

Since DoomSSH is built with Zustand and Next.js, we should integrate this into the jobStore.

Data Model (Update jobTypes.ts)
We'll need to add an interviewPrep field to the Job interface:

1 interface InterviewPrep {
2 questions: { id: string; question: string; myAnswer?: string; category: 'technical' | 'behavioral' }[];
3 companyNotes: string;
4 cheatSheet: string[];
5 }

UI Integration

- Job Detail Dialog: Add an "Interview Prep" tab to the existing JobDetailDialog.tsx.
- AI Integration: Create a new prompt in prompts.ts called GENERATE_INTERVIEW_QUESTIONS that takes the job title, description, and resume context as input.

3. Proposed Next Steps

I recommend we start with a Standard Task approach:

1.  Define the Schema: Update the job store to support interview data.
2.  AI Question Generator: Build the hook to fetch questions based on the job details.
3.  STAR Editor: Create a UI component for structured answer drafting.

Would you like me to create a detailed implementation plan for this "Interview Suite", or should we start by brainstorming more specific AI-driven features?

  <multi-select>
   - Create Plan: Generate a full implementation plan for the Interview Suite.
   - Brainstorm AI: Explore deeper AI-mock interview interactions first.
   - Cheat Sheet Only: Focus just on the "Cheat Sheet" view for remote interviews.
  </multi-select>
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
