import { Suspense } from 'react'
import { BuilderClient } from './BuilderClient'

export function generateStaticParams() {
  return [{ resumeId: 'new' }]
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
      <BuilderClient />
    </Suspense>
  )
}

