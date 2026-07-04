import type { CalendarDateValue } from './calendar-date'
import { fromDate } from './calendar-date'

export type { CalendarDateValue }

export function parseDateValue(value: unknown): CalendarDateValue | null {
  if (!value) return null

  if (
    value &&
    typeof value === 'object' &&
    'year' in value &&
    'month' in value &&
    'day' in value
  ) {
    const obj = value as CalendarDateValue
    return { year: obj.year, month: obj.month, day: obj.day }
  }

  if (value instanceof Date) {
    return fromDate(value)
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return fromDate(date)
    }
  }

  if (typeof value === 'string') {
    const cleaned = value.trim()
    if (!cleaned) return null

    const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      const year = Number.parseInt(isoMatch[1], 10)
      const month = Number.parseInt(isoMatch[2], 10)
      const day = Number.parseInt(isoMatch[3], 10)
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return { year, month, day }
      }
    }

    const dateObj = new Date(cleaned)
    if (!Number.isNaN(dateObj.getTime())) {
      return fromDate(dateObj)
    }
  }

  return null
}
