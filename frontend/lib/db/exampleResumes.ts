/**
 * The example resumes offered on the dashboard ("Start from an example").
 *
 * People and companies are fictional. The text follows ASD-STE100 Simplified
 * Technical English: short sentences in the active voice, one idea in each
 * sentence, common words with one meaning, no dashes. Each example is long
 * enough to fill two pages, so it also shows how pages break.
 *
 * Photos are illustrated portraits in public/examples. Replace those files to
 * change them; the paths stay the same.
 */
import type { Resume, ResumeSection, SectionType } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { DEFAULT_SETTINGS, SECTION_LABELS } from '@/lib/store/types'
import { getTemplateSettings } from '@/components/web'

function section(type: SectionType, items: unknown, title?: string): ResumeSection {
  return { id: generateId(), type, title: title ?? SECTION_LABELS[type], visible: true, items } as ResumeSection
}

/** Bullets, one per line, as the editor stores them. */
const lines = (...l: string[]) => l.join('\n')

const withIds = <T extends object>(items: T[]) => items.map((it) => ({ id: generateId(), ...it }))

// ─── Product Manager ──────────────────────────────────────────────────────────

export function createSampleResumeProductManager(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Jordan Kim, Product Manager',
    createdAt: now,
    updatedAt: now,
    template: 'modern',
    settings: { ...DEFAULT_SETTINGS, ...getTemplateSettings('modern'), photoEnabled: true },
    sections: [
      section('header', {
        fullName: 'Jordan Kim',
        jobTitle: 'Senior Product Manager',
        email: 'jordan.kim@example.com',
        phone: '+1 (415) 555 0142',
        location: 'San Francisco, CA',
        website: 'jordankim.example.com',
        linkedin: 'linkedin.com/in/jordankim',
        github: '',
        photo: '/examples/jordan-kim.svg',
      }),
      section('summary', {
        text:
          'I am a product manager with 9 years of work on payment and accounting software. ' +
          'I find the problems that cost customers time and money, and I make sure that the team fixes them first. ' +
          'I write clear requirements and I measure each release after it ships.',
      }),
      section('experience', withIds([
        {
          company: 'Northwind Pay',
          position: 'Senior Product Manager, Payments',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          endDate: '',
          present: true,
          description: lines(
            'Own the checkout product. 2,400 online stores use it each day.',
            'Released tax calculation in 30 new countries. This added $12M in yearly revenue.',
            'Set the plan for a team of 14 engineers. The team shipped 94% of the planned work on time.',
            'Talked with 200 store owners. Their feedback changed the design of the one page checkout.',
            'The new checkout increased completed orders by 8%.',
            'Worked with the legal team to meet new European payment rules before the deadline.',
          ),
        },
        {
          company: 'Ledgerline',
          position: 'Product Manager, Expense Management',
          location: 'San Francisco, CA',
          startDate: '2019-06',
          endDate: '2022-02',
          present: false,
          description: lines(
            'Took the budgets product from a test version to 4,000 business customers.',
            'Ranked the backlog by cost and value. The team released 18 features in 1 year.',
            'No release caused a critical failure.',
            'Added automatic receipt matching. Finance teams closed each month 30% faster.',
            'Trained 2 associate product managers. One got a promotion after 10 months.',
          ),
        },
        {
          company: 'Brightbook Accounting',
          position: 'Associate Product Manager',
          location: 'Mountain View, CA',
          startDate: '2017-07',
          endDate: '2019-05',
          present: false,
          description: lines(
            'Shipped 3 features for the self employed version of the product.',
            'Tested 2 versions of the sign up steps. The better version increased first week use by 11%.',
            'Used funnel reports to find where new users stopped. Then I fixed the 4 largest problems.',
            'Wrote the help pages for each new feature with the support team.',
          ),
        },
        {
          company: 'Harbor Analytics',
          position: 'Business Analyst',
          location: 'Los Angeles, CA',
          startDate: '2013-07',
          endDate: '2015-07',
          present: false,
          description: lines(
            'Made weekly sales reports for 6 regional managers.',
            'Moved 40 spreadsheet reports into one database. This removed 10 hours of manual work each week.',
            'Found a billing error that cost the company $90K each year. The finance team fixed it.',
          ),
        },
      ])),
      section('projects', withIds([
        {
          name: 'Pricing Calculator for Small Stores',
          url: 'jordankim.example.com/pricing',
          date: '2023-08',
          description:
            'A free web tool that shows the full cost of card payments. 6,000 store owners used it in the first year.',
        },
      ])),
      section('volunteering', withIds([
        {
          organization: 'Bay Area Startup Clinic',
          role: 'Product Mentor',
          startDate: '2020-01',
          endDate: '',
          present: true,
          description: lines(
            'Meet with 2 early stage founders each month.',
            'Help them write their first product plan and choose what to build first.',
          ),
        },
      ])),
      section('education', withIds([
        {
          institution: 'University of California, Berkeley',
          degree: 'Master of Business Administration',
          field: 'Technology Management',
          location: 'Berkeley, CA',
          startDate: '2015-08',
          endDate: '2017-05',
          present: false,
          gpa: '3.8',
          description: '',
        },
        {
          institution: 'University of California, Los Angeles',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          location: 'Los Angeles, CA',
          startDate: '2009-09',
          endDate: '2013-06',
          present: false,
          gpa: '3.7',
          description: '',
        },
      ])),
      section('skills', withIds([
        { name: 'Product plans, requirements, release goals', category: 'Product', level: 'expert' },
        { name: 'SQL, funnel reports, A/B tests', category: 'Data', level: 'advanced' },
        { name: 'Customer interviews, usability tests, Figma', category: 'Research', level: 'advanced' },
        { name: 'Scrum, Jira, Linear', category: 'Delivery', level: 'expert' },
        { name: 'Card payments, tax rules, fraud checks', category: 'Payments', level: 'advanced' },
      ])),
      section('certifications', withIds([
        { name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', date: '2018-04', url: '' },
        { name: 'Payments Professional', issuer: 'Electronic Transactions Association', date: '2021-10', url: '' },
      ])),
      section('languages', withIds([
        { language: 'English', level: 'expert' },
        { language: 'Korean', level: 'advanced' },
        { language: 'Spanish', level: 'intermediate' },
      ])),
      section('awards', withIds([
        {
          title: 'Product Team of the Year',
          issuer: 'Northwind Pay',
          date: '2024-01',
          description: 'Given to the checkout team for the tax release.',
        },
      ])),
      section('references', withIds([
        { name: 'Dana Ortiz', company: 'Northwind Pay', position: 'Vice President, Product', email: 'dana@example.com', phone: '' },
        { name: 'Sam Reid', company: 'Ledgerline', position: 'Engineering Manager', email: 'sam@example.com', phone: '' },
      ])),
    ],
  }
}

// ─── Designer ─────────────────────────────────────────────────────────────────

export function createSampleResumeDesigner(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Maya Patel, Designer',
    createdAt: now,
    updatedAt: now,
    template: 'aspen',
    settings: { ...DEFAULT_SETTINGS, ...getTemplateSettings('aspen'), photoEnabled: true },
    sections: [
      section('header', {
        fullName: 'Maya Patel',
        jobTitle: 'Senior Product Designer',
        email: 'maya.patel@example.com',
        phone: '+1 (212) 555 0198',
        location: 'New York, NY',
        website: 'mayapatel.example.com',
        linkedin: 'linkedin.com/in/mayapatel',
        github: '',
        photo: '/examples/maya-patel.svg',
      }),
      section('summary', {
        text:
          'I design software for health care and for teams that work together online. ' +
          'I start with research, I test early, and I change the design when the data shows a problem. ' +
          'I work closely with engineers so that the released product matches the design.',
      }),
      section('experience', withIds([
        {
          company: 'Commonboard',
          position: 'Senior Product Designer',
          location: 'New York, NY (remote)',
          startDate: '2021-09',
          endDate: '',
          present: true,
          description: lines(
            'Redesigned the comments panel. 4 million teams use it.',
            'Usability tests showed that users found replies 35% faster after the change.',
            'Designed how each person appears when many people edit one file at the same time.',
            'Ran 2 day design workshops with 5 product teams.',
            'Keep the shared component library up to date. It has 200 components.',
            'Review the work of 3 junior designers each week.',
          ),
        },
        {
          company: 'Clearwell Health',
          position: 'Product Designer',
          location: 'New York, NY',
          startDate: '2019-02',
          endDate: '2021-08',
          present: false,
          description: lines(
            'Redesigned the patient website. 500,000 patients use it.',
            'Patient satisfaction scores went from 31 to 54.',
            'Ran 60 usability test sessions with patients. I turned each finding into a design change.',
            'Made the first design system for the company. 12 designers and 30 engineers use it.',
            'Designed the steps to book a video visit. Video visits increased by 28%.',
          ),
        },
        {
          company: 'Tallyhouse',
          position: 'UI Designer (contract)',
          location: 'Toronto, ON',
          startDate: '2018-01',
          endDate: '2019-01',
          present: false,
          description: lines(
            'Designed a new sales report screen for store owners.',
            'Made 40 clickable prototypes for 3 product teams.',
            'Added 12 components to the shared design library.',
          ),
        },
        {
          company: 'Studio Avenue',
          position: 'Junior Graphic Designer',
          location: 'Brooklyn, NY',
          startDate: '2016-06',
          endDate: '2017-12',
          present: false,
          description: lines(
            'Designed print and web material for 15 small business clients.',
            'Made a set of brand rules for each client.',
            'Prepared final files for printers and checked the first print of each job.',
          ),
        },
      ])),
      section('projects', withIds([
        {
          name: 'Readable Forms',
          url: 'mayapatel.example.com/forms',
          date: '2023-03',
          description:
            'A free guide to clear medical forms. It shows 30 before and after examples. 3 clinics use it to train their staff.',
        },
        {
          name: 'Color Contrast Checker',
          url: 'mayapatel.example.com/contrast',
          date: '2022-06',
          description: 'A small Figma plugin that finds text with too little contrast. 9,000 people installed it.',
        },
      ])),
      section('skills', withIds([
        { name: 'Figma', category: 'Design', level: 'expert' },
        { name: 'Prototypes', category: 'Design', level: 'expert' },
        { name: 'User research', category: 'Research', level: 'advanced' },
        { name: 'Usability tests', category: 'Research', level: 'advanced' },
        { name: 'Design systems', category: 'Systems', level: 'advanced' },
        { name: 'Accessibility', category: 'Systems', level: 'advanced' },
        { name: 'HTML and CSS', category: 'Technical', level: 'intermediate' },
      ])),
      section('education', withIds([
        {
          institution: 'Parsons School of Design',
          degree: 'Bachelor of Fine Arts',
          field: 'Communication Design',
          location: 'New York, NY',
          startDate: '2012-09',
          endDate: '2016-05',
          present: false,
          gpa: '',
          description: '',
        },
      ])),
      section('certifications', withIds([
        { name: 'Certified Professional in Accessibility Core Competencies', issuer: 'IAAP', date: '2022-02', url: '' },
      ])),
      section('languages', withIds([
        { language: 'English', level: 'expert' },
        { language: 'Hindi', level: 'advanced' },
        { language: 'Gujarati', level: 'intermediate' },
      ])),
      section('awards', withIds([
        {
          title: 'Design Award, Health Category',
          issuer: 'New York Design Week',
          date: '2021-05',
          description: 'Given for the patient website redesign.',
        },
      ])),
      section('volunteering', withIds([
        {
          organization: 'Design for Clinics',
          role: 'Volunteer Designer',
          startDate: '2019-06',
          endDate: '',
          present: true,
          description: lines(
            'Redesign intake forms for free health clinics.',
            'Completed 8 forms in 4 clinics.',
          ),
        },
      ])),
      section('references', withIds([
        { name: 'Ari Cohen', company: 'Commonboard', position: 'Head of Design', email: 'ari@example.com', phone: '' },
      ])),
    ],
  }
}

// ─── New Graduate ─────────────────────────────────────────────────────────────

export function createSampleResumeRecentGrad(): Resume {
  const now = Date.now()
  return {
    id: generateId(),
    name: 'Liam Chen, New Graduate',
    createdAt: now,
    updatedAt: now,
    template: 'minimal',
    settings: { ...DEFAULT_SETTINGS, ...getTemplateSettings('minimal'), photoEnabled: true },
    sections: [
      section('header', {
        fullName: 'Liam Chen',
        jobTitle: 'Software Engineer',
        email: 'liam.chen@example.com',
        phone: '+1 (647) 555 0234',
        location: 'Toronto, ON',
        website: '',
        linkedin: 'linkedin.com/in/liamchen',
        github: 'github.com/liamchen',
        photo: '/examples/liam-chen.svg',
      }),
      section('summary', {
        text:
          'I finished a degree in computer science in 2025. ' +
          'I did 3 internships in back end and network software. ' +
          'I like work where I can measure the result, such as faster pages or fewer failures. ' +
          'I want a back end or full stack role.',
      }),
      section('experience', withIds([
        {
          company: 'Meshgate',
          position: 'Software Engineering Intern',
          location: 'Toronto, ON',
          startDate: '2024-05',
          endDate: '2024-08',
          present: false,
          description: lines(
            'Made the network router code faster in Go. Connections started 12 ms faster on average.',
            'Wrote 47 unit tests for the control server. Test coverage went from 61% to 78%.',
            'Fixed 6 bugs that customers reported in the Windows app. All 6 fixes were in the next release.',
          ),
        },
        {
          company: 'Feedbackly',
          position: 'Full Stack Engineering Intern',
          location: 'Remote',
          startDate: '2023-09',
          endDate: '2023-12',
          present: false,
          description: lines(
            'Built a CSV import for feedback boards with React and Node.js. 120 teams used it in the first month.',
            'Made slow database queries faster. The dashboard loaded in 0.8 seconds, not 3.2 seconds.',
            'Wrote a design document for a new notification system and presented it to the team.',
          ),
        },
        {
          company: 'Ontario Transit Lab',
          position: 'Data Engineering Intern',
          location: 'Toronto, ON',
          startDate: '2023-01',
          endDate: '2023-04',
          present: false,
          description: lines(
            'Wrote Python jobs that load bus location data each night.',
            'Added checks that stop bad data before it goes into reports.',
            'Made a map that shows late buses by route. Planners use it each week.',
          ),
        },
        {
          company: 'University of Toronto',
          position: 'Teaching Assistant, Data Structures',
          location: 'Toronto, ON',
          startDate: '2022-09',
          endDate: '2023-04',
          present: false,
          description: lines(
            'Taught 2 tutorial groups of 30 students each week and marked their assignments.',
          ),
        },
      ])),
      section('projects', withIds([
        {
          name: 'Small Key Value Store',
          url: 'github.com/liamchen/kv-store',
          date: '2024-04',
          description:
            'A key value database in Go that keeps working when 2 of 5 servers stop. It does 98,000 reads each second in tests.',
        },
        {
          name: 'Review Helper',
          url: 'github.com/liamchen/review-helper',
          date: '2023-11',
          description:
            'A GitHub app that adds comments to pull requests about common mistakes. 80 projects use it.',
        },
      ])),
      section('education', withIds([
        {
          institution: 'University of Toronto',
          degree: 'Bachelor of Science',
          field: 'Computer Science, with distinction',
          location: 'Toronto, ON',
          startDate: '2021-09',
          endDate: '2025-04',
          present: false,
          gpa: '3.9 / 4.0',
          description: 'Courses: operating systems, distributed systems, compilers, algorithms, databases.',
        },
      ])),
      section('skills', withIds([
        { name: 'Go, TypeScript, Python, Java', category: 'Languages', level: 'advanced' },
        { name: 'React, Next.js, Node.js', category: 'Web', level: 'advanced' },
        { name: 'PostgreSQL, MongoDB, Redis', category: 'Data', level: 'intermediate' },
        { name: 'Docker, Kubernetes, GitHub Actions', category: 'Tools', level: 'intermediate' },
        { name: 'English, Mandarin', category: 'Spoken', level: 'advanced' },
      ])),
      section('awards', withIds([
        {
          title: 'Dean’s List',
          issuer: 'University of Toronto',
          date: '2024-06',
          description: 'Given for grades in the top 10% for 3 years.',
        },
      ])),
      section('volunteering', withIds([
        {
          organization: 'Code Club Toronto',
          role: 'Volunteer Teacher',
          startDate: '2022-01',
          endDate: '',
          present: true,
          description: lines(
            'Teach programming to children aged 10 to 14. Wrote 12 lesson plans that other teachers use.',
          ),
        },
      ])),
    ],
  }
}
