import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_RESUME_WRITER, summaryPrompt } from '@/lib/ai/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const body = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('AI features require ANTHROPIC_API_KEY in .env.local', { status: 503 })
  }

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: SYSTEM_RESUME_WRITER,
    messages: [{ role: 'user', content: summaryPrompt(body) }],
  })

  return new Response(stream.toReadableStream())
}
