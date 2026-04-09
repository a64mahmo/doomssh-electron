import { BuilderClient } from './BuilderClient'

export function generateStaticParams() {
  return [{ resumeId: 'new' }]
}

export default function BuilderPage() {
  return <BuilderClient />
}
