'use client'
import { useState, useCallback, useEffect } from 'react'
import { bulletPrompt, improvePrompt, summaryPrompt, interviewQuestionsPrompt, SYSTEM_INTERVIEW_COACH } from '@/lib/ai/prompts'
import { useUIStore } from '@/lib/store/uiStore'

// Detect Electron renderer — window.electron is injected by preload.ts
function getElectron() {
  if (typeof window !== 'undefined' && 'electron' in window) {
    return (window as unknown as { electron: ElectronBridge }).electron
  }
  return null
}

interface ElectronBridge {
  aiStream: (
    id: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxTokens: number,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (message: string) => void,
  ) => () => void
  getApiKey: () => Promise<string | null>
}

let reqCounter = 0
function nextId() { return `ai-${++reqCounter}-${Date.now()}` }

interface UseAIOptions {
  onChunk?: (chunk: string) => void
}

export function useAI({ onChunk }: UseAIOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean>(true) // optimistic default

  // Check API key availability on mount
  useEffect(() => {
    const electron = getElectron()
    if (electron) {
      electron.getApiKey().then(key => setHasApiKey(!!key))
    } else {
      setHasApiKey(false)
    }
  }, [])

  // ── IPC path (Electron) ────────────────────────────────────────────────────
  const streamViaIPC = useCallback(
    (messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens = 1024): Promise<string> => {
      return new Promise((resolve, reject) => {
        const electron = getElectron()
        if (!electron) { reject(new Error('Not in Electron')); return }
        let result = ''
        const id = nextId()
        electron.aiStream(
          id, messages, maxTokens,
          (text) => { result += text; onChunk?.(text) },
          () => resolve(result),
          (msg) => reject(new Error(msg)),
        )
      })
    },
    [onChunk],
  )

  // ── HTTP path (browser / dev server) ──────────────────────────────────────
  const streamViaHTTP = useCallback(
    async (endpoint: string, body: Record<string, unknown>): Promise<string> => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      let result = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content_block_delta' && data.delta?.text) {
                result += data.delta.text
                onChunk?.(data.delta.text)
              }
            } catch { /* ignore */ }
          }
        }
      }
      return result
    },
    [onChunk],
  )

  const run = useCallback(
    async (
      messages: Array<{ role: 'user' | 'assistant'; content: string }>,
      httpEndpoint: string,
      httpBody: Record<string, unknown>,
      maxTokens = 1024,
    ): Promise<string> => {
      setLoading(true)
      setError(null)
      try {
        return getElectron()
          ? await streamViaIPC(messages, maxTokens)
          : await streamViaHTTP(httpEndpoint, httpBody)
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err)
        const msg = raw.trim() || 'No API key configured. Add your Anthropic API key in Settings.'
        setError(msg)
        console.error('[AI]', msg)
        useUIStore.getState().addError(`AI Error: ${msg}`)
        throw new Error(msg)
      } finally {
        setLoading(false)
      }
    },
    [streamViaIPC, streamViaHTTP],
  )

  const generateBullets = useCallback(
    (jobTitle: string, company: string, responsibilities: string) =>
      run(
        [{ role: 'user', content: bulletPrompt(jobTitle, company, responsibilities) }],
        '/api/ai/bullets', { jobTitle, company, responsibilities },
      ),
    [run],
  )

  const improveText = useCallback(
    (text: string, context?: string) =>
      run(
        [{ role: 'user', content: improvePrompt(text, context) }],
        '/api/ai/improve', { text, context },
      ),
    [run],
  )

  const generateSummary = useCallback(
    (data: { name: string; jobTitle: string; yearsExperience: string; skills: string[]; highlights: string }) =>
      run(
        [{ role: 'user', content: summaryPrompt(data) }],
        '/api/ai/summary', data, 512,
      ),
    [run],
  )

  const generateInterviewQuestions = useCallback(
    (jobTitle: string, company: string, jobDescription: string, resumeContext?: string) =>
      run(
        [
          { role: 'user', content: interviewQuestionsPrompt(jobTitle, company, jobDescription, resumeContext) },
        ],
        '/api/ai/interview', { jobTitle, company, jobDescription, resumeContext },
        2048,
      ),
    [run],
  )

  return { loading, error, hasApiKey, generateBullets, improveText, generateSummary, generateInterviewQuestions }
}
