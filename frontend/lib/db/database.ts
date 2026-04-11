// Vault-based file storage via Electron IPC
import type { Resume } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { DEFAULT_SETTINGS, DEFAULT_HEADER, SECTION_LABELS } from '@/lib/store/types'

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getAllResumes(): Promise<Resume[]> {
  return (await window.electron!.vault.list()) as Resume[]
}

export async function getResume(id: string): Promise<Resume | undefined> {
  return (await window.electron!.vault.read(id)) as Resume | undefined
}

export async function saveResume(resume: Resume): Promise<void> {
  await window.electron!.vault.write({ ...resume, updatedAt: Date.now() })
}

export async function deleteResume(id: string): Promise<void> {
  await window.electron!.vault.delete(id)
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

// ─── Sample: Product Manager ──────────────────────────────────────────────────

export function createSampleResumeProductManager(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Jordan Kim — PM',
    createdAt: now,
    updatedAt: now,
    template: 'modern',
    settings: { ...DEFAULT_SETTINGS, accentColor: '#0f766e', headerAlignment: 'left', columnLayout: 'one' },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: {
          fullName: 'Jordan Kim',
          jobTitle: 'Senior Product Manager',
          email: 'jordan.kim@email.com',
          phone: '+1 (415) 867-5309',
          location: 'San Francisco, CA',
          website: 'jordankim.io',
          linkedin: 'linkedin.com/in/jordankim',
          github: '',
        },
      },
      {
        id: generateId(),
        type: 'summary',
        title: SECTION_LABELS.summary,
        visible: true,
        items: {
          text: 'Product leader with 7+ years driving 0→1 and growth-stage products at fintech and SaaS companies. Proven track record of shipping features that increased MAU by 35% and reduced churn by 22%. Expert at bridging engineering, design, and business stakeholders.',
        },
      },
      {
        id: generateId(),
        type: 'experience',
        title: SECTION_LABELS.experience,
        visible: true,
        items: [
          {
            id: generateId(),
            company: 'Stripe',
            position: 'Senior Product Manager, Payments',
            location: 'San Francisco, CA',
            startDate: '2022-03',
            endDate: '',
            present: true,
            description:
              'Led end-to-end launch of Stripe Tax in 30 new markets, generating $12M ARR in Y1\nDefined quarterly OKRs and roadmap for a 14-engineer squad; maintained 94% on-time delivery\nConducted 200+ customer interviews that shaped the Link one-click checkout redesign, lifting conversion by 8%\nPartnered with Legal and Compliance to ship PSD2 SCA updates across EU markets within regulatory deadline',
          },
          {
            id: generateId(),
            company: 'Brex',
            position: 'Product Manager, Spend Management',
            location: 'San Francisco, CA',
            startDate: '2019-06',
            endDate: '2022-02',
            present: false,
            description:
              'Owned budgets & reimbursements product from beta to 4,000+ business customers\nPrioritized backlog using RICE scoring; delivered 18 features across 4 quarters with 0 P0 incidents\nLaunched real-time receipt-matching feature that reduced finance team close time by 30%\nMentored 2 associate PMs; one was promoted to PM within 10 months',
          },
          {
            id: generateId(),
            company: 'Intuit',
            position: 'Associate Product Manager',
            location: 'Mountain View, CA',
            startDate: '2017-07',
            endDate: '2019-05',
            present: false,
            description:
              'Joined APM rotational program; shipped 3 features for QuickBooks Self-Employed\nRan A/B tests on onboarding flow, improving 7-day activation by 11%\nAnalyzed Mixpanel and Amplitude funnels to identify drop-off points and prioritize fixes',
          },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: SECTION_LABELS.education,
        visible: true,
        items: [
          {
            id: generateId(),
            institution: 'UC Berkeley, Haas School of Business',
            degree: 'MBA',
            field: 'Product Management & Strategy',
            location: 'Berkeley, CA',
            startDate: '2015-08',
            endDate: '2017-05',
            present: false,
            gpa: '3.8',
            description: '',
          },
          {
            id: generateId(),
            institution: 'UCLA',
            degree: 'B.S.',
            field: 'Computer Science',
            location: 'Los Angeles, CA',
            startDate: '2011-09',
            endDate: '2015-06',
            present: false,
            gpa: '3.7',
            description: '',
          },
        ],
      },
      {
        id: generateId(),
        type: 'skills',
        title: SECTION_LABELS.skills,
        visible: true,
        items: [
          { id: generateId(), name: 'Product strategy, roadmapping, OKRs', category: 'Product', level: 'expert' },
          { id: generateId(), name: 'SQL, Mixpanel, Amplitude, Looker', category: 'Analytics', level: 'advanced' },
          { id: generateId(), name: 'Figma, user research, usability testing', category: 'Design', level: 'intermediate' },
          { id: generateId(), name: 'Agile / Scrum, JIRA, Linear', category: 'Execution', level: 'expert' },
          { id: generateId(), name: 'Python (data analysis)', category: 'Technical', level: 'intermediate' },
        ],
      },
    ],
  }
}

// ─── Sample: UX Designer ──────────────────────────────────────────────────────

export function createSampleResumeDesigner(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Maya Patel — Designer',
    createdAt: now,
    updatedAt: now,
    template: 'crisp',
    settings: {
      ...DEFAULT_SETTINGS,
      accentColor: '#7c3aed',
      headerAlignment: 'center',
      fontFamily: 'Raleway',
      skillDisplay: 'bubble',
    },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: {
          fullName: 'Maya Patel',
          jobTitle: 'Senior UX Designer',
          email: 'maya@mayapatel.design',
          phone: '+1 (212) 555-0198',
          location: 'New York, NY',
          website: 'mayapatel.design',
          linkedin: 'linkedin.com/in/mayapatelux',
          github: '',
        },
      },
      {
        id: generateId(),
        type: 'summary',
        title: SECTION_LABELS.summary,
        visible: true,
        items: {
          text: 'Human-centered designer with 6 years crafting intuitive digital experiences for fintech, healthtech, and e-commerce. Skilled at transforming complex workflows into delightful interfaces. My work has directly contributed to a 40% reduction in support tickets and $8M in incremental revenue.',
        },
      },
      {
        id: generateId(),
        type: 'experience',
        title: SECTION_LABELS.experience,
        visible: true,
        items: [
          {
            id: generateId(),
            company: 'Figma',
            position: 'Senior Product Designer',
            location: 'New York, NY (Remote)',
            startDate: '2021-09',
            endDate: '',
            present: true,
            description:
              'Redesigned the Comments panel used by 4M+ teams, cutting comment-threading friction by 35% per usability testing\nDefined and shipped the new multiplayer cursor identity system in collaboration with 3 engineers\nFacilitated design sprints with cross-functional partners across 5 product areas\nMaintained and extended the FigJam component library (200+ components)',
          },
          {
            id: generateId(),
            company: 'Oscar Health',
            position: 'UX Designer',
            location: 'New York, NY',
            startDate: '2019-02',
            endDate: '2021-08',
            present: false,
            description:
              'Led end-to-end redesign of member portal used by 500K+ patients — NPS improved from 31 to 54\nBuilt and ran moderated usability tests with 60+ participants; translated findings into actionable design changes\nCreated a design system from scratch (Figma) used by 12 designers and 30 engineers\nCollaborated with Care team to design telehealth visit scheduling flow, driving 28% adoption lift',
          },
          {
            id: generateId(),
            company: 'Shopify',
            position: 'UI/UX Designer (Contract)',
            location: 'Toronto, ON',
            startDate: '2018-01',
            endDate: '2019-01',
            present: false,
            description:
              'Designed merchant-facing analytics dashboard refresh for Shopify POS\nProduced 40+ high-fidelity prototypes across 3 product teams\nContributed Polaris-compliant components accepted into the design system',
          },
        ],
      },
      {
        id: generateId(),
        type: 'skills',
        title: SECTION_LABELS.skills,
        visible: true,
        items: [
          { id: generateId(), name: 'Figma', category: 'Design Tools', level: 'expert' },
          { id: generateId(), name: 'Prototyping & Wireframing', category: 'Design Tools', level: 'expert' },
          { id: generateId(), name: 'User Research & Usability Testing', category: 'Research', level: 'advanced' },
          { id: generateId(), name: 'Design Systems', category: 'Systems', level: 'advanced' },
          { id: generateId(), name: 'HTML / CSS', category: 'Technical', level: 'intermediate' },
          { id: generateId(), name: 'Framer', category: 'Design Tools', level: 'intermediate' },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: SECTION_LABELS.education,
        visible: true,
        items: [
          {
            id: generateId(),
            institution: 'Parsons School of Design',
            degree: 'Bachelor of Fine Arts',
            field: 'Communication Design',
            location: 'New York, NY',
            startDate: '2014-09',
            endDate: '2018-05',
            present: false,
            gpa: '',
            description: '',
          },
        ],
      },
    ],
  }
}

// ─── Sample: Recent Graduate ──────────────────────────────────────────────────

export function createSampleResumeRecentGrad(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Liam Chen — New Grad',
    createdAt: now,
    updatedAt: now,
    template: 'minimal',
    settings: {
      ...DEFAULT_SETTINGS,
      accentColor: '#1d4ed8',
      fontFamily: 'Inter',
      skillDisplay: 'compact',
      fontSize: 10,
    },
    sections: [
      {
        id: generateId(),
        type: 'header',
        title: SECTION_LABELS.header,
        visible: true,
        items: {
          fullName: 'Liam Chen',
          jobTitle: 'Software Engineer',
          email: 'liamchen@gmail.com',
          phone: '+1 (647) 555-0234',
          location: 'Toronto, ON',
          website: '',
          linkedin: 'linkedin.com/in/liam-chen-dev',
          github: 'github.com/liamchen',
        },
      },
      {
        id: generateId(),
        type: 'summary',
        title: SECTION_LABELS.summary,
        visible: true,
        items: {
          text: 'Computer Science new graduate (University of Toronto, 2025) with internship experience at two YC-backed startups. Passionate about distributed systems and developer tooling. Seeking a full-stack or backend SWE role.',
        },
      },
      {
        id: generateId(),
        type: 'experience',
        title: SECTION_LABELS.experience,
        visible: true,
        items: [
          {
            id: generateId(),
            company: 'Tailscale',
            position: 'Software Engineering Intern',
            location: 'Toronto, ON',
            startDate: '2024-05',
            endDate: '2024-08',
            present: false,
            description:
              'Implemented subnet router performance improvements in Go, reducing NAT traversal latency by 12ms on average\nAdded 47 unit tests to the control plane, increasing coverage from 61% to 78%\nFixed 6 customer-reported bugs in the Windows client; all fixes shipped in v1.68',
          },
          {
            id: generateId(),
            company: 'Canny',
            position: 'Full-Stack Engineering Intern',
            location: 'Remote',
            startDate: '2023-09',
            endDate: '2023-12',
            present: false,
            description:
              'Built a bulk CSV import feature for user feedback boards using React and Node.js; adopted by 120+ teams\nOptimized slow MongoDB queries on the dashboard page, reducing P95 load time from 3.2s to 0.8s\nWrote RFC and led design review for a new changelog notification system',
          },
        ],
      },
      {
        id: generateId(),
        type: 'projects',
        title: SECTION_LABELS.projects,
        visible: true,
        items: [
          {
            id: generateId(),
            name: 'Distributed Key-Value Store',
            url: 'github.com/liamchen/kv-store',
            date: '2024-04',
            description:
              'Built a fault-tolerant KV store in Go implementing Raft consensus; supports leader election and log replication across 5-node clusters. Achieves 98K reads/s and 41K writes/s in benchmarks.',
          },
          {
            id: generateId(),
            name: 'CodeReview.ai',
            url: 'github.com/liamchen/codereview-ai',
            date: '2023-11',
            description:
              'GitHub App that posts AI-generated inline code review comments using GPT-4 and tree-sitter AST analysis. 300+ GitHub stars, used by 80+ repositories.',
          },
        ],
      },
      {
        id: generateId(),
        type: 'education',
        title: SECTION_LABELS.education,
        visible: true,
        items: [
          {
            id: generateId(),
            institution: 'University of Toronto',
            degree: 'Bachelor of Science',
            field: 'Computer Science (with Distinction)',
            location: 'Toronto, ON',
            startDate: '2021-09',
            endDate: '2025-04',
            present: false,
            gpa: '3.9 / 4.0',
            description: 'Relevant coursework: Operating Systems, Distributed Systems, Compilers, Algorithms, Databases',
          },
        ],
      },
      {
        id: generateId(),
        type: 'skills',
        title: SECTION_LABELS.skills,
        visible: true,
        items: [
          { id: generateId(), name: 'Go, TypeScript, Python, Java', category: 'Languages', level: 'advanced' },
          { id: generateId(), name: 'React, Next.js, Node.js', category: 'Web', level: 'advanced' },
          { id: generateId(), name: 'PostgreSQL, MongoDB, Redis', category: 'Data', level: 'intermediate' },
          { id: generateId(), name: 'Docker, Kubernetes, GitHub Actions', category: 'DevOps', level: 'intermediate' },
        ],
      },
    ],
  }
}
