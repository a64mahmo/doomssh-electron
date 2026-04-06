// Single source of truth for date formatting across editor, preview, and PDF
import dayjs from 'dayjs'
import type { DateFormat } from '@/lib/store/types'

const FORMAT_MAP: Record<DateFormat, string> = {
  'MM/YYYY': 'MM/YYYY',
  'MMMM YYYY': 'MMMM YYYY',
  'YYYY': 'YYYY',
  'YYYY MMM DD': 'YYYY MMM DD',
  'MMM YYYY': 'MMM YYYY',
}

export function formatDate(date: string, format: DateFormat = 'MM/YYYY'): string {
  if (!date) return ''
  const parsed = dayjs(date)
  if (!parsed.isValid()) return date
  return parsed.format(FORMAT_MAP[format])
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  present: boolean,
  format: DateFormat = 'MM/YYYY'
): string {
  const start = formatDate(startDate, format)
  const end = present ? 'Present' : formatDate(endDate, format)
  if (!start && !end) return ''
  if (!start) return end
  if (!end) return start
  return `${start} – ${end}`
}

export function toInputDate(date: string): string {
  if (!date) return ''
  const parsed = dayjs(date)
  return parsed.isValid() ? parsed.format('YYYY-MM') : ''
}

export function fromInputDate(value: string): string {
  if (!value) return ''
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toISOString() : ''
}
