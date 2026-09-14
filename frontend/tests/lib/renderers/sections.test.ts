import { describe, it, expect } from 'vitest'
import { getSectionViewModel } from '@/lib/renderers'
import { formatDateRange } from '@/lib/utils/dates'
import { DEFAULT_SETTINGS } from '@/lib/store/types'
import type { ResumeSection, SectionType } from '@/lib/store/types'

// Items are shaped exactly as the editor sections write them.
const section = (type: SectionType, items: unknown[]): ResumeSection =>
  ({ id: type, type, title: type, visible: true, items }) as ResumeSection

const ctx = { settings: DEFAULT_SETTINGS, helpers: { formatDate: formatDateRange, pt: (n: number | string) => `${n}pt` } }

describe('section view models read the fields the editor writes', () => {
  it('awards use title and date', () => {
    const vm = getSectionViewModel(section('awards', [
      { id: 'a', title: 'Best Paper', issuer: 'ACM', date: '2024-05', description: '' },
    ]), ctx)
    expect(vm.items[0].primaryText).toBe('Best Paper')
    expect(vm.items[0].dateRange).toBeTruthy()
  })

  it('volunteering uses role', () => {
    const vm = getSectionViewModel(section('volunteering', [
      { id: 'v', organization: 'Red Cross', role: 'Coordinator', startDate: '2022-01', endDate: '', present: true, description: '' },
    ]), ctx)
    expect(vm.items[0].primaryText).toBe('Coordinator')
    expect(vm.items[0].secondaryText).toBe('Red Cross')
  })

  it('certifications and publications show their single date', () => {
    const cert = getSectionViewModel(section('certifications', [
      { id: 'c', name: 'CKA', issuer: 'CNCF', date: '2023-02', url: '' },
    ]), ctx)
    const pub = getSectionViewModel(section('publications', [
      { id: 'p', title: 'Paper', publisher: 'IEEE', date: '2021-07', url: '', description: '' },
    ]), ctx)
    expect(cert.items[0].dateRange).toBeTruthy()
    expect(pub.items[0].dateRange).toBeTruthy()
  })

  it('references expose name and position', () => {
    const vm = getSectionViewModel(section('references', [
      { id: 'r', name: 'Ada Lovelace', company: 'Analytical Engines', position: 'Director', email: 'ada@example.com', phone: '' },
    ]), ctx)
    expect(vm.items[0].primaryText).toBe('Ada Lovelace')
    expect(vm.items[0].secondaryText).toBe('Director')
    expect(vm.items[0].company).toBe('Analytical Engines')
  })

  it('older items saved with legacy keys still render', () => {
    const awards = getSectionViewModel(section('awards', [{ id: 'a', name: 'Legacy Award', issuer: '', startDate: '2020-01' }]), ctx)
    const vol = getSectionViewModel(section('volunteering', [{ id: 'v', organization: 'Org', position: 'Legacy Role' }]), ctx)
    expect(awards.items[0].primaryText).toBe('Legacy Award')
    expect(vol.items[0].primaryText).toBe('Legacy Role')
  })
})
