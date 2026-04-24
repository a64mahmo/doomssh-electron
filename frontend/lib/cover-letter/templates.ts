export type CoverLetterTemplateId =
  | 'blank'
  | 'formal'
  | 'enthusiastic'
  | 'career-switch'
  | 'referral'

export interface CoverLetterTemplate {
  id: CoverLetterTemplateId
  label: string
  description: string
  body: string
}

const FORMAL = `Dear [Hiring Manager Name],

I am writing to formally express my interest in the [Job Title] role at [Company Name], as advertised on [Source]. With [X] years of experience in [Your Field] and a consistent record of delivering [Key Outcome], I believe I can make a meaningful contribution to your team.

Throughout my career at [Previous Company], I have [Achievement 1] and [Achievement 2], while developing strong expertise in [Skill 1] and [Skill 2]. I have followed [Company Name]'s work on [Specific Initiative] with interest, and I am confident that my background aligns well with the direction your team is taking.

I would welcome the opportunity to discuss how my experience can support [Company Name]'s continued growth. Thank you for your time and consideration.

Sincerely,
`

const ENTHUSIASTIC = `Dear [Hiring Manager Name],

When I saw the [Job Title] opening at [Company Name], I couldn't wait to apply — this role hits exactly the intersection of what I love doing and where I want to grow next. [Company Name]'s work on [Specific Project/Value] is something I genuinely admire, and I would love to bring my energy to it.

Over the last [X] years I have [Achievement 1], shipped [Achievement 2], and built a reputation for [Strength]. What excites me most about this role is [Specific Aspect] — it's the kind of problem I would happily wake up early for.

I would love to chat about how I can help the team. Thank you for considering my application!

Best,
`

const CAREER_SWITCH = `Dear [Hiring Manager Name],

I am applying for the [Job Title] position at [Company Name] as a deliberate next step in a career pivot from [Previous Field] into [New Field]. While my background is unconventional for this role, it is also why I think I can add something different to the team.

In my time as a [Previous Role], I developed [Transferable Skill 1] and [Transferable Skill 2], both of which map directly to the challenges this role involves. To prepare for this transition, I have [Recent Learning / Project / Certification], and I have already applied these skills to [Concrete Example].

I would appreciate the chance to explain how my crossover experience translates into value for [Company Name]. Thank you for keeping an open mind.

Sincerely,
`

const REFERRAL = `Dear [Hiring Manager Name],

[Referrer Name] suggested I reach out regarding the [Job Title] opening at [Company Name] — they thought my background in [Your Field] would be a strong fit for what your team is building, and after looking into the role I agree.

In my current role at [Previous Company], I [Achievement 1] and [Achievement 2]. [Referrer Name] and I worked together on [Shared Context], which is where they saw my approach to [Relevant Skill] firsthand.

I would welcome the chance to discuss how I can contribute to [Company Name]. Thank you for your time, and please feel free to confirm any of this with [Referrer Name].

Best regards,
`

const BLANK = `Dear Hiring Manager,

`

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  { id: 'formal', label: 'Formal', description: 'Traditional, professional tone. Safe default for corporate roles.', body: FORMAL },
  { id: 'enthusiastic', label: 'Enthusiastic', description: 'Warm and energetic. Good for startups and mission-driven teams.', body: ENTHUSIASTIC },
  { id: 'career-switch', label: 'Career Switch', description: 'Frames transferable skills for a pivot into a new field.', body: CAREER_SWITCH },
  { id: 'referral', label: 'Referral', description: 'Opens with a mutual contact who recommended the role.', body: REFERRAL },
  { id: 'blank', label: 'Blank', description: 'Start from a minimal greeting.', body: BLANK },
]

export function getCoverLetterTemplate(id: CoverLetterTemplateId): CoverLetterTemplate {
  return COVER_LETTER_TEMPLATES.find(t => t.id === id) ?? COVER_LETTER_TEMPLATES[0]
}
