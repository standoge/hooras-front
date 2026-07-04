import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addMonths,
  addYears,
  compareDates,
  today,
  type CalendarDateValue,
} from './calendar-date'

export interface CalendarGridProps {
  value: CalendarDateValue | null
  onChange: (date: CalendarDateValue) => void
  min?: CalendarDateValue | null
  max?: CalendarDateValue | null
  embedded?: boolean
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarGrid({ value, onChange, min, max, embedded = false }: CalendarGridProps) {
  const defaultDate = value || today()
  const [viewDate, setViewDate] = useState<CalendarDateValue>(defaultDate)

  const { year, month } = viewDate

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayIndex = new Date(year, month - 1, 1).getDay()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const gridCells: { date: CalendarDateValue; isCurrentMonth: boolean }[] = []

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevMonthDate =
      month === 1
        ? { year: year - 1, month: 12, day: daysInPrevMonth - i }
        : { year, month: month - 1, day: daysInPrevMonth - i }
    gridCells.push({ date: prevMonthDate, isCurrentMonth: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push({ date: { year, month, day: i }, isCurrentMonth: true })
  }

  const remainingCells = 42 - gridCells.length
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate =
      month === 12
        ? { year: year + 1, month: 1, day: i }
        : { year, month: month + 1, day: i }
    gridCells.push({ date: nextMonthDate, isCurrentMonth: false })
  }

  const isDateDisabled = (date: CalendarDateValue) => {
    if (min && compareDates(date, min) < 0) return true
    if (max && compareDates(date, max) > 0) return true
    return false
  }

  const isSelected = (date: CalendarDateValue) => {
    if (!value) return false
    return compareDates(date, value) === 0
  }

  const isToday = (date: CalendarDateValue) => compareDates(date, today()) === 0

  return (
    <div
      className={cn(
        'w-[300px] select-none text-foreground',
        embedded ? 'p-0' : 'rounded-lg border border-border bg-card p-2',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewDate((prev) => addYears(prev, -1))}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            title="Previous year"
            aria-label="Previous year"
          >
            <span className="text-[10px] font-bold">&lt;&lt;</span>
          </button>
          <button
            type="button"
            onClick={() => setViewDate((prev) => addMonths(prev, -1))}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <span className="text-sm font-medium tracking-wide text-primary">
          {MONTHS[month - 1]} {year}
        </span>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setViewDate((prev) => addMonths(prev, 1))}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewDate((prev) => addYears(prev, 1))}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            title="Next year"
            aria-label="Next year"
          >
            <span className="text-[10px] font-bold">&gt;&gt;</span>
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {DAYS_SHORT.map((d) => (
          <span
            key={d}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5" role="grid">
        {gridCells.map(({ date, isCurrentMonth }, idx) => {
          const disabled = isDateDisabled(date)
          const selected = isSelected(date)
          const todayItem = isToday(date)

          return (
            <button
              key={`${date.year}-${date.month}-${date.day}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(date)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !isCurrentMonth && 'text-muted-foreground',
                isCurrentMonth &&
                  !selected &&
                  !disabled &&
                  'text-foreground hover:bg-accent hover:text-primary',
                selected && 'bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-sm)]',
                todayItem && !selected && 'border border-primary/50 text-primary',
                disabled && 'cursor-not-allowed opacity-25 text-muted-foreground',
              )}
              role="gridcell"
              aria-selected={selected}
              aria-disabled={disabled}
            >
              {date.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
