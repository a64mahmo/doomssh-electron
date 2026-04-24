// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — all AI prompt templates
// Route handlers import from here. Never define prompts inline in route files.
// ─────────────────────────────────────────────────────────────────────────────

export const SYSTEM_RESUME_WRITER = `You are an expert resume writer with 15+ years of experience
helping professionals land jobs at top companies. You write concise, impactful content using:
- Strong action verbs (achieved, led, built, reduced, increased)
- Quantifiable results where possible (%, $, numbers)
- ATS-friendly language
- Industry-appropriate tone
Always respond with just the content, no preamble or explanation.`

export function bulletPrompt(jobTitle: string, company: string, responsibilities: string): string {
  return `Generate 4-5 resume bullet points for this role:

Job Title: ${jobTitle}
Company: ${company}
Responsibilities/Context: ${responsibilities}

Format: Each bullet on a new line starting with "• ". Use strong action verbs and quantify where logical.`
}

export function improvePrompt(text: string, context: string = ''): string {
  return `Improve this resume content to be more impactful and professional:

${context ? `Context: ${context}\n` : ''}Original: ${text}

Rewrite it to be stronger, more specific, and results-focused. Return only the improved text.`
}

export function summaryPrompt(resumeData: {
  name: string
  jobTitle: string
  yearsExperience: string
  skills: string[]
  highlights: string
}): string {
  return `Write a compelling professional summary (3-4 sentences) for this person:

Name: ${resumeData.name}
Target Role: ${resumeData.jobTitle}
Experience: ${resumeData.yearsExperience}
Key Skills: ${resumeData.skills.join(', ')}
Career Highlights: ${resumeData.highlights}

Write in first person implied (no "I"), present tense. Make it specific and compelling.`
}

export const SYSTEM_INTERVIEW_COACH = `You are an expert interview coach with deep experience preparing candidates
for technical and behavioral interviews at top companies. You generate realistic, role-specific
interview questions and help candidates craft strong STAR-method answers.
Always respond with just the content in the requested format, no preamble or explanation.`

export function interviewQuestionsPrompt(
  jobTitle: string,
  company: string,
  jobDescription: string,
  resumeContext: string = '',
): string {
  return `Generate 8 interview questions for this role. Mix of categories:
- 3 technical questions specific to the role
- 3 behavioral questions (use STAR-method framing)
- 2 situational/general questions

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}
${resumeContext ? `\nCandidate Background: ${resumeContext}` : ''}

Respond in JSON array format:
[{"question": "...", "category": "technical|behavioral|situational|general"}]

Make questions specific to the company and role, not generic.`
}

export const SYSTEM_COVER_LETTER_WRITER = `You are an expert cover letter writer. You produce
warm, concise, specific cover letters that avoid cliché openers ("I am writing to..."), avoid
filler, and lead with concrete evidence. You never invent facts that were not provided. You keep
letters to 3-4 short paragraphs (roughly 250-350 words) unless asked otherwise.
Respond with the letter body only — no preamble, no sign-off line like "Best, [name]" unless asked.`

export interface CoverLetterGenInput {
  jobTitle: string
  company: string
  jobDescription?: string
  candidateName?: string
  resumeContext?: string
  tone?: 'formal' | 'enthusiastic' | 'confident' | 'friendly'
  existingBody?: string
}

export function coverLetterGeneratePrompt(input: CoverLetterGenInput): string {
  const tone = input.tone ?? 'formal'
  return `Write a cover letter body for this application.

Tone: ${tone}
Job Title: ${input.jobTitle || '(unspecified)'}
Company: ${input.company || '(unspecified)'}
${input.candidateName ? `Candidate: ${input.candidateName}\n` : ''}${input.jobDescription ? `Job Description:\n${input.jobDescription}\n` : ''}${input.resumeContext ? `\nCandidate Background (use only what's here, do not invent):\n${input.resumeContext}\n` : ''}
Requirements:
- Start with "Dear [Hiring Manager Name]," on its own line.
- 3-4 paragraphs, 250-350 words total.
- Open with a concrete hook tied to the role or company — not "I am writing to apply".
- Middle paragraph(s): 2-3 specific achievements from the candidate background, mapped to what the job needs.
- Close with a short, confident next-step sentence, then a sign-off line ("Sincerely," or similar) on its own line.
- Do not use square-bracket placeholders in the final output; if a fact is missing, write around it naturally.`
}

export function coverLetterImprovePrompt(body: string, context?: string): string {
  return `Improve this cover letter. Keep the author's voice, but tighten prose, remove cliché phrases,
sharpen specificity, and make achievements measurable where the source material supports it.
Do not invent facts. Return the full rewritten letter only.
${context ? `\nContext: ${context}\n` : ''}
Current letter:
${body}`
}

export function coverLetterTonePrompt(body: string, tone: string): string {
  return `Rewrite this cover letter in a ${tone} tone. Preserve all factual content and structure.
Return only the rewritten letter.

${body}`
}

export function coverLetterShortenPrompt(body: string): string {
  return `Shorten this cover letter to about 200 words while keeping its strongest specific claims
and its greeting/sign-off. Return only the rewritten letter.

${body}`
}

export function jobMatchPrompt(resumeText: string, jobDescription: string): string {
  return `Analyze this resume against the job description and provide:
1. Match score (0-100)
2. Missing keywords (comma-separated)
3. Top 3 improvements

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond in JSON: {"score": number, "missingKeywords": string[], "improvements": string[]}`
}
