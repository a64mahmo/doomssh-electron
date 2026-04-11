import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { JobApplication, JobStore, JobStatus, JobContact, JobEvent } from '@/lib/store/jobTypes'
import {
  JOB_STATUS_LABELS,
} from '@/lib/store/jobTypes'
import { loadAllJobs as dbLoadAllJobs, saveAllJobs as dbSaveAllJobs } from '@/lib/db/jobDatabase'
import { generateId } from '@/lib/utils/ids'

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function scheduleSave(getState: () => { jobs: JobApplication[] }) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    dbSaveAllJobs(getState().jobs)
  }, 500)
}

export const useJobStore = create<JobStore>()(
  immer((set, get) => ({
    jobs: [],
    isLoaded: false,
    isDirty: false,

    loadJobs: async () => {
      const jobs = await dbLoadAllJobs()
      
      // Check for passed deadlines
      const today = new Date().toISOString().split('T')[0]
      let changed = false
      
      jobs.forEach(job => {
        if (job.deadlineDate && job.deadlineDate < today) {
          const alreadyAdded = job.events.some(e => e.type === 'deadline-passed')
          if (!alreadyAdded) {
            job.events.push({
              id: generateId(),
              type: 'deadline-passed',
              date: new Date().toISOString(),
              title: 'Deadline Passed',
              description: `Application deadline (${job.deadlineDate}) has passed.`,
            })
            job.updatedAt = Date.now()
            changed = true
          }
        }
      })

      if (changed) {
        dbSaveAllJobs(jobs)
      }

      set({ jobs, isLoaded: true, isDirty: false })
    },

    addJob: (partial) => {
      const now = Date.now()
      const job: JobApplication = {
        id: generateId(),
        company: '',
        role: '',
        status: 'wishlist',
        priority: 'medium',
        url: '',
        source: 'other',
        location: '',
        workMode: '',
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'USD',
        resumeId: null,
        coverLetter: '',
        notes: '',
        contacts: [],
        events: [{
          id: generateId(),
          type: 'status-change',
          date: new Date().toISOString(),
          title: 'Created',
          description: 'Job application created',
        }],
        appliedDate: new Date().toISOString().split('T')[0],
        responseDate: null,
        deadlineDate: null,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
        ...partial,
      }

      // Initial deadline check for added job
      const today = new Date().toISOString().split('T')[0]
      if (job.deadlineDate && job.deadlineDate < today) {
        job.events.push({
          id: generateId(),
          type: 'deadline-passed',
          date: new Date().toISOString(),
          title: 'Deadline Passed',
          description: `Application deadline (${job.deadlineDate}) was in the past.`,
        })
      }

      set((state) => {
        state.jobs.unshift(job)
        state.isDirty = true
        scheduleSave(get)
      })
    },

    updateJob: (jobId, updates) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return

        const autoEvents: JobEvent[] = []

        // Track status change
        if ('status' in updates && updates.status !== job.status) {
          const oldStatusLabel = JOB_STATUS_LABELS[job.status]
          const newStatusLabel = JOB_STATUS_LABELS[updates.status as JobStatus]
          autoEvents.push({
            id: generateId(),
            type: 'status-change',
            date: new Date().toISOString(),
            title: 'Status Updated',
            description: `Moved from ${oldStatusLabel} to ${newStatusLabel}`,
          })
        }

        // Track deadline change
        if ('deadlineDate' in updates && updates.deadlineDate !== job.deadlineDate) {
          const oldDeadline = job.deadlineDate || 'None'
          const newDeadline = updates.deadlineDate || 'None'
          autoEvents.push({
            id: generateId(),
            type: 'deadline-change',
            date: new Date().toISOString(),
            title: 'Deadline Updated',
            description: `Deadline changed from ${oldDeadline} to ${newDeadline}.`,
          })
        }

        Object.assign(job, updates, { updatedAt: Date.now() })
        
        // Re-append the automated events after the update (since updates might have its own events array)
        job.events.push(...autoEvents)

        // Check deadline if it was updated or if it just passed
        const today = new Date().toISOString().split('T')[0]
        if (job.deadlineDate && job.deadlineDate < today) {
          const alreadyAdded = job.events.some(e => e.type === 'deadline-passed')
          if (!alreadyAdded) {
            job.events.push({
              id: generateId(),
              type: 'deadline-passed',
              date: new Date().toISOString(),
              title: 'Deadline Passed',
              description: `Application deadline (${job.deadlineDate}) has passed.`,
            })
          }
        } else if (job.deadlineDate && job.deadlineDate >= today) {
          // Remove the event if the deadline was extended into the future
          job.events = job.events.filter(e => e.type !== 'deadline-passed')
        }

        state.isDirty = true
        scheduleSave(get)
      }),

    deleteJob: (jobId) =>
      set((state) => {
        state.jobs = state.jobs.filter((j) => j.id !== jobId)
        state.isDirty = true
        scheduleSave(get)
      }),

    archiveJob: (jobId) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        job.archivedAt = Date.now()
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    moveJob: (jobId, newStatus: JobStatus) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job || job.status === newStatus) return
        const oldStatus = job.status
        job.status = newStatus
        job.updatedAt = Date.now()
        job.events.push({
          id: generateId(),
          type: 'status-change',
          date: new Date().toISOString(),
          title: `Status changed`,
          description: `Moved from ${oldStatus} to ${newStatus}`,
        })
        // Auto-set appliedDate when moving to 'applied'
        if (newStatus === 'applied' && !job.appliedDate) {
          job.appliedDate = new Date().toISOString().split('T')[0]
        }
        // Auto-set responseDate on first interview stage
        if (['phone-screen', 'technical', 'onsite'].includes(newStatus) && !job.responseDate) {
          job.responseDate = new Date().toISOString().split('T')[0]
        }
        state.isDirty = true
        scheduleSave(get)
      }),

    addContact: (jobId, contact) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        job.contacts.push({ ...contact, id: generateId() })
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    updateContact: (jobId, contactId, updates) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        const contact = job.contacts.find((c) => c.id === contactId)
        if (!contact) return
        Object.assign(contact, updates)
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    removeContact: (jobId, contactId) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        job.contacts = job.contacts.filter((c) => c.id !== contactId)
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    addEvent: (jobId, event) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        job.events.push({ ...event, id: generateId() })
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    removeEvent: (jobId, eventId) =>
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId)
        if (!job) return
        job.events = job.events.filter((e) => e.id !== eventId)
        job.updatedAt = Date.now()
        state.isDirty = true
        scheduleSave(get)
      }),

    markSaved: () => set({ isDirty: false }),
  }))
)
