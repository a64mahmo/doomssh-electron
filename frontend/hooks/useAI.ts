'use client'
import { useState, useCallback, useEffect } from 'react'
import {
  bulletPrompt, improvePrompt, summaryPrompt, interviewQuestionsPrompt, SYSTEM_INTERVIEW_COACH,
  coverLetterGeneratePrompt, coverLetterImprovePrompt, coverLetterTonePrompt, coverLetterShortenPrompt,
  type CoverLetterGenInput,
} from '@/lib/ai/prompts'
import { useUIStore } from '@/lib/store/uiStore'
import { isElectron } from '@/lib/platform'

/**
 * AI runs only in the desktop app: the Anthropic key lives in the OS keychain
 * and requests go through the main process. The browser build has neither, so
 * every AI control is hidden there and `run` refuses as a backstop.
 */
export const aiAvailable = (): boolean => isElectron()

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
    if (electron && aiAvailable()) {
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

  const run = useCallback(
    async (
      messages: Array<{ role: 'user' | 'assistant'; content: string }>,
      maxTokens = 1024,
    ): Promise<string> => {
      if (!aiAvailable()) throw new Error('AI features are only available in the desktop app')
      setLoading(true)
      setError(null)
      try {
        return await streamViaIPC(messages, maxTokens)
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
    [streamViaIPC],
  )

  const generateBullets = useCallback(
    (jobTitle: string, company: string, responsibilities: string) =>
      run(
        [{ role: 'user', content: bulletPrompt(jobTitle, company, responsibilities) }],
      ),
    [run],
  )

  const improveText = useCallback(
    (text: string, context?: string) =>
      run(
        [{ role: 'user', content: improvePrompt(text, context) }],
      ),
    [run],
  )

  const generateSummary = useCallback(
    (data: { name: string; jobTitle: string; yearsExperience: string; skills: string[]; highlights: string }) =>
      run(
        [{ role: 'user', content: summaryPrompt(data) }],
        512,
      ),
    [run],
  )

  const generateInterviewQuestions = useCallback(
    (jobTitle: string, company: string, jobDescription: string, resumeContext?: string) =>
      run(
        [
          { role: 'user', content: interviewQuestionsPrompt(jobTitle, company, jobDescription, resumeContext) },
        ],
        2048,
      ),
    [run],
  )

  const generateCoverLetter = useCallback(
    (input: CoverLetterGenInput) =>
      run(
        [{ role: 'user', content: coverLetterGeneratePrompt(input) }],
        1536,
      ),
    [run],
  )

  const improveCoverLetter = useCallback(
    (body: string, context?: string) =>
      run(
        [{ role: 'user', content: coverLetterImprovePrompt(body, context) }],
        1536,
      ),
    [run],
  )

  const rewriteCoverLetterTone = useCallback(
    (body: string, tone: string) =>
      run(
        [{ role: 'user', content: coverLetterTonePrompt(body, tone) }],
        1536,
      ),
    [run],
  )

  const shortenCoverLetter = useCallback(
    (body: string) =>
      run(
        [{ role: 'user', content: coverLetterShortenPrompt(body) }],
        1024,
      ),
    [run],
  )

  return {
    loading, error, hasApiKey,
    generateBullets, improveText, generateSummary, generateInterviewQuestions,
    generateCoverLetter, improveCoverLetter, rewriteCoverLetterTone, shortenCoverLetter,
  }
}
