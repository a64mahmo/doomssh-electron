import { describe, it, expect } from 'vitest'
import { formatSalary } from './utils'

describe('formatSalary', () => {
  it('returns ? for null or undefined', () => {
    expect(formatSalary(null)).toBe('?')
    expect(formatSalary(undefined)).toBe('?')
  })

  it('returns 0 for zero', () => {
    expect(formatSalary(0)).toBe('0')
  })

  it('returns literal string for values less than 1000', () => {
    expect(formatSalary(500)).toBe('500')
    expect(formatSalary(1)).toBe('1')
    expect(formatSalary(999)).toBe('999')
  })

  it('returns k format for thousands', () => {
    expect(formatSalary(1000)).toBe('1k')
    expect(formatSalary(50000)).toBe('50k')
    expect(formatSalary(100000)).toBe('100k')
  })

  it('returns k format with one decimal for non-round thousands', () => {
    expect(formatSalary(1500)).toBe('1.5k')
    expect(formatSalary(85500)).toBe('85.5k')
  })
})
