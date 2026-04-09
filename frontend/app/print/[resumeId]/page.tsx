import { PrintClient } from './PrintClient'

export function generateStaticParams() {
  return [{ resumeId: 'new' }]
}

export default function PrintPage({ params }: { params: Promise<{ resumeId: string }> }) {
  return <PrintClient params={params} />
}
