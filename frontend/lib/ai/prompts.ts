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
