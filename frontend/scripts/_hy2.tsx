import path from 'node:path'
import React from 'react'
import { Document, Page, Text, View, Font, renderToFile } from '@react-pdf/renderer'
const OUT = '/private/tmp/claude-501/-Users-abdallhmahmood-dev-doomssh/d12c2cf3-ca1a-4841-9f19-fad995f01479/scratchpad'
const P = path.join(process.cwd(), 'public')
Font.register({ family: 'Inter', fonts: [{ src: path.join(P, 'fonts/inter-latin-400-normal.woff') }] })

// split after separators, then hard-chunk anything still too long
function chunk(word: string): string[] {
  if (word.length <= 16) return [word]
  const parts = word.split(/(?<=[-–—_/.,])/)
  const out: string[] = []
  for (const p of parts) {
    if (p.length <= 16) { out.push(p); continue }
    for (let i = 0; i < p.length; i += 14) out.push(p.slice(i, i + 14))
  }
  return out
}
Font.registerHyphenationCallback(chunk)

renderToFile(
  <Document><Page size="A4" style={{ padding: 20, fontFamily: 'Inter' }}>
    <View style={{ width: 120, borderWidth: 0.5 }}>
      <Text style={{ fontSize: 9 }}>Kitchener–Waterloo–Cambridge Regional Municipality</Text>
      <Text style={{ fontSize: 9 }}>Internationalization-and-Localization-Infrastructure-Pipeline</Text>
      <Text style={{ fontSize: 9 }}>https://www.example.com/portfolio/very-long-path-segment</Text>
    </View>
  </Page></Document>, `${OUT}/hy2.pdf`).then(() => console.log('ok'))
