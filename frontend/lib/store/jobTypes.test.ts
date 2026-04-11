import { describe, it, expect } from 'vitest'
import {
  JOB_STATUS_CONFIG,
  JOB_SOURCE_LABELS,
  JOB_PRIORITY_LABELS,
  JOB_STATUS_LABELS,
  WORK_MODE_LABELS,
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
} from './jobTypes'
import type { JobStatus, JobSource, JobPriority } from './jobTypes'

describe('jobTypes constants', () => {
  describe('JOB_STATUS_CONFIG', () => {
    it('has exactly 10 statuses', () => {
      expect(JOB_STATUS_CONFIG).toHaveLength(10)
    })

    it('each status has label and color', () => {
      JOB_STATUS_CONFIG.forEach((cfg) => {
        expect(cfg.status).toBeTruthy()
        expect(cfg.label).toBeTruthy()
        expect(cfg.color).toBeTruthy()
      })
    })

    it('no duplicate statuses', () => {
      const statuses = JOB_STATUS_CONFIG.map((c) => c.status)
      expect(new Set(statuses).size).toBe(statuses.length)
    })
  })

  describe('ACTIVE_STATUSES + TERMINAL_STATUSES', () => {
    it('cover all 10 statuses without overlap', () => {
      const combined = [...ACTIVE_STATUSES, ...TERMINAL_STATUSES]
      const allStatuses = JOB_STATUS_CONFIG.map((c) => c.status)
      expect(combined.sort()).toEqual(allStatuses.sort())
      // No overlap
      const overlap = ACTIVE_STATUSES.filter((s) => TERMINAL_STATUSES.includes(s))
      expect(overlap).toHaveLength(0)
    })

    it('ACTIVE_STATUSES has expected pipeline order', () => {
      expect(ACTIVE_STATUSES).toEqual([
        'wishlist', 'applied', 'phone-screen', 'technical', 'onsite', 'offer',
      ])
    })

    it('TERMINAL_STATUSES has expected values', () => {
      expect(TERMINAL_STATUSES).toEqual(['accepted', 'rejected', 'withdrawn', 'ghosted'])
    })
  })

  describe('JOB_SOURCE_LABELS', () => {
    it('has 9 sources', () => {
      expect(Object.keys(JOB_SOURCE_LABELS)).toHaveLength(9)
    })

    it('each source has human-readable label', () => {
      Object.values(JOB_SOURCE_LABELS).forEach((label) => {
        expect(label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('JOB_STATUS_LABELS', () => {
    it('maps all statuses to labels', () => {
      const allStatuses: JobStatus[] = [...ACTIVE_STATUSES, ...TERMINAL_STATUSES]
      allStatuses.forEach((s) => {
        expect(JOB_STATUS_LABELS[s]).toBeTruthy()
      })
    })
  })

  describe('JOB_PRIORITY_LABELS', () => {
    it('has low, medium, high', () => {
      expect(JOB_PRIORITY_LABELS).toEqual({
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      })
    })
  })

  describe('WORK_MODE_LABELS', () => {
    it('includes empty string for unspecified', () => {
      expect(WORK_MODE_LABELS['']).toBe('Not specified')
    })

    it('has remote, hybrid, onsite', () => {
      expect(WORK_MODE_LABELS['remote']).toBe('Remote')
      expect(WORK_MODE_LABELS['hybrid']).toBe('Hybrid')
      expect(WORK_MODE_LABELS['onsite']).toBe('On-site')
    })
  })
})
