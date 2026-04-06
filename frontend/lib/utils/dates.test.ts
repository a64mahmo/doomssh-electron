import { describe, it, expect } from 'vitest'
import { formatDate, formatDateRange, toInputDate, fromInputDate } from './dates'

describe('date utilities', () => {
  describe('formatDate', () => {
    it('formats a valid date string', () => {
      expect(formatDate('2024-04-06', 'MMM YYYY')).toBe('Apr 2024')
      expect(formatDate('2024-04-06', 'YYYY')).toBe('2024')
    })

    it('returns the input if the date is invalid', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date')
    })

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatDateRange', () => {
    it('formats a complete date range', () => {
      const start = '2023-01-01'
      const end = '2024-01-01'
      expect(formatDateRange(start, end, false, 'MMM YYYY')).toBe('Jan 2023 – Jan 2024')
    })

    it('formats a range with "Present"', () => {
      const start = '2023-01-01'
      expect(formatDateRange(start, '', true, 'MMM YYYY')).toBe('Jan 2023 – Present')
    })

    it('returns only start date if end is missing and not present', () => {
      const start = '2023-01-01'
      expect(formatDateRange(start, '', false, 'MMM YYYY')).toBe('Jan 2023')
    })

    it('returns empty string for empty inputs', () => {
      expect(formatDateRange('', '', false)).toBe('')
    })
  })

  describe('toInputDate', () => {
    it('converts ISO date to YYYY-MM format for HTML input', () => {
      expect(toInputDate('2024-04-06T12:00:00Z')).toBe('2024-04')
    })

    it('returns empty string for invalid dates', () => {
      expect(toInputDate('invalid')).toBe('')
    })
  })

  describe('fromInputDate', () => {
    it('converts YYYY-MM input value to ISO string', () => {
      const result = fromInputDate('2024-04')
      expect(result).toContain('2024-04')
      expect(new Date(result).toISOString()).toBeDefined()
    })

    it('returns empty string for empty input', () => {
      expect(fromInputDate('')).toBe('')
    })
  })
})
