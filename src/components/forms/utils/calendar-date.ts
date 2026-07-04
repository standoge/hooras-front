export interface CalendarDateValue {
  year: number
  month: number
  day: number
}

export function toDateString(date: CalendarDateValue): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

export function fromDate(d: Date): CalendarDateValue {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  }
}

export function today(): CalendarDateValue {
  return fromDate(new Date())
}

export function compareDates(a: CalendarDateValue, b: CalendarDateValue): number {
  const da = new Date(a.year, a.month - 1, a.day).getTime()
  const db = new Date(b.year, b.month - 1, b.day).getTime()
  return da - db
}

export function addMonths(date: CalendarDateValue, months: number): CalendarDateValue {
  const d = new Date(date.year, date.month - 1 + months, 1)
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: Math.min(date.day, daysInMonth),
  }
}

export function addYears(date: CalendarDateValue, years: number): CalendarDateValue {
  return addMonths({ ...date, year: date.year + years }, 0)
}
