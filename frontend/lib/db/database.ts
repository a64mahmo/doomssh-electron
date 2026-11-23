// Vault-based file storage via Electron IPC, IndexedDB in the browser
import type { Resume } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { browserDb } from '@/lib/db/browserDb'
import { deleteAllVersions } from '@/lib/db/history'
import { DEFAULT_SETTINGS, DEFAULT_HEADER, SECTION_LABELS } from '@/lib/store/types'
import {
  createSampleResumeProductManager,
  createSampleResumeDesigner,
  createSampleResumeRecentGrad,
} from './exampleResumes'

// ─── CRUD Operations ──────────────────────────────────────────────────────────

async function listAll(): Promise<Resume[]> {
  if (!window.electron) return browserDb().resumes.toArray()
  return (await window.electron.vault.list()) as Resume[]
}

export async function getAllResumes(): Promise<Resume[]> {
  const all = await listAll()
  return all.filter(r => r.kind !== 'coverLetter')
}

export async function getAllCoverLetters(): Promise<Resume[]> {
  const all = await listAll()
  return all.filter(r => r.kind === 'coverLetter')
}

export function createNewCoverLetter(name: string = 'Untitled Cover Letter'): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    kind: 'coverLetter',
    template: 'modern',
    settings: { ...DEFAULT_SETTINGS },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: { ...DEFAULT_HEADER },
      },
    ],
    coverLetter: {
      syncWithResume: true,
      date: new Date().toISOString().slice(0, 10),
      recipient: {
        hrName: 'Hiring Manager',
        company: 'Target Company Name',
        address: '123 Business Rd.\nCity, State 12345',
      },
      body: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Job Title] position at [Company Name]. With a background in [Your Field] and a proven track record of [Key Achievement], I am confident that I can bring significant value to your team.\n\nIn my previous role at [Previous Company], I successfully [Achievement 1] and [Achievement 2]. These experiences have equipped me with the skills necessary to excel in this role, specifically in [Skill 1] and [Skill 2].\n\nI have followed [Company Name] for some time and am impressed by your recent [Company Achievement/Value]. I am eager to contribute my expertise to help your team achieve its goals.\n\nThank you for your time and consideration. I look forward to the possibility of discussing my application with you further.\n\nSincerely,\n',
      signature: {
        fullName: '',
        place: '',
        date: new Date().toISOString().slice(0, 10),
      },
    },
  }
}

export async function getResume(id: string): Promise<Resume | undefined> {
  if (!window.electron) return browserDb().resumes.get(id)
  return (await window.electron.vault.read(id)) as Resume | undefined
}

export async function saveResume(resume: Resume): Promise<void> {
  const updated = { ...resume, updatedAt: Date.now() }
  if (!window.electron) {
    await browserDb().resumes.put(updated)
    return
  }
  await window.electron.vault.write(updated)
}

export async function deleteResume(id: string): Promise<void> {
  if (!window.electron) {
    await browserDb().resumes.delete(id)
  } else {
    await window.electron.vault.delete(id)
  }
  // Its history goes with it; a failure here must not undo the delete.
  await deleteAllVersions(id).catch((err) => console.warn('[history] could not delete versions:', err))
}

export async function duplicateResume(id: string): Promise<Resume> {
  const original = await getResume(id)
  if (!original) throw new Error('Resume not found')
  const copy: Resume = {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await saveResume(copy)
  return copy
}

export function createNewResume(name: string = 'My Resume'): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    template: 'custom',
    settings: { ...DEFAULT_SETTINGS },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: { ...DEFAULT_HEADER },
      },
      {
        id: generateId(),
        type: 'summary',
        title: SECTION_LABELS.summary,
        visible: true,
        items: { text: '' },
      },
      {
        id: generateId(),
        type: 'experience',
        title: SECTION_LABELS.experience,
        visible: true,
        items: [],
      },
      {
        id: generateId(),
        type: 'education',
        title: SECTION_LABELS.education,
        visible: true,
        items: [],
      },
      {
        id: generateId(),
        type: 'skills',
        title: SECTION_LABELS.skills,
        visible: true,
        items: [],
      },
    ],
  }
}

export function createSampleResumes(): Resume[] {
  return [
    createSampleResume(),
    createSampleResumeProductManager(),
    createSampleResumeDesigner(),
    createSampleResumeRecentGrad(),
  ]
}

export function createSampleResume(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Abdallh Mahmood',
    createdAt: now,
    updatedAt: now,
    template: 'custom',
    settings: { ...DEFAULT_SETTINGS },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: {
          fullName: 'Abdallh Mahmood',
          jobTitle: 'Software & Data Engineer',
          email: 'abdallh.mahmood@ontario.ca',
          phone: '+1 (519) 702-7000',
          location: 'Toronto, ON',
          website: '',
          linkedin: 'linkedin.com/in/abdallhmahmood',
          github: 'github.com/abdallhmahmood',
        },
      },
      {
        id: generateId(),
        type: 'skills',
        title: 'Relevant Skills',
        visible: true,
        items: [
          { id: generateId(), name: 'Python, TypeScript, SQL, PowerShell, Bash', category: 'Automation & Scripting', level: 'advanced' },
          { id: generateId(), name: 'Power BI, Power Automate, Power Apps, SharePoint', category: 'Microsoft Power Suite', level: 'advanced' },
          { id: generateId(), name: 'PostgreSQL, SQL Server, IndexedDB, Dexie.js', category: 'Database Management', level: 'advanced' },
          { id: generateId(), name: 'Agile, cross-functional collaboration, sprint planning', category: 'Problem-Solving & Teamwork', level: 'advanced' },
          { id: generateId(), name: 'Technical documentation, stakeholder presentations', category: 'Communication & Collaboration', level: 'advanced' },
        ],
      },
      {
        id: generateId(),
        type: 'experience',
        title: 'Relevant Professional Experience',
        visible: true,
        items: [
          {
            id: generateId(),
            company: 'Ontario Public Sector — Ministry of Children, Community and Social Services',
            position: 'OIP I&T Intern',
            location: 'Toronto, ON',
            startDate: '2024-08',
            endDate: '',
            present: true,
            description:
              'Developed Power Automate workflows to automate manual intake processes, reducing processing time by 40%\nBuilt Power BI dashboards surfacing KPIs for program leadership across 3 ministries\nDesigned and maintained SharePoint intranet pages used by 500+ staff\nCollaborated with senior analysts to migrate legacy Access databases to SQL Server',
          },
          {
            id: generateId(),
            company: 'Tesla',
            position: 'Machine Learning Engineer',
            location: 'Palo Alto, CA',
            startDate: '2024-01',
            endDate: '2024-08',
            present: false,
            description:
              'Trained and evaluated computer vision models for Autopilot lane detection pipeline\nImproved model inference latency by 18% through quantization and ONNX export\nWrote Python ETL scripts processing 2TB of annotated driving footage per week\nParticipated in weekly model review meetings with Autopilot research leads',
          },
          {
            id: generateId(),
            company: 'University of Waterloo — School of Computer Science',
            position: 'CS Teaching Assistant',
            location: 'Waterloo, ON',
            startDate: '2021-09',
            endDate: '2023-08',
            present: false,
            description:
              'Held weekly office hours supporting 120+ students in CS 135, CS 136, and CS 245\nGraded assignments and provided written feedback on algorithm correctness and efficiency\nCreated supplementary practice problems adopted by course coordinators',
          },
          {
            id: generateId(),
            company: 'University of Waterloo — Science Endowment Fund',
            position: 'Assistant Executive Director',
            location: 'Waterloo, ON',
            startDate: '2021-11',
            endDate: '2023-09',
            present: false,
            description:
              'Managed $180K annual budget and coordinated grant disbursements to student clubs\nProduced monthly financial reports presented to the faculty dean\nStreamlined reimbursement workflow using SharePoint and Power Automate, cutting approval time by 60%',
          },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: 'Education',
        visible: true,
        items: [
          {
            id: generateId(),
            institution: 'University of Waterloo',
            degree: 'Bachelor of Science',
            field: 'Computational Mathematics',
            location: 'Waterloo, ON',
            startDate: '2019-09',
            endDate: '2024-05',
            present: false,
            gpa: '',
            description: '',
          },
        ],
      },
    ],
  }
}

// ─── Examples offered on the dashboard ────────────────────────────────────────

export {
  createSampleResumeProductManager,
  createSampleResumeDesigner,
  createSampleResumeRecentGrad,
}
