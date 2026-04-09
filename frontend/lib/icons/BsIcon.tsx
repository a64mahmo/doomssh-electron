import React from 'react'
import { BOOTSTRAP_ICONS } from './bootstrapIcons'

interface BsIconProps {
  name: string
  size?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders a Bootstrap Icon as an inline SVG.
 * Works in both the HTML template preview and the editor UI.
 */
export function BsIcon({ name, size = 16, color = 'currentColor', className, style }: BsIconProps) {
  const paths = BOOTSTRAP_ICONS[name]
  if (!paths) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 16 16"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
