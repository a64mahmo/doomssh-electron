import { Suspense } from 'react'
import { PrintClient } from './PrintClient'

export function generateStaticParams() {
  return [{ resumeId: 'new' }]
}

export default function PrintPage({ params }: { params: Promise<{ resumeId: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: 32, fontFamily: 'sans-serif' }}>Loading…</div>}>
      <PrintClient params={params} />
    </Suspense>
  )
}
