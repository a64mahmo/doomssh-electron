'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  value: string // Format: "YYYY-MM"
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

export function MonthYearPicker({ value, onChange, disabled, className }: Props) {
  const [year = '', month = ''] = (value || '').split('-')

  function handleYearChange(newYear: string) {
    onChange(newYear && month ? `${newYear}-${month}` : newYear ? `${newYear}-01` : '')
  }

  function handleMonthChange(newMonth: string) {
    onChange(year && newMonth ? `${year}-${newMonth}` : '')
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="flex-1">
        <Select value={month} onValueChange={handleMonthChange} disabled={disabled}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select value={year} onValueChange={handleYearChange} disabled={disabled}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
