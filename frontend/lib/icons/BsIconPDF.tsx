import React from 'react'
import { Svg, Path } from '@react-pdf/renderer'
import { BOOTSTRAP_ICONS } from './bootstrapIcons'

interface BsIconPDFProps {
  name: string
  size?: number
  color?: string
}

/**
 * Renders a Bootstrap Icon inside a react-pdf document.
 * Uses fill-based rendering (Bootstrap Icons are fill icons).
 */
export function BsIconPDF({ name, size = 10, color = '#000000' }: BsIconPDFProps) {
  const paths = BOOTSTRAP_ICONS[name]
  if (!paths) return null

  return (
    <Svg viewBox="0 0 16 16" width={size} height={size}>
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  )
}
